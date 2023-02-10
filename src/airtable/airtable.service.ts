import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AirtableService {
  private url = `https://api.airtable.com/v0`;

  constructor(private readonly http: HttpService) {}

  /**
   * getRecords retrieves the records of a table.
   *
   * @param baseId The id of the base.
   * @param tableId The id of the table.
   * @param token The API key for the Airtable API.
   *
   * @returns A Promise that resolves to the response of the API request.
   */
  getRecords(baseId: string, tableId: string, token: string) {
    const url = `${this.url}/${baseId}/${tableId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(url, { headers });
  }

  /**
   * getView retrieves a view of a table.
   *
   * @param baseId The id of the base.
   * @param tableId The id of the table.
   * @param viewId The id of the view.
   * @param token The API key for the Airtable API.
   *
   * @returns A Promise that resolves to the response of the API request.
   */
  getView(baseId: string, tableId: string, viewId: string, token: string) {
    const url = `${this.url}/${baseId}/${tableId}?view=${viewId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.http.get(url, { headers });
  }

  /**
   * patchAirtable updates one or multiple records in a table.
   *
   * @param promises An array of objects containing the id, field and value of the record(s) to update.
   * @param baseId The id of the base.
   * @param tableId The id of the table.
   * @param viewId The id of the view.
   * @param token The API key for the Airtable API.
   *
   * @returns void
   */
  patchAirtable(
    promises: Array<any>,
    baseId: string,
    tableId: string,
    viewId: string,
    token: string,
  ) {
    console.log('patching airtable...');
    // patch one record
    // TODO: patch multiple records
    console.log(promises[0]);
    const id: string = promises[0].id;
    const field: string = promises[0].field;
    const value: string = promises[0].value.toString();

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}/${id}`;
    console.log(url);
    const options = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id: id,
            fields: {
              [field]: value,
            },
          },
        ],
      }),
    };
    this.getView(baseId, tableId, viewId, token).subscribe(res => {
      console.log('checking field exist...');
      console.log(res.data.records.map(record => record.fields));
      const fields = res.data.records.map(record => record.fields);
      if (Object.keys(fields).includes(field)) {
        console.log('field exist, patching...');
        this.http.patch(url, options).subscribe(res => {
          console.log(res);
        });
      } else {
        console.log('field not exist, creating...');
        this.createField(baseId, tableId, field, token);
      }
    });
  }

  /**
   * createField creates a new field in a table.
   *
   * @param baseId The id of the base.
   * @param tableId The id of the table.
   * @param field The name of the field to create.
   * @param token The API key for the Airtable API.
   *
   * @returns void
   */
  createField(baseId: string, tableId: string, field: string, token: string) {
    console.log('creating field...');
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/fields`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const body = JSON.stringify({
      fields: {
        name: field,
        type: 'singleLineText',
      },
    });

    this.http.post(url, body, { headers }).subscribe(res => {
      console.log(res);
    });
  }
}
