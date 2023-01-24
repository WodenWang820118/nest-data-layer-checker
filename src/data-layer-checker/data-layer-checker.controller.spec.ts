import { Test, TestingModule } from '@nestjs/testing';
import { DataLayerCheckerController } from './data-layer-checker.controller';
import { AirtableController } from '../airtable/airtable.controller';
import { AirtableModule } from '../airtable/airtable.module';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';
import { of, Observable } from 'rxjs';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { mockDataLayerCheckerService } from './data-layer-checker.service.spec';

const baseId = 'app123';
const tableId = 'table123';
const viewId = 'view123';
const token = 'token123';

describe('DataLayerCheckerController', () => {
  let controller: DataLayerCheckerController;
  let airtableController: AirtableController;
  let service: DataLayerCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AirtableModule, PuppeteerModule],
      controllers: [DataLayerCheckerController],
      providers: [
        {
          provide: AirtableController,
          useValue: {
            getView: jest.fn().mockReturnValue(of([])),
          },
        },
        {
          provide: DataLayerCheckerService,
          useValue: mockDataLayerCheckerService,
        },
      ],
    }).compile();

    controller = module.get<DataLayerCheckerController>(
      DataLayerCheckerController,
    );
    airtableController = module.get<AirtableController>(AirtableController);
    service = module.get<DataLayerCheckerService>(DataLayerCheckerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('should get airtable view data; handle data checking operation; update view data', () => {
    it('should get the view data', () => {
      // arrange
      // act
      controller.checkCodeSpecsAndUpdateView(baseId, tableId, viewId, token);
      // assert
      expect(
        airtableController.getView(baseId, tableId, viewId, token),
      ).toBeInstanceOf(Observable);
    });

    it('should constructSpecsPipe', () => {
      // arrange
      // act
      controller.checkCodeSpecsAndUpdateView(baseId, tableId, viewId, token);
      // assert
      expect(service.constructSpecsPipe).toHaveBeenCalled();
    });

    it('should updateExaminationResults', () => {
      // arrange
      // act
      controller.checkCodeSpecsAndUpdateView(baseId, tableId, viewId, token);
      // assert
      expect(service.updateExaminationResults).toHaveBeenCalled();
    });
  });
});
