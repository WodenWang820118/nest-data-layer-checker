import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from './puppeteer.service';

export const mockPuppeteerService = {
  initBrowser: jest
    .fn()
    .mockImplementation(() => mockPuppeteerService.setBrowser({})),
  setBrowser: jest.fn(),
  getBrowser: jest.fn().mockReturnValue({}),
  initPage: jest
    .fn()
    .mockImplementation(() => mockPuppeteerService.setPage({})),
  setPage: jest.fn(),
  getPage: jest.fn().mockReturnValue({}),
  goToPage: jest.fn().mockImplementation(() => mockPuppeteerService.getPage()),
  getDataLayer: jest.fn().mockReturnValue(['dom.js']),
  closeBrowser: jest.fn(),
  closePage: jest.fn(),
  getOperationJson: jest.fn().mockReturnValue({
    name: 'eeListClick',
    steps: [
      {
        type: 'setViewport',
        width: 1335,
        height: 929,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false,
      },
    ],
  }),
  performOperation: jest
    .fn()
    .mockImplementation(() => mockPuppeteerService.clickElement()),
  clickElement: jest.fn(),
  getInstalledGtms: jest
    .fn()
    .mockImplementation(() => mockPuppeteerService.getAllRequests()),
  getAllRequests: jest.fn().mockReturnValue(['GTM-XXXXXX']),
  initPuppeteerService: jest.fn().mockImplementation(() => {
    mockPuppeteerService.initBrowser();
    mockPuppeteerService.initPage();
  }),
  initGetDataLayerOperation: jest.fn().mockImplementation((url: string) => {
    mockPuppeteerService.initPuppeteerService();
    mockPuppeteerService.goToPage(url);
    return mockPuppeteerService.getDataLayer();
  }),
  getGcs: jest.fn().mockReturnValue(['111']),
};

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PuppeteerService,
          useValue: mockPuppeteerService,
        },
      ],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init the Puppeteer and set the browser for global use', async () => {
    // actual
    await service.initBrowser();
    // assert
    expect(service.setBrowser).toHaveBeenCalled();
    expect(service.setBrowser).toHaveBeenCalledTimes(1);
  });

  it('should init a new page and set the page for global use', async () => {
    // actual
    await service.initPage();
    // assert
    expect(service.setPage).toHaveBeenCalled();
    expect(service.setPage).toHaveBeenCalledTimes(1);
  });

  it('should go the specific page', async () => {
    // arrange
    const url = 'https://www.google.com';
    // actual
    await service.goToPage(url);
    // assert
    expect(service.getPage).toHaveBeenCalled();
    expect(service.getPage).toHaveBeenCalledTimes(1);
  });

  it('should print out the dataLayer', async () => {
    // arrange
    const url = 'https://www.google.com';
    // actual
    await service.goToPage(url);
    const dataLayer = await service.getDataLayer();
    // assert
    expect(dataLayer).toBeDefined();
  });

  it('should load specific JSON recording', async () => {
    // actual
    const operation = service.getOperationJson('eeListClick');
    // assert
    expect(operation).toBeInstanceOf(Object);
  });

  it('should perform operation according to the JSON recording', async () => {
    // arrange
    const url = 'https://www.google.com';
    // actual
    await service.goToPage(url);
    const operation = service.getOperationJson('eeListClick');
    await service.performOperation(operation);
    // assert
    expect(operation).toBeInstanceOf(Object);
    expect(service.getPage).toHaveBeenCalled();
    expect(service.goToPage).toHaveBeenCalled();
    expect(service.clickElement).toHaveBeenCalled();
  });

  it('should give the installed GTM according to the URL', async () => {
    // arrange
    const url = 'https://www.google.com';
    // actual
    const gtm = await service.getInstalledGtms(url);
    // assert
    expect(service.getAllRequests).toHaveBeenCalled();
    expect(gtm.length).toBeGreaterThan(0);
  });

  it('should init the PuppeteerService', async () => {
    // actual
    await service.initPuppeteerService();
    // assert
    expect(service.initBrowser).toHaveBeenCalled();
    expect(service.initPage).toHaveBeenCalled();
  });

  describe('should initGetDataLayerOption', () => {
    // arrange
    const url = 'https://www.google.com';
    // assert
    it('should initPuppeteerService', async () => {
      // actual
      await service.initGetDataLayerOperation(url);
      // assert
      expect(service.initPuppeteerService).toHaveBeenCalled();
    });

    it('should goToPage', async () => {
      // actual
      await service.initGetDataLayerOperation(url);
      // assert
      expect(service.goToPage).toHaveBeenCalled();
    });

    it('should getDataLayer', async () => {
      // actual
      await service.initGetDataLayerOperation(url);
      // assert
      expect(service.getDataLayer).toHaveBeenCalled();
    });

    it('should return the dataLayer', async () => {
      // actual
      const dataLayer = await service.initGetDataLayerOperation(url);
      // assert
      expect(dataLayer).toBeDefined();
    });
  });
});
