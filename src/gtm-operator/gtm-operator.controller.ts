import { GtmOperatorService } from './gtm-operator.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('gtm-operator')
export class GtmOperatorController {
  constructor(private gtmOperatorService: GtmOperatorService) {}

  @Get('gcs')
  async observeGcs(@Query('gtmUrl') gtmUrl: string) {
    await this.gtmOperatorService.goToPageViaGtm(gtmUrl);
    const requests = await this.gtmOperatorService.crawlPageRequests();
    console.log('requests', requests);
    return requests;
  }
}
