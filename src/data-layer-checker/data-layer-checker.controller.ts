import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { DataLayerCheckerService } from './data-layer-checker.service';

@Controller('data-layer-checker')
export class DataLayerCheckerController {
  constructor(
    private readonly dataLayerCheckerService: DataLayerCheckerService,
  ) {}

  // for static URL
  @Patch('/:baseId/:tableId')
  checkCodeSpecsAndUpdateRecords(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query('fieldName') fieldName: string,
    @Query('token') token: string,
  ) {
    this.dataLayerCheckerService.checkCodeSpecsAndUpdateRecords(
      baseId,
      tableId,
      fieldName,
      token,
    );
  }

  @Get('/:baseId/:tableId')
  checkCodeSpecsViaGtm(
    @Query('gtmUrl') gtmUrl: string,
    @Query('title') title: string,
  ) {
    this.dataLayerCheckerService.checkCodeSpecsViaGtm(gtmUrl, title);
  }
}
