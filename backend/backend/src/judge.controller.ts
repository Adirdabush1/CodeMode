import { Controller, Post, Body } from '@nestjs/common';
import fetch from 'node-fetch';

const languageToIdMap: Record<string, number> = {
  python: 71,
  javascript: 63,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
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
        const status = response.status;
        const statusText = response.statusText;
        let text = '';
        try {
          text = await response.text();
        } catch {
          text = 'Unable to read response body';
        }
        console.error('Judge0 returned error:', status, statusText, text);
        return { output: `❌ Judge0 error: ${status} ${statusText}\n${text}` };
      }

      const data = (await response.json()) as Judge0Response;

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
      return {
        output: `❌ Server error: ${errorMessage}\nCheck your API key, network connection, or Judge0 service status.`,
      };
    }
  }
}
