import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Injectable,
  Global,
} from '@nestjs/common';
import { AirtableService } from './airtable.service';

@Controller('airtable')
@Injectable()
@Global()
export class AirtableController {
  constructor(private readonly service: AirtableService) {}

  @Get('/:baseId/:tableId')
  getRecords(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query('token') token: string,
  ) {
    return this.service.getRecords(baseId, tableId, token);
  }

  @Get('/:baseId/:tableId/:viewId')
  getView(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('viewId') viewId: string,
    @Query('token') token: string,
  ) {
    return this.service.getView(baseId, tableId, viewId, token);
  }

  @Patch('/:baseId/:tableId/:recordId')
  patchView(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('recordId') recordId: string,
    @Body() fields: any,
    @Query('token') token: string,
  ) {
    return this.service.patchView(baseId, tableId, recordId, fields, token);
  }
}
