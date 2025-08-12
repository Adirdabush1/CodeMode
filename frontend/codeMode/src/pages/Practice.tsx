import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import ExerciseList from '../components/ExerciseList';
import MenuBar from '../components/MenuBar';
import './Practice.css';

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
  const [language, setLanguage] = useState<typeof supportedLanguages[number]>('javascript');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  async function saveExercise() {
    if (!selectedExercise || !code.trim()) {
      console.warn('No exercise or code to save');
      return;
    }

    setSaveStatus('saving');
    setSaveErrorMessage(null);

    try {
      const res = await fetch('http://localhost:5000/user/add-solved', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header הוסר כי משתמשים ב-cookie
        },
        body: JSON.stringify({
          exerciseId: selectedExercise,
          code,
          feedback: userFeedback,
        }),
        credentials: 'include', // חשוב - שולח cookies אוטומטית
      });

      if (!res.ok) {
        const errorData = await res.json();
        const message = errorData?.message || 'Failed to save exercise';
        setSaveErrorMessage(message);
        setSaveStatus('error');
        console.error('Save error:', message);
        return;
      }

      setSaveStatus('success');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setSaveErrorMessage(errorMsg);
      setSaveStatus('error');
      console.error('Error saving exercise:', e);
    }
  }

  async function runCode() {
    setIsRunning(true);
    setOutput('⏳ Running code...');
    setSaveStatus('idle');
    setSaveErrorMessage(null);

    try {
      const languageId = languageToIdMap[language];
      const res = await fetch('http://localhost:2358/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_code: code, language_id: languageId }),
      });

      const data = await res.json();
      const resultOutput = data.stdout || data.compile_output || data.stderr || '⚠ No output';
      setOutput(resultOutput);

      // אם אין שגיאות, שמור את התרגיל
      if (!data.stderr && resultOutput.trim()) {
        await saveExercise();
      }
    } catch (e) {
      setOutput('❌ Error running code: ' + (e instanceof Error ? e.message : 'Unknown error'));
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
          onChange={(value) => setCode(value || '')}
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
          <button onClick={runCode} disabled={isRunning || !selectedExercise}>
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>

        {saveStatus === 'saving' && <p style={{ color: 'blue' }}>Saving exercise...</p>}
        {saveStatus === 'success' && <p style={{ color: 'green' }}>Exercise saved successfully!</p>}
        {saveStatus === 'error' && (
          <p style={{ color: 'red' }}>
            Error saving exercise: {saveErrorMessage || 'Unknown error'}
          </p>
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
