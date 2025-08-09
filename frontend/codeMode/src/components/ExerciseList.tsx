// components/ExerciseList.tsx
import React, { useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import './ExerciseList.css';

const exercisesByLanguage: Record<string, string[]> = {
  javascript: [
    "Reverse a string",
    "Fibonacci sequence",
    "Email validation"
  ],
  python: [
    "Check prime number",
    "Factorial with recursion",
    "Parse JSON and print"
  ],
  java: [
    "Class with getters/setters",
    "Bubble sort",
    "Palindrome check"
  ],
  typescript: [
    "Use interfaces in function",
    "Generic function",
    "Object with optional props"
  ],
  csharp: [
    "Console application",
    "Filter list with LINQ",
    "Exception handling"
  ],
  cpp: [
    "Swap two numbers",
    "Stack with array",
    "Pointers to array"
  ]
};

const ExerciseList: React.FC = () => {
  const auth = useContext(AuthContext);
  const [selectedLang, setSelectedLang] = useState<string>('javascript');

  if (!auth?.isLoggedIn) {
    return (
      <div className="card-section exercises-samples">
        <h3>Please log in to view exercises</h3>
      </div>
    );
  }

  return (
    <div className="card-section exercises-samples">
      <h3>Sample Exercises</h3>

      <div className="language-card-grid">
        {Object.keys(exercisesByLanguage).map((lang) => (
          <button
            key={lang}
            className={`language-card ${selectedLang === lang ? 'active' : ''}`}
            onClick={() => setSelectedLang(lang)}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <ul>
        {exercisesByLanguage[selectedLang].map((exercise, i) => (
          <li key={i}>{`Exercise ${i + 1}: ${exercise}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default ExerciseList;
