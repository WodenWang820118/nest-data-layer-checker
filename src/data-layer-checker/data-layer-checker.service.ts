import { Observable, map, tap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { AirtableService } from '../airtable/airtable.service';
import { GtmOperatorService } from '../gtm-operator/gtm-operator.service';
import { ExtractOperation } from '../interfaces/getOperation.interface';
import { chunk } from '../utils/util';

/**
 * DataLayerCheckerService
 * A service class to check the data layer and update records with the examination results.
 */
@Injectable()
export class DataLayerCheckerService implements ExtractOperation {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly airtableService: AirtableService,
    private readonly gtmOperatorService: GtmOperatorService,
  ) {}

  // TODO: refactor this method to fetch the records from the AirtableService
  getOperationJson(title: string) {
    return this.puppeteerService.getOperationJson(title);
  }

  examineResults(records: Observable<any[]>, fieldName: string) {
    return records.pipe(
      map(async records => {
        for (const record of records) {
          // two cases: 1. operation 2. url
          if (
            !record.fields['Recording'] &&
            !record.fields['Code Specs'] &&
            !record.fields['URL']
          ) {
            record.fields[`${fieldName}`] = false.toString();
          } else if (record.fields['Recording']) {
            console.log('using recording');
            console.log('recording', record.fields['Recording']);
            try {
              const request = JSON.parse(record.fields['Recording']);
              const actualDataLayer =
                await this.puppeteerService.performActionAndGetDataLayer(
                  request,
                );
              const result = this.examineSpecs(
                record.fields['Code Specs'],
                actualDataLayer,
              );
              record.fields[`${fieldName}`] = result.toString();
            } catch (error) {
              console.log('error', error);
              record.fields[`${fieldName}`] = false.toString();
            }
          } else if (record.fields['URL']) {
            console.log('using url');
            console.log('url', record.fields['URL']);
            try {
              const actualDataLayer =
                await this.puppeteerService.initGetDataLayerOperation(
                  record.fields['URL'],
                );
              const result = this.examineSpecs(
                record.fields['Code Specs'],
                actualDataLayer,
              );
              record.fields[`${fieldName}`] = result.toString();
            } catch (error) {
              console.log('error', error);
              record.fields[`${fieldName}`] = false.toString();
            }
          }
        }
        return records;
      }),
    );
  }

  examineSpecs(specs: string, actualDataLayer: any[]) {
    if (specs.includes('dataLayer')) {
      return this.examineDataLayer(specs, actualDataLayer);
    } else if (specs.includes('dataAttributes')) {
      return this.examineDataAttributes(specs, actualDataLayer);
    }
  }

  examineDataAttributes(dataLayerSpec: string, actualDataLayer: Array<any>) {
    // TODO: Implement this function
    return false;
  }

  /**
   * examineDataLayer
   * @param {string} dataLayerSpec - the code specifications for the data layer
   * @param {Array<any>} actualDataLayer - the actual data layer
   * @returns the examination result of the data layer
   */
  examineDataLayer(dataLayerSpec: string, actualDataLayer: Array<any>) {
    // console.log('actualDataLayer', actualDataLayer);
    let parsedSpecs = dataLayerSpec
      .replace(/\$/g, '')
      .split('(')[1]
      .split(')')[0];
    parsedSpecs = JSON.parse(parsedSpecs);
    console.log('parsedSpecs', parsedSpecs);
    const hasPassed = this.validateDataLayerWithSpecs(
      parsedSpecs,
      actualDataLayer,
    );
    console.log('hasPassed', hasPassed);
    return hasPassed;
  }

  validateDataLayerWithSpecs(specData: string, data: any[]) {
    const specs = Object.keys(specData);
    const matchingDataObj = data.find(ele =>
      Object.keys(ele).some(key => specs.includes(key)),
    );
    return matchingDataObj
      ? this.validateSchema(specData, matchingDataObj)
      : false;
  }

  validateSchema(specObj, dataObj) {
    console.log('specObj', specObj, 'dataObj', dataObj);
    if (Array.isArray(specObj)) {
      // only check the first element of the array
      const nestedSpecs = Object.keys(specObj[0]);
      const data = Object.keys(dataObj[0]);

      for (let spec of nestedSpecs) {
        // console.log(spec, data);
        this.validateSchema(spec, data);
      }
    } else if (typeof specObj === 'object') {
      const nestedSpecs = Object.keys(specObj);
      const actualKeys = Object.keys(dataObj);

      for (let spec of nestedSpecs) {
        console.log('spec', spec, 'actualKeys', actualKeys);
        if (typeof specObj[spec] === 'object' || Array.isArray(specObj[spec])) {
          this.validateSchema(specObj[spec], dataObj[spec]);
        }
        if (!actualKeys.includes(spec)) return false;
      }
    } else {
      // neither array nor object
      return dataObj === specObj;
    }

    return true;
  }

  /**
   * checkCodeSpecsAndUpdateRecords
   * @param {string} baseId - the base ID for the Airtable API
   * @param {string} tableId - the table ID for the Airtable API
   * @param {string} fieldName - the field name to update {Code Spec Match
   * @param {string} token - the API token for the Airtable API
   * @returns void
   */
  checkCodeSpecsAndUpdateRecords(
    baseId: string,
    tableId: string,
    fieldName: string,
    token: string,
  ) {
    const records: Observable<any> = this.airtableService.getRecords(
      baseId,
      tableId,
      token,
    );
    const examineResults = this.examineResults(
      records.pipe(
        map(
          (response: { data: { records: object[] } }) => response.data.records,
        ),
      ),
      fieldName,
    );
    examineResults
      .pipe(
        tap(async results => {
          // console.log('results: ', results);
          // If there are no records, return an error
          if (!results) {
            return Error('No records found');
          }

          // Split the results into batches of 10
          const batches = chunk(await results, 10);

          // Update the records in batches
          for (const batch of batches) {
            this.airtableService
              .updateCodeSpecRecords(baseId, tableId, batch, fieldName, token)
              .subscribe(res => {
                console.log('res: ', res.status);
              });
          }
        }),
      )
      .subscribe();
  }

  async checkCodeSpecsViaGtm(gtmUrl: string, title: string) {
    // await this.gtmOperatorService.goToPageViaGtm(gtmUrl, '', 'false');
    const { browser, page } = await this.gtmOperatorService.goToPageViaGtm(
      gtmUrl,
      '',
      'false',
    );
    // const page = await this.gtmOperatorService.locateTestingPage();
    // TODO: should grab operation data from Airtable
    const operation = this.getOperationJson(title);
    await this.puppeteerService.performOperationViaGtm(page, operation);
  }
}
