import '../../src/pages/Practice.css';
import './MonacoEditor.css';

import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import Swal from 'sweetalert2';

const supportedLanguages = ['typescript', 'javascript', 'python', 'java', 'csharp', 'cpp', 'html', 'css'] as const;

const languageToIdMap: Record<typeof supportedLanguages[number], number> = {
  python: 71,
  javascript: 63,
  typescript: 74,
  java: 62,
  csharp: 51,
  cpp: 54,
  html: 85,
  css: 79,
};

const MyEditor: React.FC = () => {
  const [code, setCode] = useState('// כתוב כאן קוד...');
  const [language, setLanguage] = useState<typeof supportedLanguages[number]>('typescript');
  const [output, setOutput] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Count AI usage stored in localStorage
  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('aiUsageCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  async function runCode() {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const languageId = languageToIdMap[language];
      const res = await fetch('http://localhost:2358/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.compile_output || data.stderr || 'No output');
    } catch (e) {
      setOutput('Error: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  }

  async function analyzeCode() {
    const token = localStorage.getItem('token');

    // Check usage count and token before allowing AI analysis
    if (!token && aiUsageCount >= 1) {
      Swal.fire({
        icon: 'info',
        title: 'AI Access Limited',
        text: 'To continue using AI analysis, please log in or sign up.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#3085d6',
        background: '#f4f6f9',
      }).then(result => {
        if (result.isConfirmed) {
          window.location.href = '/login'; // Adjust path if needed
        }
      });
      return;
    }

    setIsRunning(true);
    setOutput('Analyzing with AI...');
    try {
      const res = await fetch('http://localhost:5000/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ code, userFeedback }),
      });

      const data = await res.json();
      setOutput(data.result || 'No analysis returned');

      // If no token, increase AI usage count and save it
      if (!token) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e) {
      setOutput('Error: ' + (e instanceof Error ? e.message : 'Unknown error'));
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
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      <MonacoEditor
        height="400px"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={value => setCode(value || '')}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          fontSize: 14,
        }}
      />

      <textarea
        placeholder="מה למדת? איפה נתקעת?"
        value={userFeedback}
        onChange={e => setUserFeedback(e.target.value)}
        style={{ width: '100%', height: 100, marginTop: 20, fontSize: 16, padding: 10 }}
      />

      <button onClick={runCode} disabled={isRunning} className="run-button">
        {isRunning ? 'Running...' : 'Run Code'}
      </button>

      <button onClick={analyzeCode} disabled={isRunning} style={{ marginLeft: 10 }}>
        {isRunning ? 'Analyzing...' : 'Analyze with AI'}
      </button>

      <pre className="output-pre">{output}</pre>
    </div>
  );
};

export default MyEditor;
