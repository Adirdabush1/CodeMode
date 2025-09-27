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

const Practice: React.FC = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState<Language>('javascript');
  const [stdin, setStdin] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const [aiUsageCount, setAiUsageCount] = useState<number>(() => {
    const saved = localStorage.getItem('aiUsageCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  // AI-specific state: שדה לשאלה והיסטוריית שיחה
  const [aiQuery, setAiQuery] = useState('');
  const [aiChat, setAiChat] = useState<ChatMessage[]>([]);

  // ref להיסטוריית הצ'אט — גלילה אוטומטית
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = historyRef.current || document.getElementById('aiChatHistory');
    if (el) {
      // גלילה חלקה לתחתית
      try {
        el.scrollTop = el.scrollHeight;
      } catch {
        /* ignore */
      }
    }
  }, [aiChat]);

  // 🔹 Save exercise
  async function saveExercise() {
    if (!selectedExercise || !code.trim()) return;

    setSaveStatus('saving');
    setSaveErrorMessage(null);

    try {
      const res = await fetch(
        'https://backend-codemode-9p1s.onrender.com/user/add-solved',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exerciseId: selectedExercise,
            code,
            feedback: userFeedback,
            stdin,
          }),
          credentials: 'include',
        }
      );

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

  // helper לבדוק אם מחובר (token או cookies)
  async function isLoggedIn(): Promise<boolean> {
    const token = localStorage.getItem('token');
    if (token) return true;

    try {
      const meRes = await fetch(
        'https://backend-codemode-9p1s.onrender.com/user/me',
        { credentials: 'include' }
      );
      return meRes.ok;
    } catch {
      return false;
    }
  }

  // 🔹 Run code
  async function runCode() {
    if (!selectedExercise) return;

    setIsRunning(true);
    setOutput('⏳ Running code...');
    setSaveStatus('idle');
    setSaveErrorMessage(null);

    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        'https://backend-codemode-9p1s.onrender.com/judge/run',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code, language, stdin }),
          credentials: token ? undefined : 'include',
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setOutput(`❌ Judge0 error (HTTP ${res.status}): ${text}`);
        return;
      }

      const data = await res.json();
      let resultOutput = data.output || '';

      if (!resultOutput.trim()) {
        if (data.compile_output)
          resultOutput += `💻 Compile Output:\n${data.compile_output}\n`;
        if (data.stderr)
          resultOutput += `❌ Runtime Error:\n${data.stderr}\n`;
        if (data.stdout) resultOutput += `✅ Output:\n${data.stdout}\n`;
        if (data.message) resultOutput += `ℹ Message:\n${data.message}\n`;
        if (data.status)
          resultOutput += `📌 Status: ${data.status.description}\n`;
      }

      if (!resultOutput.trim()) resultOutput = '⚠ No output returned.';

      setOutput(resultOutput);

      if (!data.stderr && resultOutput.trim()) await saveExercise();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      setOutput(`❌ Error running code: ${errorMessage}`);
    } finally {
      setIsRunning(false);
    }
  }

  // 🔹 Analyze code (general analysis, existing)
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
      const res = await fetch(
        'https://backend-codemode-9p1s.onrender.com/ai-analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ code, userFeedback }),
          credentials: token ? undefined : 'include',
        }
      );

      const data = await res.json();
      setOutput(data.result || 'No analysis returned');

      // שמירת שימוש באנונימי
      if (!loggedIn) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e) {
      setOutput(
        '❌ Error analyzing: ' + (e instanceof Error ? e.message : 'Unknown error')
      );
    } finally {
      setIsAiRunning(false);
    }
  }

  // 🔹 Ask a specific question to the AI (chat-style)
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

    // הוספת הודעת המשתמש להיסטוריית הצ'אט מידית
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
        body: JSON.stringify({
          code,
          question, // שולח גם את השאלה המפורשת
          userFeedback,
          // אפשר לשלוח גם היסטוריית שיחה במידת הצורך: chat: aiChat
        }),
        credentials: token ? undefined : 'include',
      });

      if (!res.ok) {
        const txt = await res.text();
        const errMsg = `❌ AI error (HTTP ${res.status}): ${txt}`;
        setAiChat((prev) => [...prev, { role: 'assistant', text: errMsg, time: new Date().toISOString() }]);
        return;
      }

      const data = await res.json();
      // backend צריך להחזיר תשובה בשדה מתאים; ננסה 'result' או 'answer' או 'message'
      const answer = data.result || data.answer || data.message || 'No reply from AI';
      const assistantMsg: ChatMessage = { role: 'assistant', text: answer, time: new Date().toISOString() };
      setAiChat((prev) => [...prev, assistantMsg]);

      // עידכון מונה שימוש לא מקושר
      if (!loggedIn) {
        const newCount = aiUsageCount + 1;
        localStorage.setItem('aiUsageCount', newCount.toString());
        setAiUsageCount(newCount);
      }
    } catch (e) {
      const errText = e instanceof Error ? e.message : 'Unknown error';
      setAiChat((prev) => [...prev, { role: 'assistant', text: `❌ Error: ${errText}`, time: new Date().toISOString() }]);
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
      </div>

      <div style={{ marginTop: 16 }}>
        {saveStatus === 'saving' && <p style={{ color: 'blue' }}>Saving exercise...</p>}
        {saveStatus === 'success' && <p style={{ color: 'green' }}>Exercise saved successfully!</p>}
        {saveStatus === 'error' && (
          <p style={{ color: 'red' }}>Error saving exercise: {saveErrorMessage || 'Unknown error'}</p>
        )}
      </div>

      {/* Output area */}
      <pre className="output-pre">{output}</pre>

      {/* User feedback + stdin */}
      <textarea
        placeholder="What did you learn? Where did you get stuck?"
        value={userFeedback}
        onChange={(e) => setUserFeedback(e.target.value)}
        style={{ width: '100%', minHeight: 80, marginTop: 12 }}
      />
      <textarea
        placeholder="Optional input (stdin) for the exercise"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
        style={{ width: '100%', minHeight: 40, marginTop: 8 }}
      />

      {/* ---------- AI Chat UI (uses classes from Practice.css) ---------- */}
      <div className="ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-title">AI Assistant</div>
          <div className="ai-chat-sub">Ask questions about your code</div>
        </div>

        <div
          className="ai-chat-history"
          id="aiChatHistory"
          ref={historyRef}
        >
          {aiChat.length === 0 ? (
            <p style={{ color: '#666' }}>No messages yet. Ask the AI a question about your code.</p>
          ) : (
            aiChat.map((m, idx) => (
              <div key={idx} className={`ai-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                <strong style={{ fontSize: 12 }}>{m.role === 'user' ? 'You' : 'AI'}</strong>
                <div style={{ marginTop: 6 }}>{m.text}</div>
                {/* optional timestamp */}
                {/* <span className="time">{new Date(m.time || '').toLocaleTimeString()}</span> */}
              </div>
            ))
          )}
        </div>

        <div className="ai-chat-input-row">
          <input
            className="ai-chat-input"
            type="text"
            placeholder="Ask a question about the code (e.g. 'Why do I get NullPointerException?')"
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

        <div className="ai-usage">
          {!localStorage.getItem('token') && (
            <span>Anonymous AI uses left: {Math.max(0, 1 - aiUsageCount)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Practice;
