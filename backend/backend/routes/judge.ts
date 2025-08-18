import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/run', async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' });
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

  const languageId = languageIdMap[language.toLowerCase()];
  if (!languageId) return res.status(400).json({ message: 'Invalid language' });

  try {
    const response = await fetch(
      'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_KEY!, // מוודאים שהמפתח מוגדר ב-env של Render
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      return res
        .status(response.status)
        .json({ message: 'Judge0 error', details: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error running code:', err);
    res
      .status(500)
      .json({
        message: 'Error running code',
        error: err instanceof Error ? err.message : err,
      });
  }
});

export default router;
