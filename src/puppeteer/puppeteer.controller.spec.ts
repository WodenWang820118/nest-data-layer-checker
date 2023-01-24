import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerController } from './puppeteer.controller';
import { PuppeteerService } from './puppeteer.service';
import { mockPuppeteerService } from './puppeteer.service.spec';

describe('PuppeteerController', () => {
  let controller: PuppeteerController;
  let service: PuppeteerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PuppeteerController],
      providers: [
        {
          provide: PuppeteerService,
          useValue: mockPuppeteerService,
        },
      ],
    }).compile();

    controller = module.get<PuppeteerController>(PuppeteerController);
    service = module.get<PuppeteerService>(PuppeteerService);
    jest.clearAllMocks();
  });

  describe('should take an url and return the dataLayer', () => {
    // actual
    const url = 'https://www.104.com.tw/jobs/main/';
    // assert
    it('should initGetDataLayerOperation', async () => {
      const actual = await controller.getDataLayer(url);
      expect(service.initGetDataLayerOperation).toHaveBeenCalled();
      expect(service.initGetDataLayerOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('should perform operation according to the JSON recording and log dataLayer', () => {
    it('should initPuppeteerService', async () => {
      const operation = service.getOperationJson('eeListClick');
      await controller.performActionAndGetDataLayer(operation);
      expect(service.initPuppeteerService).toHaveBeenCalled();
      expect(service.initPuppeteerService).toHaveBeenCalledTimes(1);
    });

    it('should performOperation', async () => {
      const operation = service.getOperationJson('eeListClick');
      await controller.performActionAndGetDataLayer(operation);
      expect(service.performOperation).toHaveBeenCalled();
      expect(service.performOperation).toHaveBeenCalledTimes(1);
    });

    it('should getDataLayer', async () => {
      const operation = service.getOperationJson('eeListClick');
      await controller.performActionAndGetDataLayer(operation);
      expect(service.getDataLayer).toHaveBeenCalled();
      expect(service.getDataLayer).toHaveBeenCalledTimes(1);
    });

    it('should closePage', async () => {
      const operation = service.getOperationJson('eeListClick');
      await controller.performActionAndGetDataLayer(operation);
      expect(service.closePage).toHaveBeenCalled();
      expect(service.closePage).toHaveBeenCalledTimes(1);
    });

    it('should return dataLayer', async () => {
      const operation = service.getOperationJson('eeListClick');
      const actual = await controller.performActionAndGetDataLayer(operation);
      expect(actual.length).toBeGreaterThan(0);
    });
  });

  describe('should get GTM ids', () => {
    // arrange
    const url = 'https://www.104.com.tw/jobs/main/';
    // assert
    it('should initPupeeteerService', async () => {
      await controller.detectGTM(url);
      expect(service.initPuppeteerService).toHaveBeenCalled();
      expect(service.initPuppeteerService).toHaveBeenCalledTimes(1);
    });

    it('should getInstalledGtms', async () => {
      await controller.detectGTM(url);
      expect(service.getInstalledGtms).toHaveBeenCalled();
      expect(service.getInstalledGtms).toHaveBeenCalledTimes(1);
    });

    it('should closePage', async () => {
      await controller.detectGTM(url);
      expect(service.closePage).toHaveBeenCalled();
    });

    it('should return GTM ids', async () => {
      const actual = await controller.detectGTM(url);
      expect(actual.length).toBeGreaterThan(0);
    });
  });
});
