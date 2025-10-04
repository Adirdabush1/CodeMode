// Practice.tsx
import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import ExerciseList from '../components/ExerciseList';
import MenuBar from '../components/MenuBar';
import Swal from 'sweetalert2';
import './Practice.css';

type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'html'
  | 'css';

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
  time?: string;
};

type Example = { input: string; output: string };

type Exercise = {
  _id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  programmingLanguage: string;
  description?: string;
  tags?: string[];
  examples?: Example[];
  starterCode?: string;
};

const Practice: React.FC = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState<Language>('javascript');
  const [stdin] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userFeedback] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('aiUsageCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<ChatMessage[]>([]);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const [showAiChat, setShowAiChat] = useState(false);

  useEffect(() => {
    const el = historyRef.current || document.getElementById('aiChatHistory');
    if (el) {
      try {
        el.scrollTop = el.scrollHeight;
      } catch (e) {
        console.log('Error scrolling AI chat history', e);
      }
    }
  }, [aiChat, showAiChat]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && showAiChat) setShowAiChat(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAiChat]);

  // כשנבחר תרגיל — נטען את פרטי התרגיל מהמיאבק (כולל examples)
  useEffect(() => {
    if (!selectedExercise) {
      setCurrentExercise(null);
      return;
    }

    let canceled = false;
    async function fetchExercise() {
      try {
        // נניח שיש endpoint GET /questions/:id שמחזיר את פרטי התרגיל
        const res = await fetch(
          `https://backend-codemode-9p1s.onrender.com/questions/${selectedExercise}`,
          { credentials: 'include' }
        );
        if (!res.ok) {
          // fallback: אם אין endpoint כזה, אפשר לנסות /questions?id=...
          console.warn('Failed to fetch exercise details', res.status);
          setCurrentExercise(null);
          return;
        }
        const data = await res.json();
        if (!canceled) {
          setCurrentExercise(data);
          // אם יש starterCode בתרגיל, נטען אותו אוטומטית לעריכה
          if (data?.starterCode && typeof data.starterCode === 'string') {
            setCode(data.starterCode);
          }
        }
      } catch (err) {
        console.error('Error fetching exercise details', err);
        if (!canceled) setCurrentExercise(null);
      }
    }

    fetchExercise();
    return () => {
      canceled = true;
    };
  }, [selectedExercise]);

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
        const errorData = await res.json().catch(() => ({}));
        setSaveErrorMessage(errorData?.message || 'Failed to save exercise');
        setSaveStatus('error');
        return;
      }

      setSaveStatus('success');
    } catch (e) {
      setSaveErrorMessage(e instanceof Error ? e.message : 'Unknown error');
      setSaveStatus('error');
    }
  }

  async function isLoggedIn(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (token) return true;

    try {
      const meRes = await fetch('https://backend-codemode-9p1s.onrender.com/user/me', {
        credentials: 'include',
      });
      return meRes.ok;
    } catch (err) {
      console.error('isLoggedIn check failed', err);
      return false;
    }
  }

  // Run Code — עכשיו גם בודק מול ה-examples אם קיימים, עם נרמול פלט
