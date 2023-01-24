import { Observable, map } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { HttpService } from '@nestjs/axios';
import { AirtableService } from '../airtable/airtable.service';

@Injectable()
export class DataLayerCheckerService {
  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly airtableService: AirtableService,
    private readonly http: HttpService,
  ) {}

  constructSpecsPipe(viewData: Observable<any>) {
    return viewData.pipe(
      map((response: { data: { records: object[] } }) => {
        return response.data.records.map((x: { id: any; fields: any }) => {
          return {
            id: x.id,
            fields: x.fields,
          };
        });
      }),
    );
  }
  // TODO: get actual data layer or data attribute from testing url with puppeteer
  // TODO: compare specs and actual data; update airtable with result

  // TODO: one kind of data layer specs
  // window.datalayer.push({
  //   "event": "ad_impression",
  //   "promotion_name": "${promotion_name}",
  //   "promotion_id": "${promotion_id}"
  // };)
  // TODO: another kind of data layer specs
  // data-event-id= "join_group"
  // data-page_name="${page_name}"
  // data-page_path="${page_path}"
  // data-client_id="${client_id}"
  // data-user_id="${user_id}"
  async updateExaminationResults(
    viewDataPipe: Observable<{ id: string; fields: any }[]>,
    baseId: string,
    tableId: string,
    viewId: string,
    token: string,
  ) {
    const promises = [];
    viewDataPipe.subscribe(async (records: { id: string; fields: any }[]) => {
      // console.log(records);
      const testCases: { id: string; url: string; codeSpecs: string }[] =
        records.map((record: { id: string; fields: { [x: string]: any } }) => {
          return {
            id: record.id,
            url: record.fields['URL'] ? record.fields['URL'] : '',
            codeSpecs: record.fields['Code Specs'],
          };
        });
      // console.log(testCases);

      for (const testCase of testCases) {
        if (!testCase.url || !testCase.codeSpecs) {
          promises.push(
            Promise.resolve({
              id: testCase.id,
              field: 'Checking result',
              value: false,
            }),
          );
        } else if (testCase.codeSpecs.startsWith('window')) {
          const actualDataLayer =
            await this.puppeteerService.initGetDataLayerOperation(testCase.url);
          const result = this.examineDataLayer(
            testCase.codeSpecs,
            actualDataLayer,
          );
          promises.push(
            Promise.resolve({
              id: testCase.id,
              field: 'Checking result',
              value: result,
            }),
          );
        } else {
          promises.push(
            Promise.resolve({
              id: testCase.id,
              field: 'Checking result',
              value: this.examineDataAttributes(testCase),
            }),
          );
        }
      }
      this.airtableService.patchAirtable(
        await Promise.all(promises),
        baseId,
        tableId,
        viewId,
        token,
      );
    });
  }

  examineDataAttributes(testCase: { url: string; codeSpecs: string }) {
    return false;
  }
  examineDataLayer(dataLayerSpec: string, actualDataLayer: Array<any>) {
    // TODO: temporary solution, there's a wrong format of data layer specs
    let parsedSpecs = dataLayerSpec
      .replace(/\$/g, '')
      .split('(')[1]
      .split(';')[0];
    parsedSpecs = JSON.parse(parsedSpecs);
    // console.log(`parsedSpecs: `, JSON.stringify(parsedSpecs));
    // console.log(`actualDataLayer: `, JSON.stringify(actualDataLayer));
    const specsKeys = Object.keys(parsedSpecs);
    const actualDataKeys = Object.keys(actualDataLayer);
    const hasPassed = specsKeys.every(key => actualDataKeys.includes(key));
    return hasPassed;
  }
}
