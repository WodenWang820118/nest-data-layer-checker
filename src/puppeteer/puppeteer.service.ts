import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { HEADLESS, OPERATIONS, USER_AGENT } from '../configs/puppeteer.config';
@Injectable()
export class PuppeteerService {
  private browser: Browser;
  private page: Page;

  async initBrowser(settings?: any) {
    this.setBrowser(
      await puppeteer.launch({
        ...settings,
        headless: HEADLESS,
      }),
    );
  }

  setBrowser(browser: Browser) {
    this.browser = browser;
  }

  getBrowser() {
    return this.browser;
  }

  async initPage() {
    this.setPage(await this.browser.newPage());
  }

  setPage(page: Page) {
    this.page = page;
  }

  getPage() {
    return this.page;
  }

  async initPuppeteerService(settings?: object) {
    await this.initBrowser(settings);
    await this.initPage();
  }

  async initGetDataLayerOperation(url: string) {
    await this.initPuppeteerService();
    await this.goToPage(url);
    const result = await this.getDataLayer();
    await this.closePage();
    return result;
  }

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

  async getDataLayer() {
    await new Promise(resolve => setTimeout(resolve, 1000));
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

  async performOperation(operation: any) {
    if (operation) {
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
  }

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
}
