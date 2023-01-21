import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerService } from './data-layer-checker.service';

describe('DataLayerCheckerService', () => {
  let service: DataLayerCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataLayerCheckerService],
    }).compile();

    service = module.get<DataLayerCheckerService>(DataLayerCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
