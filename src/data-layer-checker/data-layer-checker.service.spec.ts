import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { of } from 'rxjs';
import { AirtableService } from '../airtable/airtable.service';
import { mockAirtableService } from '../airtable/airtable.service.spec';

export const mockDataLayerCheckerService = {
  constructSpecsPipe: jest.fn(),
  examinationResults: jest
    .fn()
    .mockImplementation(() => mockDataLayerCheckerService.updateRecords()),
  examineDataAttributes: jest.fn().mockReturnValue(false),
  examineDataLayer: jest.fn().mockReturnValue(false),
  updateRecords: jest.fn(),
  checkCodeSpecsAndUpdateRecords: jest.fn(),
};

describe('DataLayerCheckerService', () => {
  let service: DataLayerCheckerService;
  let airtableService: AirtableService;

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
      ],
    }).compile();

    service = module.get<DataLayerCheckerService>(DataLayerCheckerService);
    airtableService = module.get<AirtableService>(AirtableService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should examinationResults', () => {
    // arrange
    const records = of([]);
    // act
    service.examinationResults(records);
    // assert
    expect(mockDataLayerCheckerService.examinationResults).toHaveBeenCalled();
    expect(mockDataLayerCheckerService.updateRecords).toHaveBeenCalled();
  });

  it('should examine data attributes', () => {
    // arrange
    const testCase = {
      url: '',
      codeSpecs: 'data-event-id= "join_group"',
    };
    // act
    service.examineDataAttributes(testCase);
    // assert
    expect(
      mockDataLayerCheckerService.examineDataAttributes,
    ).toHaveBeenCalled();

    expect(service.examineDataAttributes(testCase)).toBe(false);
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
    const token = '';
    // act
    it('should get records first', () => {
      service.checkCodeSpecsAndUpdateRecords(baseId, tableId, token);
      // assert
      expect(
        mockDataLayerCheckerService.checkCodeSpecsAndUpdateRecords,
      ).toHaveBeenCalled();
    });

    it('should examineResults next', () => {
      service.checkCodeSpecsAndUpdateRecords(baseId, tableId, token);
      // assert
      expect(service.examinationResults).toHaveBeenCalled();
    });

    it('should update records', () => {
      service.checkCodeSpecsAndUpdateRecords(baseId, tableId, token);
      // assert
      expect(airtableService.updateRecords).toHaveBeenCalled();
    });
  });
});
