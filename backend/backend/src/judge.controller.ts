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

// נגדיר ממשק לתוצאה שמגיעה מ‑Judge0
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
      const languageId = languageToIdMap[language.toLowerCase()];
      if (!languageId) {
        return { error: 'Unsupported language', details: language };
      }

      // כאן אנו שולחים בקשה ל‑Judge0 המקומי שרץ ב‑Docker
      const response = await fetch(
        'http://91.99.50.112:2358/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ source_code: code, language_id: languageId }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return {
          error: 'Judge0 error',
          details: text,
        };
      }

      const data: unknown = await response.json();

      if (typeof data === 'object' && data !== null) {
        return data as Judge0Response;
      } else {
        return { error: 'Invalid response from Judge0', details: data };
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Error running code:', errorMessage);

      return { error: 'Server error', details: errorMessage };
    }
  }
}
