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

  describe('should get GTM ids', () => {
    it('should call detectGTM', async () => {
      const url = 'https://www.104.com.tw/jobs/main/';
      const actual = await controller.detectGtm(url);
      expect(actual.length).toBeGreaterThan(0);
    });
  });
});
