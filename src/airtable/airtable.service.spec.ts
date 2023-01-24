import { Test, TestingModule } from '@nestjs/testing';
import { AirtableService } from './airtable.service';
import { Observable } from 'rxjs';

export const mockAirtableService = {
  getRecords: jest.fn().mockReturnValue(new Observable()),
  getView: jest.fn().mockReturnValue(new Observable()),
  patchAirtable: jest.fn().mockReturnValue(new Observable()),
  createField: jest.fn().mockReturnValue(new Observable()),
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
          useValue: mockAirtableService,
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

  it('should patch (update) the view and return observable', () => {
    // arrange
    const recordId = 'record123';
    // actual
    const response = service.patchAirtable([], baseId, tableId, viewId, token);
    // assert
    expect(mockAirtableService.patchAirtable).toHaveBeenCalledWith(
      [],
      baseId,
      tableId,
      viewId,
      token,
    );
    expect(response).toBeInstanceOf(Observable);
  });

  it('should create a new field on the airtable view', () => {
    // arrange
    const field = 'field123';
    // actual
    service.createField(baseId, tableId, field, token);
    // assert
    expect(mockAirtableService.createField).toHaveBeenCalledWith(
      baseId,
      tableId,
      field,
      token,
    );
  });
});
