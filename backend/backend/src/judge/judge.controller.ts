// src/judge/judge.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { JudgeService } from './judge.service';

@Controller('judge')
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  @Post('check')
  async check(
    @Body() body: { code: string; language: string; questionId: string },
  ) {
    const { code, language, questionId } = body;
    return this.judgeService.checkAnswer(code, language, questionId);
  }
}
