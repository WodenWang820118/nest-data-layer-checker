import { Observable } from 'rxjs';
import { AirtableController } from './../airtable/airtable.controller';
import {
  Controller,
  Get,
  Inject,
  Injectable,
  Param,
  Query,
} from '@nestjs/common';
import { DataLayerCheckerService } from './data-layer-checker.service';

@Controller('data-layer-checker')
@Injectable()
export class DataLayerCheckerController {
  testsResults: Array<any> = [];
  constructor(
    @Inject(AirtableController)
    private readonly airtableController: AirtableController,
    private readonly dataLayerCheckerService: DataLayerCheckerService,
  ) {}

  @Get('/:baseId/:tableId/:viewId')
  checkCodeSpecsAndUpdateView(
    @Param('baseId') baseId: string,
    @Param('tableId') tableId: string,
    @Param('viewId') viewId: string,
    @Query('token') token: string,
  ) {
    const viewData: Observable<any> = this.airtableController.getView(
      baseId,
      tableId,
      viewId,
      token,
    );

    this.dataLayerCheckerService.updateExaminationResults(
      this.dataLayerCheckerService.constructSpecsPipe(viewData),
      baseId,
      tableId,
      viewId,
      token,
    );
  }
}
