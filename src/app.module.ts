import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuppeteerController } from './puppeteer/puppeteer.controller';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { AirtableController } from './airtable/airtable.controller';
import { AirtableService } from './airtable/airtable.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, PuppeteerController, AirtableController],
  providers: [AppService, PuppeteerService, AirtableService],
})
export class AppModule {}
