import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerService } from './puppeteer.service';

export const mockService = {
  initBrowser: jest.fn().mockImplementation(() => mockService.setBrowser({})),
  setBrowser: jest.fn(),
  getBrowser: jest.fn().mockReturnValue({}),
  initPage: jest.fn().mockImplementation(() => mockService.setPage({})),
  setPage: jest.fn(),
  getPage: jest.fn().mockReturnValue({}),
  goToPage: jest.fn().mockImplementation(() => mockService.getPage()),
  getDataLayer: jest.fn().mockReturnValue([]),
  closeBrowser: jest.fn(),
};

describe('PuppeteerService', () => {
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PuppeteerService,
          useValue: mockService,
        },
      ],
    }).compile();

    service = module.get<PuppeteerService>(PuppeteerService);
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
});
