import { GtmOperatorService } from './gtm-operator.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('gtm-operator')
export class GtmOperatorController {
  constructor(private gtmOperatorService: GtmOperatorService) {}

  @Get('gcs')
  async observeGcs(@Query('gtmUrl') gtmUrl: string) {
    await this.gtmOperatorService.observeGcs(gtmUrl);
  }

  @Get('anomalies')
  async observeAndKeepGcsAnomalies(
    @Query('gtmUrl') gtmUrl: string,
    @Query('expectValue') expectValue: string,
    @Query('loops') loops = 1,
  ) {
    this.gtmOperatorService.observeAndKeepGcsAnomalies(
      gtmUrl,
      expectValue,
      loops,
    );
  }
}
