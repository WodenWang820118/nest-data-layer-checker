import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import { HEADLESS } from './puppeteer.config';
@Injectable()
export class PuppeteerService {
  private browser: Browser;
  private page: Page;

  async initBrowser() {
    this.setBrowser(
      await puppeteer.launch({
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
    await this.getPage().goto(url);
  }

  async getDataLayer() {
    return await this.getPage().evaluate(() => {
      return window.dataLayer;
    });
  }

  async closeBrowser() {
    await this.getBrowser().close();
  }
}
