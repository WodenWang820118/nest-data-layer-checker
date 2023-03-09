import { Module } from '@nestjs/common';
import { GtmOperatorController } from './gtm-operator.controller';
import { GtmOperatorService } from './gtm-operator.service';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';

@Module({
  imports: [PuppeteerModule],
  controllers: [GtmOperatorController],
  providers: [GtmOperatorService],
  exports: [GtmOperatorService],
})
export class GtmOperatorModule {}
