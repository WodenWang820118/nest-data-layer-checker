import { Controller, Get, Param, Query } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  // for demo purposes
  @Get('/action/:name')
  async performActionAndGetDataLayer(
    @Param('name') name: string,
    @Query('args') args: string = '',
    @Query('headless') headless: string = 'false',
    @Query('path') path?: string,
  ) {
    return await this.puppeteerService.performActionAndGetDataLayer(
      name,
      args,
      headless,
      path,
    );
  }

  @Get('/detect-gtm')
  async detectGtm(@Query('url') url: string) {
    return await this.puppeteerService.detectGtm(url);
  }
}
