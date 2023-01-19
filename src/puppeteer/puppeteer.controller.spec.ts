import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerController } from './puppeteer.controller';
import { PuppeteerService } from './puppeteer.service';
import { mockService } from './puppeteer.service.spec';

describe('PuppeteerController', () => {
  let controller: PuppeteerController;
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuppeteerController],
      providers: [
        {
          provide: PuppeteerService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PuppeteerController>(PuppeteerController);
    service = module.get<PuppeteerService>(PuppeteerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each([{ url: 'https://www.104.com.tw/jobs/main/' }])(
    'should take an url and return the dataLayer',
    async ({ url }) => {
      // actual
      const mockInitPuppeteerService = jest.spyOn(
        controller,
        'initPuppeteerService',
      );
      // always init Puppeteer on the controller side
      const actual = await controller.getDataLayer(url);
      // assert
      expect(mockInitPuppeteerService).toHaveBeenCalled();
      expect(service.getBrowser).toHaveBeenCalled();
      expect(service.getBrowser).toHaveBeenCalledTimes(1);
      expect(service.getPage).toHaveBeenCalled();
      expect(service.goToPage).toHaveBeenCalled();
      expect(service.getDataLayer).toHaveBeenCalled();
      expect(service.closePage).toHaveBeenCalled();
      expect(actual.length).toBeGreaterThan(0);
    },
  );

  it('should perform operation according to the JSON recording and log dataLayer', async () => {
    // arrange
    const operation = service.getOperationJson('eeListClick');
    // actual
    // always init Puppeteer on the controller side
    const mockInitPuppeteerService = jest.spyOn(
      controller,
      'initPuppeteerService',
    );
    const actual = await controller.performActionAndGetDataLayer(operation);
    // assert
    expect(mockInitPuppeteerService).toHaveBeenCalled();
    expect(service.performOperation).toHaveBeenCalled();
    expect(service.getDataLayer).toHaveBeenCalled();
    expect(service.closePage).toHaveBeenCalled();
    expect(actual.length).toBeGreaterThan(0);
  });

  it('should get GTM ids', async () => {
    // arrange
    const url = 'https://www.104.com.tw/jobs/main/';
    // actual
    // assert
    // always init Puppeteer on the controller side
    const mockInitPuppeteerService = jest.spyOn(
      controller,
      'initPuppeteerService',
    );
    const actual = await controller.detectGTM(url);

    expect(mockInitPuppeteerService).toHaveBeenCalled();
    expect(mockInitPuppeteerService).toHaveBeenCalledTimes(1);
    expect(service.getInstalledGtms).toHaveBeenCalled();
    expect(service.getInstalledGtms).toHaveBeenCalledTimes(1);
    expect(service.closePage).toHaveBeenCalled();
    expect(actual.length).toBeGreaterThan(0);
  });
});
