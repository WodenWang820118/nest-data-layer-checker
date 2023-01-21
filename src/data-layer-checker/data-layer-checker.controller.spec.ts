import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerController } from './data-layer-checker.controller';

describe('DataLayerCheckerController', () => {
  let controller: DataLayerCheckerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataLayerCheckerController],
    }).compile();

    controller = module.get<DataLayerCheckerController>(DataLayerCheckerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
