import { Controller, Post, Body } from '@nestjs/common';
import fetch from 'node-fetch';

const languageToIdMap: Record<string, number> = {
  python: 71, // Python 3.8.1
  javascript: 63, // Node.js 12.14.0
  java: 62, // Java OpenJDK 13.0.1
  cpp: 54, // C++ GCC 9.2.0
  c: 50, // C GCC 9.2.0
  csharp: 51, // C# Mono 6.6.0.161
  ruby: 72, // Ruby 2.7.0
  go: 60, // Go 1.13.5
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
        'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.JUDGE0_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
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
