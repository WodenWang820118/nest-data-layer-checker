import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { Page } from 'puppeteer';

/**
 * @class GtmOperatorService
 * Service for interacting with Google Tag Manager and observing the Google Conversion Services
 */
@Injectable()
export class GtmOperatorService {
  constructor(public puppeteerService: PuppeteerService) {}
  testingPage: Page;

  /**
   * Go to a page via GTM interface
   *
   * @param {string} gtmUrl URL of the Google Tag Manager interface
   * @param {string} [args] command line arguments to pass to the browser instance
   * @param {string} [headless] 'true' to run the browser in headless mode, 'false' otherwise
   */
  async goToPageViaGtm(gtmUrl: string, args?: string, headless?: string) {
    // 1) Open the GTM interface
    const websiteUrl = gtmUrl
      .split('&')
      .find(element => element.startsWith('url='))
      .split('=')[1];
    await this.puppeteerService.initPuppeteerService({
      headless: headless.toLowerCase() === 'true' ? true : false || false,
      args: args.split(','),
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

  /**
   * Crawl the current page's responses and extract the ones containing the Google Consent Status parameter
   *
   * @returns Array of URLs with the 'gcs' parameter
   */
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

  /**
   * Locate the currently open testing page
   *
   * @returns Currently open testing page
   */
  async locateTestingPage() {
    const browser = this.puppeteerService.getBrowser();
    const pages = await browser.pages();
    return pages[pages.length - 1];
  }

  /**
   * @method observeGcsViaGtm
   * Observe the Google Conversion Services of a page via GTM interface
   *
   * @param {string} gtmUrl URL of the Google Tag Manager interface
   * @param {string} [args] command line arguments to pass to the browser instance
   * @param {string} [headless] 'true' to run the browser in headless mode, 'false' otherwise
   *
   * @returns Array of Google Conversion Services
   */
  async observeGcsViaGtm(
    gtmUrl: string,
    args?: string,
    headless?: string,
  ): Promise<string[]> {
    await this.goToPageViaGtm(gtmUrl, args, headless);
    const responses = await this.crawlPageResponses();
    return this.puppeteerService.getGcs(responses);
  }

  /**
   * @method observeAndKeepGcsAnomaliesViaGtm
   * Observe the Google Conversion Services of a page via GTM interface and keep track of any anomalies
   *
   * @param {string} gtmUrl URL of the Google Tag Manager interface
   * @param {string} expectValue expected Google Conversion Service
   * @param {number} loops number of times to observe the Google Conversion Services
   * @param {string} [args] command line arguments to pass to the browser instance
   * @param {string} [headless] 'true' to run the browser in headless mode, 'false' otherwise
   */
  async observeAndKeepGcsAnomaliesViaGtm(
    gtmUrl: string,
    expectValue: string,
    loops: number,
    args?: string,
    headless?: string,
  ) {
    const report = [];
    let anomalyCount = 0;
    for (let i = 0; i < loops; i++) {
      const gcs = await this.observeGcsViaGtm(gtmUrl, args, headless);
      // console.log(gcs);
      if (!gcs.includes(expectValue)) {
        console.log('GCS anomaly detected!');
        console.log(gcs);
        anomalyCount++;
        report.push({
          anomalyCount: anomalyCount,
          gcs: gcs,
          date: new Date(),
        });
        // return;
      } else {
        console.log('No anomalies detected!');
        report.push({
          anomalyCount: anomalyCount,
          gcs: gcs,
          date: new Date(),
        });
        await this.testingPage.browser().close();
      }
    }
    return report;
  }

  async observeAndKeepGcsAnomaliesViaGtmWithReport(
    gtmUrl: string,
    expectValue: string,
    loops: number,
    args?: string,
    headless?: string,
  ) {
    this.observeAndKeepGcsAnomaliesViaGtm(
      gtmUrl,
      expectValue,
      loops,
      args,
      headless,
    );
  }
}
