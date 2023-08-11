import { Injectable } from '@nestjs/common';
import { Browser, Page } from 'puppeteer';
import { USER_AGENT } from '../configs/puppeteer.config';
import { ExtractOperation } from '../interfaces/getOperation.interface';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { scrollIntoViewIfNeeded, waitForSelectors } from '../utils/util';

enum BrowserAction {
  CLICK = 'click',
  NAVIGATE = 'navigate',
  SETVIEWPORT = 'setViewport',
}

@Injectable()
export class PuppeteerService implements ExtractOperation {
  // ------------------ Puppeteer facade API ------------------

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
   * Performs an operation on a page and retrieves the data layer
   * @param operation The operation to perform
   * @returns A Promise resolving to an array of data layer objects
   */
  async performActionAndGetDataLayer(
    name: string,
    args: string,
    headless: string,
    path: string,
  ) {
    try {
      const operation = this.getOperationJson(name, path);
      const browser = await this.initAndReturnBrowser({
        headless: headless === 'true' ? true : false,
      });
      await this.nativateTo(operation.steps[1].url, browser); // navigate to designated URL
      const pages = await browser.pages(); // get all pages
      const page = pages[pages.length - 1]; // last page opened since when opening a brwoser, there's a default page
      await this.performOperation(page, operation);
      await browser.close();
      return await this.getDataLayer(page);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  // ------------------ Puppeteer ------------------

  /**
   * Initializes and returns a browser instance
   * @param settings Optional browser settings
   * @returns A Promise resolving to the Browser instance
   */
  async initAndReturnBrowser(settings?: object) {
    return await puppeteer.launch(settings);
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
   * Retrieves the data layer from a page
   * @param page The page to retrieve the data layer from
   * @param seconds Optional time in milliseconds to wait before retrieving the data layer
   * @returns A Promise resolving to an array of data layer objects
   */
  async getDataLayer(page: Page, seconds: number = 1000) {
    try {
      await page.waitForFunction(() => typeof window.dataLayer !== 'undefined');
      await new Promise(resolve => setTimeout(resolve, seconds));
      return await page.evaluate(() => {
        // TODO: sometmies cannot retreive dataLayer
        return window.dataLayer;
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  // ------------------ Utilties ------------------

  /**
   * Returns the operation JSON object for a given operation name
   * @param name The name of the operation
   * @returns The operation JSON object
   */
  getOperationJson(name: string, folderPath?: string) {
    const rootDir = process.cwd();
    const pathToUse = folderPath
      ? `src\\recordings\\${folderPath}`
      : '\\src\\recordings';
    const fullPath = path.join(rootDir, pathToUse, `${name}.json`);
    return JSON.parse(readFileSync(fullPath, 'utf8'));
  }

  async performOperation(page: Page, operation: any) {
    if (!operation || !operation.steps) return;

    for (const step of operation.steps) {
      switch (step.type) {
        case BrowserAction.SETVIEWPORT:
          await this.handleSetViewport(page, step);
          break;

        case BrowserAction.NAVIGATE:
          await this.handleNavigate(page, step);
          break;

        case BrowserAction.CLICK:
          await this.handleClick(page, step);
          break;

        // Add more cases for other browser actions if needed
        default:
          console.warn(`Unknown action type: ${step.type}`);
      }
    }

    console.log('performOperation completes');
  }

  async handleSetViewport(page: Page, step: any) {
    await page.setViewport({
      width: step.width,
      height: step.height,
    });
  }

  async handleNavigate(page: Page, step: any) {
    await page.goto(step.url);
  }

  async handleClick(page: Page, step: any) {
    console.log('click');
    console.log('step.selectors: ', step.selectors);
    for (const selectorGroup of step.selectors) {
      try {
        await scrollIntoViewIfNeeded(selectorGroup, page, 30000);
      } catch (error) {
        console.error('scrollIntoViewIfNeeded error: ', error);
      } finally {
        if (await this.clickElement(page, selectorGroup[0])) {
          return; // Return as soon as one selector works
        }
      }
    }

    throw new Error(
      `Failed to click. None of the selectors worked for action ${step.target}`,
    );
  }

  async clickElement(page: Page, selector: string, timeout: number = 30000) {
    console.log('clickElement: ', selector);
    try {
      if (
        !selector.startsWith('xpath/') &&
        !selector.startsWith('pierce/') &&
        !selector.startsWith('text/')
      ) {
        console.log('first try normal selector: ', selector);
        return await this.tryClickCSSSelector(page, selector, timeout);
      } else if (selector.startsWith('xpath/')) {
        // Handle XPath
        console.log('try xpath selector');
        return await this.tryClickXPathSelector(page, selector, timeout);
      } else if (selector.startsWith('pierce')) {
        console.log('try pierce selector');
        return await this.tryClickPierceSelector(page, selector);
      } else if (selector.startsWith('text')) {
        // Handle Text selector
        console.log('try xpath with searching text');
        return await this.tryClickTextSelector(page, selector, timeout);
      }
      return false; // Return false if the selector didn't work
    } catch (error) {
      console.error(
        `Failed to click with selector ${selector}. Reason: ${error.message}`,
      );
      return false;
    }
  }

  async tryClickCSSSelector(
    page: Page,
    selector: string,
    timeout: number,
  ): Promise<boolean> {
    await page.waitForSelector(selector, { timeout });
    await page.focus(selector);
    await new Promise(r => setTimeout(r, 1000)); // for future recording purpose
    await page.$eval(selector, el => (el as HTMLButtonElement).click());
    return true;
  }

  async tryClickXPathSelector(
    page: Page,
    selector: string,
    timeout: number,
  ): Promise<boolean> {
    const xpath = selector.replace('xpath/', '');
    await page.waitForXPath(xpath, { timeout });
    const [element] = await page.$x(xpath);
    if (element) {
      await element.focus();
      await (element as puppeteer.ElementHandle<Element>).click({
        delay: 1000,
      });
      return true;
    }
    return false;
  }

  async tryClickPierceSelector(page: Page, selector: string): Promise<boolean> {
    const elementHandle = await this.queryShadowDom(
      page,
      ...selector.replace('pierce/', '').split('/'),
    );
    if (elementHandle instanceof puppeteer.ElementHandle) {
      await elementHandle.click({ delay: 1000 });
      return true;
    }
    return false;
  }

  async tryClickTextSelector(
    page: Page,
    selector: string,
    timeout: number,
  ): Promise<boolean> {
    const xpath = `//*[text()="${selector.replace('text/', '')}"]`;
    await page.waitForXPath(xpath, { timeout });
    const [element] = await page.$x(xpath);
    if (element) {
      await (element as puppeteer.ElementHandle<Element>).click({
        delay: 1000,
      });
      return true;
    }
    return false;
  }

  async queryShadowDom(page: Page, ...selectors: any[]) {
    const jsHandle = await page.evaluateHandle((...selectors) => {
      let element: any = document;

      for (let selector of selectors) {
        if (element.shadowRoot) {
          element = element.shadowRoot.querySelector(selector);
        } else {
          element = element.querySelector(selector);
        }

        if (!element) return null;
      }

      return element;
    }, ...selectors);

    return jsHandle;
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

  // ------------------ GCLID Detection ------------------

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

  // ------------------ GTM Detection ------------------

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
