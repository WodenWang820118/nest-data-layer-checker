import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { query } from 'express';
@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {
    this.initPuppeteerService();
  }

  async initPuppeteerService() {
    await this.puppeteerService.initBrowser();
    await this.puppeteerService.initPage();
  }

  @Get()
  greet() {
    return 'You are in the Puppeteer Controller';
  }

  @Get('/data-layer')
  async getDataLayer(@Query('url') url: string) {
    // console.log('url', url);
    const broswer = this.puppeteerService.getBrowser();
    // console.log('browser', broswer);
    if (broswer) {
      const page = this.puppeteerService.getPage();
      // console.log('page', page);
      if (page) {
        await this.puppeteerService.goToPage(url);
        // TODO: perform operations on the page to the target data layer
        const result = await this.puppeteerService.getDataLayer();
        console.log('result', result);
        await this.puppeteerService.closeBrowser();
        return result;
      }
    }
  }
}
