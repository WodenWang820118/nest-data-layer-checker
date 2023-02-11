import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { from, catchError, of } from 'rxjs';

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
   * Updates one or multiple records in a table.
   *
   * @param baseId The id of the base.
   * @param tableId The id of the table.
   * @param records An array of objects containing the id, field and value of the record(s) to update.
   * @param token The API key for the Airtable API.
   *
   * @returns An Observable of the HTTP response from the Airtable API.
   */
  updateRecords(
    baseId: string,
    tableId: string,
    records: Array<any>,
    token: string,
  ) {
    // Build the URL for the API request.
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const codeSpecMatch = records.map(record => {
      return {
        id: record.id,
        fields: {
          'Code Spec Match': record.fields['Code Spec Match'],
        },
      };
    });

    // Build the headers for the API request.
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Build the request body.
    const body = JSON.stringify({
      records: codeSpecMatch,
      typecast: true,
    });

    // Make the API request and return the result as an observable.
    return from(
      this.http
        .patch(url, body, { headers })
        .pipe(catchError(error => of(error))),
    );
  }
}
