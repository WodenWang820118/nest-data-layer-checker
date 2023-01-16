import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PuppeteerController } from './puppeteer/puppeteer.controller';
import { PuppeteerService } from './puppeteer/puppeteer.service';

@Module({
  imports: [],
  controllers: [AppController, PuppeteerController],
  providers: [AppService, PuppeteerService],
})
export class AppModule {}
