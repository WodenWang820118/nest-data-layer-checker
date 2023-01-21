import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AirtableService {
  private url = `https://api.airtable.com/v0`;

  constructor(private readonly httpService: HttpService) {}

  getRecords(baseId: string, tableId: string, token: string) {
    const url = `${this.url}/${baseId}/${tableId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService.get(url, { headers });
  }

  getView(baseId: string, tableId: string, viewId: string, token: string) {
    const url = `${this.url}/${baseId}/${tableId}?view=${viewId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return this.httpService.get(url, { headers });
  }

  patchView(
    baseId: string,
    tableId: string,
    recordId: string,
    fields: any,
    token: string,
  ) {
    const url = `${this.url}/${baseId}/${tableId}/${recordId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    return this.httpService.patch(url, { fields }, { headers });
  }
}
