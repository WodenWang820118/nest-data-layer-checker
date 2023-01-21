import { PuppeteerController } from './../puppeteer/puppeteer.controller';
import { AirtableModule } from './../airtable/airtable.module';
import { Module } from '@nestjs/common';
import { DataLayerCheckerController } from './data-layer-checker.controller';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AirtableController } from 'src/airtable/airtable.controller';

@Module({
  imports: [AirtableModule, PuppeteerModule],
  controllers: [DataLayerCheckerController],
  providers: [DataLayerCheckerService, PuppeteerController, AirtableController],
})
export class DataLayerCheckerModule {}
