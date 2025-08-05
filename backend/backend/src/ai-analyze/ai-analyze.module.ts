import { Module } from '@nestjs/common';
import { AiAnalyzeService } from './ai-analyze.service';
import { AiAnalyzeController } from './ai-analyze.controller';

@Module({
  providers: [AiAnalyzeService],
  controllers: [AiAnalyzeController],
})
export class AiAnalyzeModule {}
