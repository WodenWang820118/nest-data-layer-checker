import { Observable, map, tap } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { AirtableService } from '../airtable/airtable.service';

/**
 * DataLayerCheckerService
 * A service class to check the data layer and update records with the examination results.
 */
@Injectable()
export class DataLayerCheckerService {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly airtableService: AirtableService,
  ) {}

  /**
   * examination results
   * @param {Observable<any[]>} records - an Observable of records to be examined
   * @returns the updated records with the examination results.
   */
  examinationResults(records: Observable<any[]>) {
    return records.pipe(
      map(async records => {
        for (const record of records) {
          if (!record.url || !record.codeSpecs) {
            record.fields['Code Spec Match'] = false.toString();
          } else if (record.codeSpecs.startsWith('window')) {
            const actualDataLayer =
              await this.puppeteerService.initGetDataLayerOperation(record.url);
            const result = this.examineDataLayer(
              record.codeSpecs,
              actualDataLayer,
            );
            record.fields['Code Spec Match'] = result.toString();
          } else {
            record.fields['Code Spec Match'] = (
              this.examineDataAttributes(record) || false
            ).toString();
          }
        }
        return records;
      }),
    );
  }

  /**
   * examineDataAttributes
   * @param {Object} testCase - a test case object with properties "url" and "codeSpecs"
   * @returns the examination result of the data attributes.
   */
  examineDataAttributes(testCase: { url: string; codeSpecs: string }) {
    return false;
  }

  /**
   * examineDataLayer
   * @param {string} dataLayerSpec - the code specifications for the data layer
   * @param {Array<any>} actualDataLayer - the actual data layer
   * @returns the examination result of the data layer
   */
  examineDataLayer(dataLayerSpec: string, actualDataLayer: Array<any>) {
    let parsedSpecs = dataLayerSpec
      .replace(/\$/g, '')
      .split('(')[1]
      .split(')')[0];
    parsedSpecs = JSON.parse(parsedSpecs);
    const specsKeys = Object.keys(parsedSpecs);
    const actualDataKeys = Object.keys(actualDataLayer);
    const hasPassed = specsKeys.every(key => actualDataKeys.includes(key));
    return hasPassed;
  }

  /**
   * checkCodeSpecsAndUpdateRecords
   * @param {string} baseId - the base ID for the Airtable API
   * @param {string} tableId - the table ID for the Airtable API
   * @param {string} token - the API token for the Airtable API
   * @returns void
   */
  checkCodeSpecsAndUpdateRecords(
    baseId: string,
    tableId: string,
    token: string,
  ) {
    const records: Observable<any> = this.airtableService.getRecords(
      baseId,
      tableId,
      token,
    );
    const examineResults = this.examinationResults(
      records.pipe(
        map(
          (response: { data: { records: object[] } }) => response.data.records,
        ),
      ),
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
          const batches = this.chunk(await results, 10);

          // Update the records in batches
          for (const batch of batches) {
            this.airtableService
              .updateRecords(baseId, tableId, batch, token)
              .subscribe(res => {
                console.log('res: ', res.status);
              });
          }
        }),
      )
      .subscribe();
  }

  chunk(array: any[], chunkSize: number) {
    return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, i) =>
      array.slice(i * chunkSize, i * chunkSize + chunkSize),
    );
  }
}
