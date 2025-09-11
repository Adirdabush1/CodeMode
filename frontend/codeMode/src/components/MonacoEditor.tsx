// MyEditor.tsx
import '../../src/pages/Practice.css';
import './MonacoEditor.css';

import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Swal from 'sweetalert2';

const supportedLanguages = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'cpp',
  'html',
  'css',
] as const;

const MyEditor: React.FC = () => {
  const [code, setCode] = useState<string>('// Write code here..');
  const [language, setLanguage] = useState<typeof supportedLanguages[number]>('javascript');
  const [stdin, setStdin] = useState<string>(''); // קלט אפשרי
  const [output, setOutput] = useState<string>('');
  const [userFeedback, setUserFeedback] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('aiUsageCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  // === הרצת הקוד דרך ה-backend ===
  async function runCode() {
    if (!code.trim()) return;

    setIsRunning(true);
    setOutput('⏳ Running code...');

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('https://backend-codemode-9p1s.onrender.com/judge/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, language, stdin }),
        credentials: token ? undefined : 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        setOutput(`❌ Judge0 error (HTTP ${res.status}): ${text}`);
        return;
      }

      const data = await res.json();

      // הצגה מסודרת של כל הפלט
      let resultOutput = '';
      if (data.compile_output) resultOutput += `💻 Compile Output:\n${data.compile_output}\n\n`;
      if (data.stdout) resultOutput += `✅ Stdout:\n${data.stdout}\n\n`;
      if (data.stderr) resultOutput += `❌ Stderr:\n${data.stderr}\n\n`;
      if (data.message) resultOutput += `ℹ Message:\n${data.message}\n\n`;
      if (data.status) resultOutput += `📌 Status: ${data.status.description}\n\n`;
      if (!resultOutput.trim()) resultOutput = '⚠ No output';

      setOutput(resultOutput);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      setOutput(`❌ Error running code: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  }

  // === ניתוח קוד עם AI ===
  async function analyzeCode() {
    const token = localStorage.getItem('token');

    if (!token && aiUsageCount >= 1) {
      Swal.fire({
        icon: 'info',
        title: 'AI Access Limited',
        text: 'To continue using AI analysis, please log in or sign up.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#3085d6',
        background: '#f4f6f9',
      }).then(result => {
        if (result.isConfirmed) window.location.href = '/login';
      });
      return;
    }

    setIsRunning(true);
    setOutput('🤖 Analyzing with AI...');

    try {
      const res = await fetch('https://backend-codemode-9p1s.onrender.com/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, userFeedback }),
        credentials: token ? undefined : 'include',
      });

      const data = await res.json();
      setOutput(data.result || 'No analysis returned');

      if (!token) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      setOutput(`❌ Error analyzing: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="monaco-editor-wrapper">
      <select
        className="language-select"
        value={language}
        onChange={e => setLanguage(e.target.value as typeof supportedLanguages[number])}
      >
        {supportedLanguages.map(lang => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <MonacoEditor
        height="400px"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={value => setCode(value ?? '')}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
        }}
      />

      <textarea
        placeholder="Optional input (stdin) for the exercise"
        value={stdin}
        onChange={e => setStdin(e.target.value)}
        style={{ width: '100%', height: 80, marginTop: 10, fontSize: 14, padding: 10 }}
      />

      <textarea
        placeholder="What did you learn? Where did you get stuck?"
        value={userFeedback}
        onChange={e => setUserFeedback(e.target.value)}
        style={{ width: '100%', height: 100, marginTop: 20, fontSize: 16, padding: 10 }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={runCode} disabled={isRunning} className="run-button">
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <button onClick={analyzeCode} disabled={isRunning} style={{ marginLeft: 10 }}>
          {isRunning ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>

      <pre className="output-pre">{output || 'No output yet. Run code to see results.'}</pre>
    </div>
  );
};

export default MyEditor;
