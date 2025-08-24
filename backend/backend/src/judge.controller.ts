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

interface RunCodeDto {
  code: string;
  language: string;
  stdin?: string; // אופציונלי
}

@Controller('judge')
export class JudgeController {
  @Post('run')
  async runCode(@Body() body: RunCodeDto): Promise<{ output: string }> {
    const { code, language, stdin = '' } = body;

    try {
      const languageId = languageToIdMap[language.toLowerCase()];
      if (!languageId) {
        return { output: `❌ Unsupported language: ${language}` };
      }

      const response = await fetch(
        'http://91.99.50.112:2358/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.JUDGE0_KEY
              ? { 'X-Auth-Token': process.env.JUDGE0_KEY }
              : {}),
          },
          body: JSON.stringify({
            source_code: code,
            language_id: languageId,
            stdin,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return { output: `❌ Judge0 error: ${text}` };
      }

      const data: Judge0Response = await response.json();

      let output = '';

      if (data.compile_output)
        output += `🛠 Compile Output:\n${data.compile_output}\n`;
      if (data.stderr) output += `⚠ Runtime Error:\n${data.stderr}\n`;
      if (data.stdout) output += `✅ Output:\n${data.stdout}\n`;

      if (!output.trim()) {
        output = `⚠ No output returned. Status: ${data.status?.description || 'Unknown'}`;
      }

      return { output };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : JSON.stringify(err);
      console.error('Error running code:', errorMessage);
      return { output: `❌ Server error: ${errorMessage}` };
    }
  }
}
