import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { of, Observable } from 'rxjs';

export const mockDataLayerCheckerService = {
  constructSpecsPipe: jest.fn(),
  updateExaminationResults: jest
    .fn()
    .mockImplementation(() => mockDataLayerCheckerService.patchAirtable()),
  examineDataAttributes: jest.fn().mockReturnValue(false),
  examineDataLayer: jest.fn().mockReturnValue(false),
  patchAirtable: jest.fn(),
};

describe('DataLayerCheckerService', () => {
  let service: DataLayerCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DataLayerCheckerService,
          useValue: mockDataLayerCheckerService,
        },
      ],
    }).compile();

    service = module.get<DataLayerCheckerService>(DataLayerCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should constructSpecsPipe', () => {
    // arrange
    const viewData = {};
    // act
    service.constructSpecsPipe(of(viewData));
    // assert
    expect(mockDataLayerCheckerService.constructSpecsPipe).toHaveBeenCalled();
  });

  it('should updateExaminationResults', () => {
    // arrange
    const viewDataPipe: Observable<{ id: string; fields: any }[]> = of([
      {
        id: 'rec1',
        fields: {
          'Code Specs': 'window.dataLayer',
          URL: 'https://www.google.com',
        },
      },
    ]);
    const baseId = '';
    const tableId = '';
    const viewId = '';
    const token = '';
    // act
    service.updateExaminationResults(
      viewDataPipe,
      baseId,
      tableId,
      viewId,
      token,
    );
    // assert
    expect(mockDataLayerCheckerService.constructSpecsPipe).toHaveBeenCalled();
    expect(
      mockDataLayerCheckerService.updateExaminationResults,
    ).toHaveBeenCalled();
    expect(mockDataLayerCheckerService.patchAirtable).toHaveBeenCalled();
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
});
