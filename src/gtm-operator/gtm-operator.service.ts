import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { Page } from 'puppeteer';

@Injectable()
export class GtmOperatorService {
  constructor(public puppeteerService: PuppeteerService) {}
  testingPage: Page;

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

  async crawlPageResponses() {
    const responses: string[] = [];
    // 1) Get the page
    const page = await this.locateTestingPage();
    this.testingPage = page; // assign the variable for later use

    // 2) Listen to all responses, push the ones that contain the gcs parameter
    page.on('response', async response => {
      try {
        if (response.request().url().includes('gcs=')) {
          responses.push(response.request().url());
        }
      } catch (error) {
        console.log(error);
      }
    });

    await page.waitForResponse(response => response.url().includes('gcs='));
    // await page.close();
    return responses;
  }

  async locateTestingPage() {
    const browser = this.puppeteerService.getBrowser();
    const pages = await browser.pages();
    return pages[pages.length - 1];
  }

  async observeGcsViaGtm(gtmUrl: string): Promise<string[]> {
    await this.goToPageViaGtm(gtmUrl);
    const responses = await this.crawlPageResponses();
    return this.puppeteerService.getGcs(responses);
  }

  async observeAndKeepGcsAnomaliesViaGtm(
    gtmUrl: string,
    expectValue: string,
    loops = 1,
  ) {
    for (let i = 0; i < loops; i++) {
      const gcs = await this.observeGcsViaGtm(gtmUrl);
      console.log(gcs);
      if (!gcs.includes(expectValue)) {
        console.log('GCS anomaly detected!');
        console.log(gcs);
        return;
      } else {
        console.log('No anomalies detected!');
        await this.testingPage.browser().close();
      }
    }
    return;
  }
}
