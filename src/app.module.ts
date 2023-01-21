import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { AirtableModule } from './airtable/airtable.module';
import { DataLayerCheckerModule } from './data-layer-checker/data-layer-checker.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PuppeteerModule,
    AirtableModule,
    DataLayerCheckerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
