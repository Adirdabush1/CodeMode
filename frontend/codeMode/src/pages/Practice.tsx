// Practice.tsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import ExerciseList from '../components/ExerciseList';
import MenuBar from '../components/MenuBar';
import Swal from 'sweetalert2';
import './Practice.css';

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

const Practice: React.FC = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState<typeof supportedLanguages[number]>('javascript');
  const [stdin, setStdin] = useState(''); // קלט אפשרי לתרגילים
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('aiUsageCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  // 🔹 Save exercise (with credentials)
  async function saveExercise() {
    if (!selectedExercise || !code.trim()) return;

    setSaveStatus('saving');
    setSaveErrorMessage(null);

    try {
      const res = await fetch('https://backend-codemode-9p1s.onrender.com/user/add-solved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExercise,
          code,
          feedback: userFeedback,
          stdin,
        }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData?.message || 'Failed to save exercise';
        setSaveErrorMessage(message);
        setSaveStatus('error');
        return;
      }

      setSaveStatus('success');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setSaveErrorMessage(errorMsg);
      setSaveStatus('error');
    }
  }

  // 🔹 Run code (מעודכן)
  async function runCode() {
    if (!selectedExercise) return;

    setIsRunning(true);
    setOutput('⏳ Running code...');
    setSaveStatus('idle');
    setSaveErrorMessage(null);

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

      let resultOutput = data.output || '';

      if (!resultOutput.trim()) {
        if (data.compile_output) resultOutput += `💻 Compile Output:\n${data.compile_output}\n`;
        if (data.stderr) resultOutput += `❌ Runtime Error:\n${data.stderr}\n`;
        if (data.stdout) resultOutput += `✅ Output:\n${data.stdout}\n`;
        if (data.message) resultOutput += `ℹ Message:\n${data.message}\n`;
        if (data.status) resultOutput += `📌 Status: ${data.status.description}\n`;
      }

      if (!resultOutput.trim()) {
        resultOutput = '⚠ No output returned.';
      }

      setOutput(resultOutput);

      // אם אין שגיאות, שמור את התרגיל
      if (!data.stderr && resultOutput.trim()) {
        await saveExercise();
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      setOutput(`❌ Error running code: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  }

  // 🔹 Analyze code with AI
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
    } catch (e) {
      setOutput('❌ Error analyzing: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div>
      <MenuBar />
      <h1>Practice Page</h1>

      <label className="language-selector-label">
        <span>Choose language:</span>
        <div className="liquidGlass-wrapper" style={{ marginLeft: 10 }}>
          <select
            className="liquidGlass-text"
            value={language}
            onChange={e => {
              setLanguage(e.target.value as typeof supportedLanguages[number]);
              setSelectedExercise(null);
              setSaveStatus('idle');
              setSaveErrorMessage(null);
            }}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              fontSize: '2rem',
              fontWeight: 600,
              color: 'black',
              cursor: 'pointer',
              padding: '0.3rem 0.6rem',
              outline: 'none',
              zIndex: 3,
              position: 'relative',
            }}
          >
            {supportedLanguages.map(lang => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <div className="liquidGlass-effect"></div>
          <div className="liquidGlass-tint"></div>
          <div className="liquidGlass-shine"></div>
        </div>
      </label>

      <ExerciseList
        selectedLanguage={language}
        onSelectExercise={setSelectedExercise}
        selectedExercise={selectedExercise}
      />

      <div style={{ margin: '10px 0', fontWeight: 'bold' }}>
        Selected Exercise: {selectedExercise || 'None'}
      </div>

      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={value => setCode(value || '')}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, automaticLayout: true, fontSize: 14 }}
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
        style={{ width: '100%', height: 100, marginTop: 10, fontSize: 16, padding: 10 }}
      />

      <div style={{ marginTop: 10 }}>
        <button onClick={runCode} disabled={isRunning || !selectedExercise}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
        <button onClick={analyzeCode} disabled={isRunning} style={{ marginLeft: 10 }}>
          {isRunning ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>

      {saveStatus === 'saving' && <p style={{ color: 'blue' }}>Saving exercise...</p>}
      {saveStatus === 'success' && <p style={{ color: 'green' }}>Exercise saved successfully!</p>}
      {saveStatus === 'error' && (
        <p style={{ color: 'red' }}>Error saving exercise: {saveErrorMessage || 'Unknown error'}</p>
      )}

      <pre
        style={{
          background: '#222',
          color: '#eee',
          padding: 15,
          marginTop: 20,
          minHeight: 150,
          whiteSpace: 'pre-wrap',
          borderRadius: 6,
        }}
      >
        {output}
      </pre>
    </div>
  );
};

export default Practice;
