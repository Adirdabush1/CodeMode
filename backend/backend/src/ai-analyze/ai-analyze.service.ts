import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class AiAnalyzeService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async analyzeCode(code: string, userFeedback?: string): Promise<string> {
    if (!code) {
      throw new InternalServerErrorException('Code is required');
    }

    const isTest = code.trim() === '__test__';
    const testCode = `
function add(a, b) {
  return a + b;
}
`;

    const prompt = `
You are an AI assistant.

Here is the user's code:
${isTest ? testCode : code}

User feedback:
${userFeedback || 'No feedback'}

Give helpful suggestions or describe any issues you find in the code.
`.trim();

    try {
      const chatResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert coding assistant.' },
          { role: 'user', content: prompt },
        ],
      });

      const message = chatResponse.choices[0]?.message?.content?.trim();

      return message || 'No response from OpenAI.';
    } catch (error) {
      console.error('OpenAI error:', error);
      throw new InternalServerErrorException(
        'Error analyzing code with OpenAI',
      );
    }
  }
}
