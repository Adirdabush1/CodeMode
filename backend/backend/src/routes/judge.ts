import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const router = express.Router();

interface RunRequestBody {
  code: string;
  language: string;
}

const fileMap: Record<string, string> = {
  javascript: 'index.js',
  typescript: 'index.ts',
  python: 'index.py',
  java: 'Main.java',
  csharp: 'Program.cs',
  cpp: 'main.cpp',
};

const runCommandMap: Record<string, (file: string) => string> = {
  javascript: (file) => `node ${file}`,
  typescript: (file) => `npx ts-node ${file}`,
  python: (file) => `python ${file}`,
  java: (file) => `sh -c "javac ${file} && java Main"`,
  csharp: (file) =>
    `sh -c "dotnet new console -o app && mv ${file} app/Program.cs && cd app && dotnet run"`,
  cpp: (file) => `sh -c "g++ ${file} -o main && ./main"`,
};

router.post('/run', (req, res) => {
  const { code, language } = req.body as RunRequestBody;

  if (!code || !language) {
    return res.status(400).json({ message: 'Code and language are required' });
  }

  const lang = language.toLowerCase();
  if (!fileMap[lang]) {
    return res.status(400).json({ message: 'Unsupported language' });
  }

  const tmpDir = path.join(
    __dirname,
    '..',
    'tmp',
    randomBytes(4).toString('hex'),
  );
  fs.mkdirSync(tmpDir, { recursive: true });

  const fileName = fileMap[lang];
  const filePath = path.join(tmpDir, fileName);
  fs.writeFileSync(filePath, code);

  const command = runCommandMap[lang](fileName);

  exec(command, { cwd: tmpDir, timeout: 5000 }, (error, stdout, stderr) => {
    // מחיקה של תיקיית tmp בסיום
    fs.rmSync(tmpDir, { recursive: true, force: true });

    if (error) {
      // מחזיר גם stderr וגם stdout במקרה של שגיאה
      return res.status(500).json({
        error: error.message,
        stdout: stdout || null,
        stderr: stderr || null,
      });
    }

    res.json({ stdout, stderr });
  });
});

export default router;
