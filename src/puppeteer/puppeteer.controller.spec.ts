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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each([{ url: 'https://www.104.com.tw/jobs/main/' }])(
    'should take an url and return the dataLayer',
    async ({ url }) => {
      // actual
      const actual = await controller.getDataLayer(url);
      // assert
      expect(service.getBrowser).toHaveBeenCalled();
      expect(service.getBrowser).toHaveBeenCalledTimes(1);
      expect(service.getPage).toHaveBeenCalled();
      expect(service.goToPage).toHaveBeenCalled();
      expect(service.getDataLayer).toHaveBeenCalled();
      expect(service.closePage).toHaveBeenCalled();
      expect(actual.length).toBeGreaterThan(0);
    },
  );
});
