// components/ExerciseList.tsx
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import './ExerciseList.css';

const exercisesByLanguage: Record<string, string[]> = {
  javascript: ["Reverse a string", "Fibonacci sequence", "Email validation"],
  python: ["Check prime number", "Factorial with recursion", "Parse JSON and print"],
  java: ["Class with getters/setters", "Bubble sort", "Palindrome check"],
  typescript: ["Use interfaces in function", "Generic function", "Object with optional props"],
  csharp: ["Console application", "Filter list with LINQ", "Exception handling"],
  cpp: ["Swap two numbers", "Stack with array", "Pointers to array"]
};

interface SolvedExercise {
  exerciseId: string;
  name: string;
  solvedAt?: string;
}

interface ExerciseListProps {
  selectedLanguage: string;
  onSelectExercise: (exerciseId: string) => void;
  selectedExercise: string | null;
  solvedExercises?: SolvedExercise[];
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  selectedLanguage,
  onSelectExercise,
  selectedExercise,
  solvedExercises = [],
}) => {
  const auth = useContext(AuthContext);

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
            className={`language-card ${selectedLanguage === lang ? 'active' : ''}`}
            onClick={() => onSelectExercise('')} // ניקוי הבחירה כשמשנים שפה
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <ul>
        {/* תרגילים לדוגמה לפי שפה */}
        {exercisesByLanguage[selectedLanguage].map((exercise) => (
          <li
            key={exercise}
            className={selectedExercise === exercise ? 'selected-exercise' : ''}
            onClick={() => onSelectExercise(exercise)}
            style={{ cursor: 'pointer' }}
          >
            {exercise}
          </li>
        ))}

        {/* תרגילים שנפתרו מהמשתמש */}
        {solvedExercises.length > 0 && (
          <>
            <h4>Solved Exercises</h4>
            {solvedExercises.map((ex) => (
              <li
                key={ex.exerciseId}
                className={selectedExercise === ex.exerciseId ? 'selected-exercise' : ''}
                onClick={() => onSelectExercise(ex.exerciseId)}
                style={{ cursor: 'pointer', fontStyle: 'italic', color: 'green' }}
              >
                {ex.name}
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
};

export default ExerciseList;
