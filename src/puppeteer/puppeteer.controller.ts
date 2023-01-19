import { rootDir } from './puppeteer.config';
import { readFileSync } from 'fs';
import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  async initPuppeteerService(settings?: any) {
    await this.puppeteerService.initBrowser(settings);
    await this.puppeteerService.initPage();
  }

  @Get()
  greet() {
    return 'You are in the Puppeteer Controller';
  }

  @Get('/data-layer')
  async getDataLayer(@Query('url') url: string) {
    this.initPuppeteerService();
    // console.log('url', url);
    const broswer = this.puppeteerService.getBrowser();
    // console.log('browser', broswer);
    if (broswer) {
      const page = this.puppeteerService.getPage();
      // console.log('page', page);
      if (page) {
        await this.puppeteerService.goToPage(url);
        const result = await this.puppeteerService.getDataLayer();
        // console.log('result', result);
        await this.puppeteerService.closePage();
        return result;
      }
    }
  }

  @Get('/action/:name')
  async performActionAndGetDataLayer(@Param('name') name: string) {
    console.log('action', name);
    const operation = this.puppeteerService.getOperationJson(name);
    if (operation) {
      await this.initPuppeteerService(operation.steps[0]);
      await this.puppeteerService.performOperation(operation);
      const result = await this.puppeteerService.getDataLayer();
      console.dir('result', result);
      await this.puppeteerService.closePage();
      return result;
    }
  }
}
