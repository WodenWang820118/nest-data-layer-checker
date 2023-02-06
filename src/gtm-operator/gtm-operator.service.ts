import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';

@Injectable()
export class GtmOperatorService {
  constructor(public puppeteerService: PuppeteerService) {}

  async goToPageViaGtm(gtmUrl: string) {
    // 1) Open the GTM interface
    const websiteUrl = gtmUrl
      .split('&')
      .find(element => element.startsWith('url='))
      .split('=')[1];
    await this.puppeteerService.initPuppeteerService({
      headless: false,
    });
    await this.puppeteerService.goToPage(gtmUrl);
    const broswer = this.puppeteerService.getBrowser();
    const page = this.puppeteerService.getPage();

    // 2) Do not include the debug mode
    await page.$('#include-debug-param').then(el => el?.click());

    // 3) Start tag manager preview mode
    await page.$('#domain-start-button').then(el => el?.click());

    // 4) Wait for the page to completely load
    await broswer.waitForTarget(target => target.url() === websiteUrl);
  }

  async crawlPageRequests() {
    const requests: string[] = [];
    // 1) Get the page
    const browser = this.puppeteerService.getBrowser();
    const page = await this.locateTestingPage();

    // await this.locateTestingPage();

    await page.setRequestInterception(true);

    // 2) Listen to all requests
    page.on('request', async request => {
      try {
        if (request.isInterceptResolutionHandled()) return;
        requests.push(request.url());
        await request.continue();
      } catch (error) {
        request.abort();
      }
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await page.close();
    return requests;
  }

  async locateTestingPage() {
    const browser = this.puppeteerService.getBrowser();
    const pages = await browser.pages();
    // console.log('pages', pages);
    return pages[pages.length - 1];
  }
}