async function runCode() {
  if (!selectedExercise) return;

  setIsRunning(true);
  setOutput('⏳ Running tests...');
  setSaveStatus('idle');
  setSaveErrorMessage(null);

  try {
    const token = localStorage.getItem('token');
    const tests = currentExercise?.examples && currentExercise.examples.length > 0
      ? currentExercise.examples
      : null;

    const normalize = (str: string) =>
      str
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');

    // ריצה רגילה אם אין examples
    if (!tests) {
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
      const resultOutput = data.stdout || data.output || '';
      setOutput(resultOutput || '⚠ No output returned.');
      if (resultOutput.trim()) await saveExercise();
      return;
    }

    // עם examples
    const results: string[] = [];
    let allPassed = true;

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const res = await fetch('https://backend-codemode-9p1s.onrender.com/judge/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, language, stdin: test.input }),
        credentials: token ? undefined : 'include',
      });

      if (!res.ok) {
        const txt = await res.text();
        results.push(`⚠ Test ${i + 1}: Judge error (HTTP ${res.status}): ${txt}`);
        allPassed = false;
        continue;
      }

      const data = await res.json();
      const actualRaw = data.stdout || data.output || '';
      const expectedRaw = test.output || '';

      let normalizedActual = normalize(actualRaw);
      let normalizedExpected = normalize(expectedRaw);

      // אם הפלט או הציפייה הם JSON (array/object) - נשווה באמצעות JSON.stringify
      try {
        const actualParsed = JSON.parse(actualRaw);
        const expectedParsed = JSON.parse(expectedRaw);
        normalizedActual = JSON.stringify(actualParsed);
        normalizedExpected = JSON.stringify(expectedParsed);
      } catch {
        // אם לא JSON - נשאיר את הנרמול הרגיל
      }

      if (normalizedActual === normalizedExpected) {
        results.push(`✅ Test ${i + 1} passed\nInput: ${test.input}\nOutput: ${actualRaw}`);
      } else {
        allPassed = false;

        const actualLines = normalizedActual.split('\n');
        const expectedLines = normalizedExpected.split('\n');
        const lineDiffs: string[] = [];

        const maxLines = Math.max(actualLines.length, expectedLines.length);
        for (let j = 0; j < maxLines; j++) {
          const a = actualLines[j] ?? '(empty)';
          const e = expectedLines[j] ?? '(empty)';
          if (a !== e) lineDiffs.push(`Line ${j + 1}: Expected "${e}", got "${a}"`);
        }

        results.push(
          `❌ Test ${i + 1} failed\nInput: ${test.input}\nExpected: ${expectedRaw || '(empty)'}\nGot: ${actualRaw || '(empty)'}\nDifferences:\n${lineDiffs.join('\n')}`
        );
      }
    }

    setOutput(results.join('\n\n'));

    if (allPassed) {
      Swal.fire({
        icon: 'success',
        title: 'Correct!',
        text: 'All tests passed 🎉',
        background: '#f4f6f9',
      });
      await saveExercise();
    }
  } catch (e: unknown) {
    setOutput(`❌ Error running code: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
  } finally {
    setIsRunning(false);
  }
}



  async function analyzeCode() {
    const loggedIn = await isLoggedIn();

    if (!loggedIn && aiUsageCount >= 1) {
      Swal.fire({
        icon: 'info',
        title: 'AI Access Limited',
        text: 'To continue using AI analysis, please log in or sign up.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#3085d6',
        background: '#f4f6f9',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login';
      });
      return;
    }

    setIsAiRunning(true);
    setOutput('🤖 Analyzing with AI...');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://backend-codemode-9p1s.onrender.com/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, userFeedback }),
        credentials: token ? undefined : 'include',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => 'No body');
        setOutput(`❌ AI analyze error (HTTP ${res.status}): ${txt}`);
        return;
      }

      const data = await res.json();
      setOutput(data.result || 'No analysis returned');

      if (!loggedIn) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e) {
      setOutput(`❌ Error analyzing: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsAiRunning(false);
    }
  }

  async function askAiQuestion() {
    const question = aiQuery.trim();
    if (!question) return;

    const loggedIn = await isLoggedIn();

    if (!loggedIn && aiUsageCount >= 1) {
      Swal.fire({
        icon: 'info',
        title: 'AI Access Limited',
        text: 'To continue using AI assistant, please log in or sign up.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#3085d6',
        background: '#f4f6f9',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login';
      });
      return;
    }

    const userMsg: ChatMessage = { role: 'user', text: question, time: new Date().toISOString() };
    setAiChat((prev) => [...prev, userMsg]);
    setAiQuery('');
    setIsAiRunning(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://backend-codemode-9p1s.onrender.com/ai-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, question, userFeedback }),
        credentials: token ? undefined : 'include',
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => 'No body');
        const errMsg = `❌ AI error (HTTP ${res.status}): ${txt}`;
        setAiChat((prev) => [...prev, { role: 'assistant', text: errMsg, time: new Date().toISOString() }]);
        return;
      }

      const data = await res.json();
      const answer = data.result || data.answer || data.message || 'No reply from AI';
      setAiChat((prev) => [...prev, { role: 'assistant', text: answer, time: new Date().toISOString() }]);

      if (!loggedIn) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e) {
      setAiChat((prev) => [
        ...prev,
        { role: 'assistant', text: `❌ Error: ${e instanceof Error ? e.message : 'Unknown error'}`, time: new Date().toISOString() },
      ]);
    } finally {
      setIsAiRunning(false);
    }
  }

  return (
    <div className="practice-page">
      <MenuBar />
      <h1></h1>

      <ExerciseList
        selectedLanguage={language}
        selectedExercise={selectedExercise}
        onSelectExercise={(exercise) => {
          setSelectedExercise(exercise.id);
          setLanguage(exercise.language);
          setSaveStatus('idle');
          setSaveErrorMessage(null);
        }}
      />

      <Editor
        height="400px"
        language={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, automaticLayout: true, fontSize: 14 }}
      />

      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={runCode} disabled={isRunning || !selectedExercise}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <button onClick={analyzeCode} disabled={isAiRunning}>
          {isAiRunning ? 'Analyzing...' : 'Analyze Code (AI)'}
        </button>

        <button onClick={() => setShowAiChat(true)} disabled={showAiChat}>
          Open AI Assistant
        </button>
      </div>

      {/* הצגת סטטוס רק אחרי ניסיון שמירה */}
      {saveStatus !== 'idle' && (
        <div style={{ marginTop: 16 }}>
          {saveStatus === 'saving' && <p style={{ color: 'blue' }}>Saving exercise...</p>}
          {saveStatus === 'success' && <p style={{ color: 'green' }}>Exercise saved successfully!</p>}
          {saveStatus === 'error' && (
            <p style={{ color: 'red' }}>Error saving exercise: {saveErrorMessage || 'Unknown error'}</p>
          )}
        </div>
      )}

      <pre className="output-pre">{output}</pre>

      {showAiChat && (
        <div className="ai-chat-modal-overlay" onClick={() => setShowAiChat(false)}>
          <div className="ai-chat-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="ai-chat-modal-header">
              <div>
                <div className="ai-chat-title">AI Assistant</div>
                <div className="ai-chat-sub">Ask questions about your code</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="ai-send-btn"
                  onClick={() => {
                    if (!isAiRunning) analyzeCode();
                  }}
                  disabled={isAiRunning}
                  style={{ padding: '8px 10px' }}
                >
                  {isAiRunning ? 'Analyzing...' : 'Analyze'}
                </button>
                <button className="ai-close-btn" onClick={() => setShowAiChat(false)}>
                  Close
                </button>
              </div>
            </div>

            <div className="ai-chat-modal-body">
              <div className="ai-chat-history" id="aiChatHistory" ref={historyRef}>
                {aiChat.length === 0 ? (
                  <p style={{ color: '#666' }}>No messages yet. Ask the AI a question about your code.</p>
                ) : (
                  aiChat.map((m, idx) => (
                    <div key={idx} className={`ai-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                      <strong style={{ fontSize: 12 }}>{m.role === 'user' ? 'You' : 'AI'}</strong>
                      <div style={{ marginTop: 6 }}>{m.text}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="ai-chat-input-row">
                <input
                  className="ai-chat-input"
                  type="text"
                  placeholder="Ask a question about the code (press Enter to send)"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      askAiQuestion();
                    }
                  }}
                />
                <button className="ai-send-btn" onClick={askAiQuestion} disabled={isAiRunning}>
                  {isAiRunning ? 'Thinking...' : 'Send'}
                </button>
              </div>

              <div className="ai-usage" style={{ marginTop: 8 }}>
                {!localStorage.getItem('token') && <span>Anonymous AI uses left: {Math.max(0, 1 - aiUsageCount)}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Practice;
