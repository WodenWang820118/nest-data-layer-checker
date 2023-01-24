import { Module } from '@nestjs/common';
import { PuppeteerController } from './puppeteer.controller';
import { PuppeteerService } from './puppeteer.service';

@Module({
  imports: [],
  controllers: [PuppeteerController],
  providers: [PuppeteerService],
  exports: [PuppeteerService],
})
export class PuppeteerModule {}
