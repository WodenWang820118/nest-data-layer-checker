import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { OPERATIONS, USER_AGENT } from '../configs/puppeteer.config';
import { ExtractOperation } from '../interfaces/getOperation.interface';

enum BrowserAction {
  CLICK = 'click',
  NAVIGATE = 'navigate',
}

@Injectable()
export class PuppeteerService implements ExtractOperation {
  /**
   * Initializes and returns a browser instance
   * @param settings Optional browser settings
   * @returns A Promise resolving to the Browser instance
   */
  async initAndReturnBrowser(settings?: object) {
    return await puppeteer.launch({ ...settings });
  }

  /**
   * Navigates to a URL and returns the page
   * @param url The URL to navigate to
   * @param browser The browser instance to use
   * @returns A Promise resolving to the Page instance
   */
  async nativateTo(url: string, browser: Browser) {
    const page = await browser.newPage();
    await page.goto(url);
    return page;
  }

  /**
   * Initializes Puppeteer, navigates to a URL, retrieves the data layer, and closes the browser
   * @param url The URL to navigate to
   * @returns A Promise resolving to an array of data layer objects
   */
  async fetchDataLayer(url: string) {
    const browser = await this.initAndReturnBrowser();
    const page = await this.nativateTo(url, browser);
    const result = await this.getDataLayer(page);
    await browser.close();
    return result;
  }

  /**
   * Retrieves the data layer from a page
   * @param page The page to retrieve the data layer from
   * @param seconds Optional time in milliseconds to wait before retrieving the data layer
   * @returns A Promise resolving to an array of data layer objects
   */
  async getDataLayer(page: Page, seconds: number = 1000): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, seconds));
    try {
      return await page.evaluate(() => {
        return window.dataLayer;
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  /**
   * Returns the operation JSON object for a given operation name
   * @param name The name of the operation
   * @returns The operation JSON object
   */
  getOperationJson(name: string) {
    return OPERATIONS.find(op => op.name === name).operation;
  }

  /**
   * Performs an operation on a page
   * @param page The page to perform the operation on
   * @param operation The operation to perform
   * @returns A Promise resolving when the operation is complete
   */
  async performOperation(page: Page, operation: any) {
    if (!operation) return;
    for (let i = 1; i < operation.steps.length; i++) {
      const step = operation.steps[i];
      if (step.type === BrowserAction.NAVIGATE) {
        await page.goto(step.url);
      }
      if (step.type === BrowserAction.CLICK) {
        step.selectors.length == 2
          ? await this.clickElement(page, step.selectors[1][0])
          : await this.clickElement(page, step.selectors[0][0]);
      }
    }
  }

  /**
   * Performs an operation on a page and retrieves the data layer
   * @param operation The operation to perform
   * @returns A Promise resolving to an array of data layer objects
   */
  async performActionAndGetDataLayer(operation: any) {
    if (!operation) return;

    const browser = await this.initAndReturnBrowser(operation.step[0]);
    const page = await this.nativateTo(operation.steps[1].url, browser);

    await this.performOperation(page, operation);
    const result = await this.getDataLayer(page);
    // console.dir('result', result);
    await browser.close();
    return result;
  }

  /**
   * Performs a Google Tag Manager operation on a page
   * @param page The page to perform the operation on
   * @param operation The operation to perform
   * @returns A Promise resolving when the operation is complete
   */
  async performOperationViaGtm(page: Page, operation: any) {
    if (!operation) return;
    for (let i = 1; i < operation.steps.length; i++) {
      const step = operation.steps[i];
      if (step.type === BrowserAction.CLICK) {
        step.selectors.length == 2
          ? await this.clickElement(page, step.selectors[1][0])
          : await this.clickElement(page, step.selectors[0][0]);
      }
    }
  }

  /**
   * Clicks an element on a page
   * @param page The page containing the element
   * @param selector The selector for the element to click
   * @returns A Promise resolving when the element is clicked
   */
  async clickElement(page: Page, selector: string, timeout: number = 30000) {
    console.log('click element');
    try {
      await page.waitForSelector(selector, { timeout: timeout });
      await page.$eval(selector, el => (el as HTMLButtonElement).click());
    } catch (error) {
      console.error(
        `Failed to click on element with selector ${selector}. Reason: ${error.message}`,
      );
      throw error; // or handle it in a way that makes sense for your application
    }
  }

  /**
   * Performs HTTP authentication on a page
   * @param page The page to authenticate
   * @param credentials The authentication credentials
   * @returns A Promise resolving when authentication is complete
   */
  async httpAuth(page: Page, credentials: any) {
    await page.authenticate({
      username: credentials.username,
      password: credentials.password,
    });
  }

  /**
   * Retrieves the Google Tag Manager IDs installed on a page
   * @param page The page to retrieve the IDs from
   * @param url The URL of the page
   * @returns A Promise resolving to an array of GTM
   */
  async getInstalledGtms(page: Page, url: string) {
    const requests = await this.getAllRequests(page, url);
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
   * Retrieves all network requests made by a page
   * @param page The page to retrieve requests from
   * @param url The URL of the page
   * @returns A Promise resolving to an array of request URLs
   */
  async getAllRequests(page: Page, url: string): Promise<string[]> {
    const requests: string[] = [];
    await page.setRequestInterception(true);
    await page.setUserAgent(USER_AGENT);

    // This handler function captures the request URLs
    const requestHandler = async (request: {
      isInterceptResolutionHandled: () => any;
      url: () => string;
      continue: () => any;
    }) => {
      try {
        if (request.isInterceptResolutionHandled()) return;
        requests.push(request.url());
        await request.continue();
      } catch (error) {
        console.error('Error in request interception:', error);
        // Cleanup before rethrowing
        page.off('request', requestHandler);
        throw error;
      }
    };

    // Attach the handler
    page.on('request', requestHandler);

    try {
      await page.goto(url);
      await page.reload({ waitUntil: 'networkidle2' });
    } catch (error) {
      console.error('Error while navigating:', error);
      throw error;
    } finally {
      // Cleanup: Ensure the listener is removed to avoid potential memory leaks
      page.off('request', requestHandler);
      // It's a good practice to turn off request interception after done
      await page.setRequestInterception(false);
    }

    return requests;
  }

  /**
   * Retrieves the Google Click ID (GCLID) values from an array of request URLs
   * @param requests The array of request URLs to retrieve GCLIDs from
   * @returns An array of GCLID values
   */
  getGcs(requests: string[]) {
    if (!requests) return [];
    return requests.map(request => request.split('gcs=')[1].split('&')[0]);
  }

  /**
   * Detects Google Tag Manager installations on a page
   * @param url The URL of the page to detect installations on
   * @returns A Promise resolving to an array of GTM IDs
   */
  async detectGtm(url: string) {
    const browser = await this.initAndReturnBrowser();

    try {
      const page = await this.nativateTo(url, browser);
      const result = await this.getInstalledGtms(page, url);
      // console.dir('result', result);
      return result;
    } finally {
      await browser.close();
    }
  }
}
