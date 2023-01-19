import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { HEADLESS, OPERATIONS } from './puppeteer.config';
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

  async goToPage(url: string) {
    const response = await this.getPage().goto(url);
    if (response.status() === 401) {
      await this.httpAuth(this.getPage(), getAuthCredentials());
      await this.getPage().goto(url);
    } else {
      await this.getPage().goto(url);
    }
  }

  async getDataLayer() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
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
    return OPERATIONS.find((op) => op.name === name).operation;
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
      await page.$eval(selector, (el) => (el as HTMLButtonElement).click());
    });
  }

  // http authentication if encountered
  async httpAuth(page: Page, credentials: any) {
    await page.authenticate({
      username: credentials.username,
      password: credentials.password,
    });
  }
}
function getAuthCredentials(): any {
  return {
    username: 'username',
    password: 'password',
  };
}
