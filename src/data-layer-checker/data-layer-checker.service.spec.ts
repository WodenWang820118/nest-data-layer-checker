import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { of } from 'rxjs';
import { AirtableService } from '../airtable/airtable.service';
import { mockAirtableService } from '../airtable/airtable.service.spec';
import { GtmOperatorService } from '../gtm-operator/gtm-operator.service';
import { mockGtmOperatorService } from '../gtm-operator/gtm-operator.service.spec';
import { mockPuppeteerService } from '../puppeteer/puppeteer.service.spec';

export const mockDataLayerCheckerService = {
  constructSpecsPipe: jest.fn(),
  examineResults: jest
    .fn()
    .mockImplementation(() => mockDataLayerCheckerService.updateRecords()),
  examineDataAttributes: jest.fn().mockReturnValue(false),
  examineDataLayer: jest.fn().mockReturnValue(false),
  updateRecords: jest.fn(),
  checkCodeSpecsAndUpdateRecords: jest.fn(),
  getOperationJson: jest.fn().mockReturnValue({}),
  checkCodeSpecsViaGtm: jest.fn().mockImplementation(() => {
    mockGtmOperatorService.goToPageViaGtm();
    mockDataLayerCheckerService.getOperationJson();
    mockGtmOperatorService.locateTestingPage();
    mockPuppeteerService.performOperationViaGtm();
  }),
  checkCodeSpecOperationAndUpdateRecords: jest.fn(),
};

describe('DataLayerCheckerService', () => {
  let service: DataLayerCheckerService;
  let airtableService: AirtableService;
  let gtmOperatorService: GtmOperatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DataLayerCheckerService,
          useValue: mockDataLayerCheckerService,
        },
        {
          provide: AirtableService,
          useValue: mockAirtableService,
        },
        {
          provide: GtmOperatorService,
          useValue: mockGtmOperatorService,
        },
      ],
    }).compile();

    service = module.get<DataLayerCheckerService>(DataLayerCheckerService);
    airtableService = module.get<AirtableService>(AirtableService);
    gtmOperatorService = module.get<GtmOperatorService>(GtmOperatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should examinationResults', () => {
    // arrange
    const records = of([]);
    const fieldName = 'CodeSpecs Match';
    // act
    service.examineResults(records, fieldName);
    // assert
    expect(mockDataLayerCheckerService.examineResults).toHaveBeenCalled();
    expect(mockDataLayerCheckerService.updateRecords).toHaveBeenCalled();
  });

  it('should examine data attributes', () => {
    // arrange
    const dataLayerSpec = '';
    const actualDataLayer = [];
    // act
    const result = service.examineDataAttributes(
      dataLayerSpec,
      actualDataLayer,
    );
    // assert
    expect(
      mockDataLayerCheckerService.examineDataAttributes,
    ).toHaveBeenCalled();

    expect(result).toBe(false);
  });

  it('should examine data layer', () => {
    // arrange
    const codeSpecs = 'window.dataLayer';
    const actualDataLayer = [];
    // act
    service.examineDataLayer(codeSpecs, actualDataLayer);
    // assert
    expect(service.examineDataLayer(codeSpecs, actualDataLayer)).toBe(false);
  });

  describe('should update records', () => {
    // arrange
    const baseId = '';
    const tableId = '';
    const fieldName = 'CodeSpecs Match';
    const token = '';
    // act
    it('should get records first', () => {
      service.checkCodeSpecsAndUpdateRecords(baseId, tableId, fieldName, token);
      // assert
      expect(
        mockDataLayerCheckerService.checkCodeSpecsAndUpdateRecords,
      ).toHaveBeenCalled();
    });

    it('should examineResults next', () => {
      service.checkCodeSpecsAndUpdateRecords(baseId, tableId, fieldName, token);
      // assert
      expect(service.examineResults).toHaveBeenCalled();
    });
  });

  describe('should check code specs via gtm', () => {
    it('should go to page via gtm', () => {
      // arrange
      const gtmUrl = 'https://www.google.com';
      const title = 'test';
      // act
      service.checkCodeSpecsViaGtm(gtmUrl, title);
      // assert
      expect(gtmOperatorService.goToPageViaGtm).toHaveBeenCalled();
    });

    it('should locate the testing page', async () => {
      // arrange
      const gtmUrl = 'https://www.google.com';
      const title = 'test';
      // act
      await service.checkCodeSpecsViaGtm(gtmUrl, title);
      // assert
      expect(gtmOperatorService.locateTestingPage).toHaveBeenCalled();
    });

    it('should get operation json', async () => {
      // arrange
      const gtmUrl = 'https://www.google.com';
      const title = 'test';
      // act
      await service.checkCodeSpecsViaGtm(gtmUrl, title);
      // assert
      expect(service.getOperationJson).toHaveBeenCalled();
    });
  });
});
