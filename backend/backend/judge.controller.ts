import { Controller, Post, Body } from '@nestjs/common';
import fetch from 'node-fetch';

const languageToIdMap: Record<string, number> = {
  python: 71,
  javascript: 63,
  typescript: 74,
  java: 62,
  csharp: 51,
  cpp: 54,
  html: 85,
  css: 79,
};

// נגדיר ממשק לתוצאה שמגיעה מ־Judge0
interface Judge0Response {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: {
    id: number;
    description: string;
  };
}

@Controller('judge')
export class JudgeController {
  @Post('run')
  async runCode(
    @Body('code') code: string,
    @Body('language') language: string,
  ): Promise<Judge0Response | { error: string; details: unknown }> {
    try {
      const languageId = languageToIdMap[language];
      if (!languageId) {
        return { error: 'Unsupported language', details: language };
      }

      const response = await fetch(
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_KEY ?? '',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
          body: JSON.stringify({ source_code: code, language_id: languageId }),
        },
      );

      // ✨ במקום any – נצמיד את זה ל־Judge0Response
      const data = (await response.json()) as Judge0Response;

      return data;
    } catch (err) {
      return { error: 'Server error', details: err };
    }
  }
}
