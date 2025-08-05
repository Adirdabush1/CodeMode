import { Controller, Post, Body } from '@nestjs/common';
import { AiAnalyzeService } from './ai-analyze.service';

@Controller('ai-analyze')
export class AiAnalyzeController {
  constructor(private readonly aiAnalyzeService: AiAnalyzeService) {}

  @Post()
  async analyze(@Body() body: { code: string; userFeedback?: string }) {
    const { code, userFeedback } = body;
    const result = await this.aiAnalyzeService.analyzeCode(code, userFeedback);
    return { result };
  }
}
