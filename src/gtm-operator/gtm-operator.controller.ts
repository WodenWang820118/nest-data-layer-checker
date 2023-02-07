import { GtmOperatorService } from './gtm-operator.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('gtm-operator')
export class GtmOperatorController {
  constructor(private gtmOperatorService: GtmOperatorService) {}

  @Get('gcs')
  async observeGcsViaGtm(@Query('gtmUrl') gtmUrl: string) {
    await this.gtmOperatorService.observeGcsViaGtm(gtmUrl);
  }

  @Get('anomalies')
  async observeAndKeepGcsAnomaliesViaGtm(
    @Query('gtmUrl') gtmUrl: string,
    @Query('expectValue') expectValue: string,
    @Query('loops') loops = 1,
  ) {
    this.gtmOperatorService.observeAndKeepGcsAnomaliesViaGtm(
      gtmUrl,
      expectValue,
      loops,
    );
  }
}
