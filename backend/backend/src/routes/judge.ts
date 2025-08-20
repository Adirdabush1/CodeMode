import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

interface RunRequestBody {
  code: string;
  language: string;
}

interface Judge0Response {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  message?: string;
  [key: string]: unknown;
}

const languageIdMap: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  csharp: 51,
  cpp: 54,
  html: 85,
  css: 79,
};

router.post('/run', async (req, res) => {
  const body = req.body as RunRequestBody;

  const { code, language } = body;

  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' });
  }

  const languageId = languageIdMap[language.toLowerCase()];
  if (!languageId) {
    return res.status(400).json({ message: 'Invalid language' });
  }

  try {
    // שולחים ל-Judge0 המקומי שרץ ב-Docker
    const response = await fetch(
      'http://localhost:2358/submissions?base64_encoded=false&wait=true',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ message: 'Judge0 error', details: text });
    }

    const data: unknown = await response.json();

    if (typeof data === 'object' && data !== null) {
      res.json(data as Judge0Response);
    } else {
      res.status(500).json({ message: 'Invalid response from Judge0' });
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    console.error('Error running code:', errorMessage);

    res.status(500).json({
      message: 'Error running code',
      error: errorMessage,
    });
  }
});

export default router;
