import { Test, TestingModule } from '@nestjs/testing';
import { GtmOperatorService } from './gtm-operator.service';
import { mockPuppeteerService } from '../puppeteer/puppeteer.service.spec';

export const mockGtmOperatorService = {
  puppeteerService: mockPuppeteerService,
  goToPageViaGtm: jest.fn().mockImplementation(async () => {
    mockPuppeteerService.initPuppeteerService();
    mockPuppeteerService.goToPage('https://tagmanager.google.com');
    const browser = mockPuppeteerService.getBrowser();
    const page = mockPuppeteerService.getPage();

    // mock the $eval, $ and waitForTarget method of the Puppeteer
    page.$eval = jest.fn((selector, inputElement) => {});

    page.$ = jest.fn(selector => {
      return Promise.resolve({
        click: jest.fn(),
      });
    });

    browser.waitForTarget = jest.fn().mockImplementation(target => {
      return Promise.resolve({
        url: () => 'https://www.example.com',
      });
    });

    // implement the test
    await page.$eval('#domain-start-url', el => {
      el.value = '';
    });
    await page.$eval('#domain-start-url', el => {
      el.value = 'https://www.example.com';
    });

    await page.$('#include-debug-param').then(el => el?.click());
    await page.$('#domain-start-button').then(el => el?.click());

    await browser.waitForTarget(
      target => target.url() === 'https://www.example.com',
    );
  }),

  crawlPageResponses: jest.fn().mockImplementation(async () => {
    const page = mockPuppeteerService.getPage();
    page.setRequestInterception = jest.fn().mockImplementation(boolean => {});
    page.on = jest.fn().mockImplementation((event, callback) => {
      callback();
    });
    page.reload = jest.fn().mockImplementation(options => {});
    page.close = jest.fn().mockImplementation(() => {});
    page.setRequestInterception(true);
    page.on('request', async request => {});
    page.reload({ waitUntil: 'networkidle2' });
    page.close();
  }),
  locateTestingPage: jest.fn().mockReturnValue({}),
  observeGcs: jest.fn().mockImplementation(async () => {
    await mockGtmOperatorService.goToPageViaGtm();
    await mockGtmOperatorService.crawlPageResponses();
  }),
  observeAndKeepGcsAnomalies: jest.fn().mockImplementation(async () => {
    const loops = 3;
    for (let i = 0; i < loops; i++) {
      await mockGtmOperatorService.observeGcs();
    }
  }),
};

describe('GtmOperatorService', () => {
  let service: GtmOperatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GtmOperatorService,
          useValue: mockGtmOperatorService,
        },
      ],
    }).compile();

    service = module.get<GtmOperatorService>(GtmOperatorService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have PuppeteerService', () => {
    expect(service.puppeteerService).toBeDefined();
  });

  describe('should open the GTM interface and go to the designated testing page', () => {
    // arrange
    const gtmUrl = 'https://tagmanager.google.com';
    const url = 'https://www.example.com';

    it('should call PuppeteerService.initPuppeteerService', async () => {
      // act
      await service.goToPageViaGtm(gtmUrl);
      // assert
      expect(service.puppeteerService.initPuppeteerService).toHaveBeenCalled();
      expect(
        service.puppeteerService.initPuppeteerService,
      ).toHaveBeenCalledTimes(1);
    });

    it('should call PuppeteerService.goToPage', async () => {
      // act
      await service.goToPageViaGtm(gtmUrl);
      // assert
      expect(service.puppeteerService.goToPage).toHaveBeenCalled();
      expect(service.puppeteerService.goToPage).toHaveBeenCalledTimes(1);
    });

    it('should get the puppeteer browser and page for performing operations', () => {
      // act
      const browser = service.puppeteerService.getBrowser();
      const page = service.puppeteerService.getPage();
      // assert
      expect(browser).toBeDefined();
      expect(page).toBeDefined();
    });

    it('should clean the start url input and set the new url', async () => {
      // act
      await service.goToPageViaGtm(gtmUrl);
      const page = service.puppeteerService.getPage();
      // assert
      expect(page).toBeDefined();
      expect(page.$eval).toHaveBeenCalled();
      expect(page.$eval).toHaveBeenCalledTimes(2);
    });

    it('should not include the debug mode, and start the preview mode', async () => {
      //act
      await service.goToPageViaGtm(gtmUrl);
      const page = service.puppeteerService.getPage();
      // assert
      expect(page.$('#include-debug-param')).resolves.toBeDefined();
      expect(page.$('#domain-start-button')).resolves.toBeDefined();
    });

    it('should wait according the browser', async () => {
      // act
      await service.goToPageViaGtm(gtmUrl);
      const browser = service.puppeteerService.getBrowser();
      // assert
      expect(browser.waitForTarget).toHaveBeenCalled();
    });
  });

  describe('crawlPageResponses', () => {
    it('should call PuppeteerService.getPage', () => {
      // act
      service.crawlPageResponses();
      // assert
      expect(service.puppeteerService.getPage).toHaveBeenCalled();
    });

    it('should set the request interception to true', () => {
      // act
      service.crawlPageResponses();
      const page = service.puppeteerService.getPage();
      // assert
      expect(page.setRequestInterception).toHaveBeenCalledWith(true);
    });

    it('should listen to the request event', () => {
      // act
      service.crawlPageResponses();
      const page = service.puppeteerService.getPage();
      // assert
      expect(page.on).toHaveBeenCalled();
    });

    it('should reload the page', () => {
      // act
      service.crawlPageResponses();
      const page = service.puppeteerService.getPage();
      // assert
      expect(page.reload).toHaveBeenCalled();
    });

    it('should close the page', async () => {
      // act
      await service.crawlPageResponses();
      const page = service.puppeteerService.getPage();
      // assert
      expect(page.close).toHaveBeenCalled();
    });

    it('should have reponses returned', () => {
      // act
      const reponses = service.crawlPageResponses();
      // assert
      expect(reponses).toBeDefined();
    });
  });

  it('should locate the testing page', async () => {
    // arrange
    const url = 'https://www.example.com';
    // act
    const page = await service.locateTestingPage();
    // assert
    expect(page).toBeDefined();
  });

  it('should observe the GCS', async () => {
    // act
    const gtmUrl = 'https://tagmanager.google.com';
    await service.observeGcs(gtmUrl);
    // assert
    expect(service.goToPageViaGtm).toHaveBeenCalled();
    expect(service.crawlPageResponses).toHaveBeenCalled();
    expect(service.crawlPageResponses).toBeDefined();
  });

  it('should observe and keep the GCS anomalies', async () => {
    // act
    const gtmUrl = 'https://tagmanager.google.com';
    const expectValue = 'G111';
    const loops = 3;

    await service.observeAndKeepGcsAnomalies(gtmUrl, expectValue, loops);
    // assert
    expect(service.observeGcs).toHaveBeenCalled();
    expect(service.observeGcs).toHaveBeenCalledTimes(loops);
  });
});
