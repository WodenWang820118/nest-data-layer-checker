import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { OPERATIONS, USER_AGENT } from '../configs/puppeteer.config';
import { ExtractOperation } from '../interfaces/getOperation.interface';
@Injectable()
export class PuppeteerService implements ExtractOperation {
  private browser: Browser;
  private page: Page;

  /**
   * Initializes a new instance of the browser using Puppeteer.
   *
   * @param {Object} [settings={}] - The settings to use for the browser instance.
   * @return A promise that resolves when the browser has been initialized.
   */
  async initBrowser(settings?: any) {
    this.setBrowser(
      await puppeteer.launch({
        ...settings,
      }),
    );
  }

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  getBrowser() {
    return this.browser;
  }

  /**
   * Initializes a new page instance in the browser.
   *
   * @return A promise that resolves when the page has been initialized.
   */
  async initPage() {
    this.setPage(await this.browser.newPage());
  }

  setPage(page: Page) {
    this.page = page;
  }

  getPage() {
    return this.page;
  }

  /**
   * Initializes the Puppeteer service by calling the `initBrowser` and `initPage` methods.
   *
   * @param settings - The settings to use for the browser instance.
   * @returns A promise that resolves when the Puppeteer service has been initialized.
   */
  async initPuppeteerService(settings?: object) {
    await this.initBrowser(settings);
    await this.initPage();
  }

  /**
   * Initializes a new data layer operation by calling the `initPuppeteerService`, `goToPage`, and `getDataLayer` methods.
   * Closes the page after the data layer has been retrieved.
   *
   * @param url - The URL to navigate to and retrieve the data layer from.
   * @returns A promise that resolves with the data layer object.
   */
  async initGetDataLayerOperation(url: string) {
    await this.initPuppeteerService();
    await this.goToPage(url);
    const result = await this.getDataLayer();
    await this.closePage();
    return result;
  }

  /**
   * Navigates the Puppeteer page to the specified URL.
   * Handles HTTP authentication if necessary.
   *
   * @param url - The URL to navigate to.
   * @returns A promise that resolves when the navigation has completed.
   */
  async goToPage(url: string) {
    const response = await this.getPage().goto(url, {
      waitUntil: 'networkidle2',
    });
    if (response.status() === 401) {
      await this.httpAuth(this.getPage(), this.getAuthCredentials());
      await this.getPage().goto(url);
    } else {
      await this.getPage().goto(url);
    }
  }

  /**
   * Retrieves the `dataLayer` from the current Puppeteer page.
   *
   * @param seconds - The number of seconds to wait before retrieving the `dataLayer`. Defaults to 1000.
   * @returns A promise that resolves with the `dataLayer` as an array.
   */
  async getDataLayer(seconds: number = 1000): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, seconds));
    return await this.getPage().evaluate(() => {
      return window.dataLayer;
    });
  }

  async closeBrowser() {
    await this.getBrowser().close();
  }

  async closePage() {
    await this.getPage().close();
  }

  getOperationJson(name: string) {
    return OPERATIONS.find(op => op.name === name).operation;
  }

  /**
   * Performs a series of operations on the page instance.
   *
   * @param operation - The operation object containing steps to perform.
   * @returns A promise that resolves when all steps have been performed.
   */
  async performOperation(operation: any) {
    // TODO: step.type could be Enum; there are more step.type
    if (!operation) return;
    for (let i = 1; i < operation.steps.length; i++) {
      const step = operation.steps[i];
      if (step.type === 'navigate') {
        await this.goToPage(step.url);
      }
      if (step.type === 'click') {
        step.selectors.length == 2
          ? await this.clickElement(this.getPage(), step.selectors[1][0])
          : await this.clickElement(this.getPage(), step.selectors[0][0]);
      }
    }
  }

  async performActionAndGetDataLayer(operation: any) {
    // const operation = this.puppeteerService.getOperationJson(name);
    if (!operation) return;
    await this.initPuppeteerService(operation.steps[0]);
    await this.performOperation(operation);
    const result = await this.getDataLayer();
    // console.dir('result', result);
    await this.closePage();
    return result;
  }

  async performOperationViaGtm(page: Page, operation: any) {
    if (!operation) return;
    // TODO: step.type could be Enum; there are more step.type
    for (let i = 1; i < operation.steps.length; i++) {
      const step = operation.steps[i];
      if (step.type === 'click') {
        step.selectors.length == 2
          ? await this.clickElement(page, step.selectors[1][0])
          : await this.clickElement(page, step.selectors[0][0]);
      }
    }
  }

  /**
   * Clicks on the element specified by the selector.
   *
   * @param {puppeteer.Page} page - The Puppeteer Page object.
   * @param {string} selector - The selector for the element to click.
   * @returns Returns a Promise that resolves once the element has been clicked.
   */
  async clickElement(page: Page, selector: string) {
    console.log('click element');
    await page.waitForSelector(selector).then(async () => {
      await page.$eval(selector, el => (el as HTMLButtonElement).click());
    });
  }

  // http authentication if encountered
  async httpAuth(page: Page, credentials: any) {
    await page.authenticate({
      username: credentials.username,
      password: credentials.password,
    });
  }

  // TODO: a way to get the credentials from a file
  getAuthCredentials(): any {
    return {
      username: 'username',
      password: 'password',
    };
  }

  /**
   * Get all installed Google Tag Manager ids from the given URL
   * @param {string} url - URL from where to extract the GTM ids
   * @returns An array of GTM ids
   */
  async getInstalledGtms(url: string) {
    const requests = await this.getAllRequests(url);
    const gtmRequests = requests.filter(request =>
      request.includes('collect?v=2'),
    );
    if (gtmRequests.length > 0) {
      const installedGtms = gtmRequests.map(
        request => request.split('tid=')[1].split('&')[0],
      );
      return installedGtms;
    }
    return [];
  }

  /**
   * Collects all requests made on the page.
   *
   * @param url - The URL to the page.
   * @returns An array of request URLs.
   */
  async getAllRequests(url: string) {
    const requests = [];
    await this.getPage().setRequestInterception(true);
    await this.getPage().setUserAgent(USER_AGENT);

    this.getPage().on('request', async request => {
      try {
        if (request.isInterceptResolutionHandled()) return;
        requests.push(request.url());
        await request.continue();
      } catch (error) {
        throw error;
      }
    });

    await this.goToPage(url);
    await this.getPage().reload({ waitUntil: 'networkidle2' });
    return requests;
  }

  /**
   * Extracts Google Consent Status tracking codes from an array of URL strings
   * @param {string[]} requests - An array of URL strings
   * @returns An array of Google Consent Status
   */
  getGcs(requests: string[]) {
    // stripe the gcs= from the request
    if (!requests) return [];
    return requests.map(request => request.split('gcs=')[1].split('&')[0]);
  }

  async detectGtm(url: string) {
    await this.initPuppeteerService();
    const result = await this.getInstalledGtms(url);
    // console.dir('result', result);
    await this.closePage();
    return result;
  }
}
