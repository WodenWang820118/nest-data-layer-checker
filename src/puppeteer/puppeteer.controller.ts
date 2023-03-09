import { Controller, Get, Param, Query } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  @Get('/data-layer')
  async getDataLayer(@Query('url') url: string) {
    console.log('getDataLayer', url);
    return await this.puppeteerService.initGetDataLayerOperation(url);
  }

  // for demo purposes
  @Get('/action/:name')
  async performActionAndGetDataLayer(
    @Param('name') name: string,
    @Query('args') args: string = '',
    @Query('headless') headless: string = 'false',
  ) {
    console.log('action', name);
    return await this.puppeteerService.performActionAndGetDataLayer(name);
  }

  @Get('/detect-gtm')
  async detectGtm(@Query('url') url: string) {
    return await this.puppeteerService.detectGtm(url);
  }
}
