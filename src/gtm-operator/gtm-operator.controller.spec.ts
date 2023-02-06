import { Test, TestingModule } from '@nestjs/testing';
import { GtmOperatorController } from './gtm-operator.controller';
import { mockGtmOperatorService } from './gtm-operator.service.spec';
import { GtmOperatorService } from './gtm-operator.service';

describe('GtmOperatorController', () => {
  let controller: GtmOperatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GtmOperatorController],
      providers: [
        {
          provide: GtmOperatorService,
          useValue: mockGtmOperatorService,
        },
      ],
    }).compile();

    controller = module.get<GtmOperatorController>(GtmOperatorController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('observeGcs', () => {
    it('should call GtmOperatorService.goToPageViaGtm', async () => {
      // arrange
      const gtmUrl = 'https://tagmanager.google.com';
      // act
      await controller.observeGcs(gtmUrl);
      // assert
      expect(mockGtmOperatorService.goToPageViaGtm).toHaveBeenCalled();
      expect(mockGtmOperatorService.goToPageViaGtm).toHaveBeenCalledTimes(1);
    });

    it('should crawl the page requests regarding the GTM gcs', async () => {
      // arrange
      const gtmUrl = 'https://tagmanager.google.com';
      // act
      await controller.observeGcs(gtmUrl);
      // assert
      expect(mockGtmOperatorService.crawlPageRequests).toHaveBeenCalled();
      expect(mockGtmOperatorService.crawlPageRequests).toHaveBeenCalledTimes(1);
    });
  });
});
