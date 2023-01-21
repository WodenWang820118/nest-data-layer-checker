import { AirtableController } from './../airtable/airtable.controller';
import { PuppeteerController } from './../puppeteer/puppeteer.controller';
import { Controller, Inject, Injectable } from '@nestjs/common';

@Controller('data-layer-checker')
@Injectable()
export class DataLayerCheckerController {
  constructor(
    @Inject(PuppeteerController)
    private readonly puppeteerController: PuppeteerController,
    @Inject(AirtableController)
    private readonly airtableController: AirtableController,
  ) {}
}
