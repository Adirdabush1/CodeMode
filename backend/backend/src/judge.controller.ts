import { Controller, Post, Body } from '@nestjs/common';
import fetch from 'node-fetch';

const languageToIdMap: Record<string, number> = {
  python: 34, // Python 3.6.0
  javascript: 29, // JavaScript nodejs 8.5.0
  java: 26, // Java OpenJDK 9
  cpp: 10, // C++ g++ 7.2.0
  c: 4, // C gcc 7.2.0
  csharp: 16, // C# mono 5.4.0.167
  ruby: 38, // Ruby 2.4.0
  go: 22, // Go 1.9
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
  stdin?: string;
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
        console.error('Judge0 returned error:', text);
        return { output: `❌ Judge0 error: ${text}` };
      }

      const data = (await response.json()) as Judge0Response;

      // 🔹 הדפסת הלוג המלא ל־debug
      console.log('Judge0 full response:', JSON.stringify(data, null, 2));

      let output = '';

      if (data.compile_output)
        output += `🛠 Compile Output:\n${data.compile_output}\n`;
      if (data.stderr) output += `⚠ Runtime Error:\n${data.stderr}\n`;
      if (data.stdout) output += `✅ Output:\n${data.stdout}\n`;
      if (data.message) output += `ℹ Message:\n${data.message}\n`;
      if (data.status) output += `📌 Status: ${data.status.description}\n`;

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
