import { Test, TestingModule } from '@nestjs/testing';
import { AirtableService } from './airtable.service';
import { Observable } from 'rxjs';

export const mockService = {
  getRecords: jest.fn().mockReturnValue(new Observable()),
  getView: jest.fn().mockReturnValue(new Observable()),
  patchView: jest.fn().mockReturnValue(new Observable()),
};

export const baseId = 'app123';
export const tableId = 'table123';
export const viewId = 'view123';
export const token = 'token123';
export const fields = { name: 'test' };

describe('AirtableService', () => {
  let service: AirtableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AirtableService,
          useValue: mockService,
        },
      ],
    }).compile();

    service = module.get<AirtableService>(AirtableService);
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get records observable', () => {
    // arrange
    // actual
    const records = service.getRecords(baseId, tableId, token);
    // assert
    expect(records).toBeDefined();
  });

  it('should get view data observable', () => {
    // arrange
    // actual
    const records = service.getView(baseId, tableId, viewId, token);
    // assert
    expect(records).toBeDefined();
  });

  it('should patch (update) the view', () => {
    // arrange
    const recordId = 'record123';
    // actual
    const response = service.patchView(
      baseId,
      tableId,
      recordId,
      fields,
      token,
    );
    // assert
    expect(mockService.patchView).toHaveBeenCalledWith(
      baseId,
      tableId,
      recordId,
      fields,
      token,
    );
    expect(response).toBeInstanceOf(Observable);
  });
});
