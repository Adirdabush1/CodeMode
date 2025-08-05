import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import './Practice.css';
import MenuBar from '../components/MenuBar';

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

const Practice: React.FC = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState<typeof supportedLanguages[number]>('typescript');
  const [userFeedback, setUserFeedback] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  async function runCode() {
    setIsRunning(true);
    setOutput('Running code...');
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
      setOutput('Error running code: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  }

  async function analyzeCode() {
    setIsRunning(true);
    setOutput('Performing AI analysis...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ code, userFeedback }),
      });
      const data = await res.json();
      setOutput(data.analysis || 'No analysis available');
    } catch (e) {
      setOutput('Error analyzing code: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div>
      <MenuBar />
      <div className="practice-page">
        <div style={{ padding: 20 }}>
          <label>
            Choose language:
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as typeof supportedLanguages[number])}
              style={{ marginLeft: 10 }}
            >
              {supportedLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </label>

          <Editor
            height="400px"
            language={language}
            value={code}
            onChange={(value: string | undefined) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 14,
            }}
          />

          <textarea
            placeholder="What did you learn? Where did you get stuck?"
            value={userFeedback}
            onChange={e => setUserFeedback(e.target.value)}
            style={{ width: '100%', height: 100, marginTop: 20, fontSize: 16, padding: 10 }}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={runCode} disabled={isRunning}>
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
            <button onClick={analyzeCode} disabled={isRunning} style={{ marginLeft: 10 }}>
              {isRunning ? 'Analyzing...' : 'AI Analysis'}
            </button>
          </div>

          <pre style={{ background: '#222', color: '#eee', padding: 15, marginTop: 20, minHeight: 150, whiteSpace: 'pre-wrap' }}>
            {output}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Practice;
