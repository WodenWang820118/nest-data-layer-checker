import {
  Controller,
  Get,
  Param,
  Query,
  Injectable,
  Global,
} from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
@Controller('puppeteer')
@Injectable()
@Global()
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
    console.log('getDataLayer', url);
    return await this.puppeteerService.initGetDataLayerOperation(url);
  }

  @Get('/action/:name')
  async performActionAndGetDataLayer(@Param('name') name: string) {
    console.log('action', name);
    const operation = this.puppeteerService.getOperationJson(name);
    if (operation) {
      await this.puppeteerService.initPuppeteerService(operation.steps[0]);
      await this.puppeteerService.performOperation(operation);
      const result = await this.puppeteerService.getDataLayer();
      // console.dir('result', result);
      await this.puppeteerService.closePage();
      return result;
    }
  }

  @Get('/detect-gtm')
  async detectGTM(@Query('url') url: string) {
    // console.log('detectGTM', url);
    await this.puppeteerService.initPuppeteerService();
    const result = await this.puppeteerService.getInstalledGtms(url);
    // console.dir('result', result);
    await this.puppeteerService.closePage();
    return result;
  }
}
