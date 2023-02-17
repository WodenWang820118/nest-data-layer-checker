import { AirtableModule } from './../airtable/airtable.module';
import { Module } from '@nestjs/common';
import { DataLayerCheckerController } from './data-layer-checker.controller';
import { DataLayerCheckerService } from './data-layer-checker.service';
import { HttpModule } from '@nestjs/axios';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';
import { GtmOperatorModule } from '../gtm-operator/gtm-operator.module';

@Module({
  imports: [HttpModule, AirtableModule, PuppeteerModule, GtmOperatorModule],
  controllers: [DataLayerCheckerController],
  providers: [DataLayerCheckerService],
})
export class DataLayerCheckerModule {}
