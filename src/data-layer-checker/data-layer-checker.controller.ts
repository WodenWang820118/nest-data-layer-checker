import { Controller, Injectable, Param, Patch, Query } from '@nestjs/common';
import { DataLayerCheckerService } from './data-layer-checker.service';

@Controller('data-layer-checker')
@Injectable()
export class DataLayerCheckerController {
  constructor(
    private readonly dataLayerCheckerService: DataLayerCheckerService,
  ) {}

  @Patch('/:baseId/:tableId')
  checkCodeSpecsAndUpdateRecords(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Query('token') token: string,
  ) {
    this.dataLayerCheckerService.checkCodeSpecsAndUpdateRecords(
      baseId,
      tableId,
      token,
    );
  }
}
