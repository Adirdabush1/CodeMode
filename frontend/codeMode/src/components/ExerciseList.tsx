import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import './ExerciseList.css';

interface Exercise {
  _id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  programmingLanguage: string;
  description?: string;
  tags?: string[];
  examples?: { input: string; output: string }[];
}

interface SolvedExercise {
  exerciseId: string;
  name: string;
  solvedAt?: string;
}

export type Language =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'html'
  | 'css';
export type ExerciseItem = { id: string; language: Language };

interface ExerciseListProps {
  selectedLanguage: Language;
  onSelectExercise: (exercise: ExerciseItem) => void;
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth?.isLoggedIn) return;

    const fetchExercises = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://backend-codemode-9p1s.onrender.com/questions?programmingLanguage=${selectedLanguage}&page=${page}`,
          { credentials: 'include' }
        );

        const data = await res.json();
        console.log('📥 fetched data:', data);

        if (data.items && data.total !== undefined) {
          setExercises(data.items);
          setTotal(data.total);
        } else {
          setExercises(data);
          setTotal(data.length);
        }
      } catch (err) {
        console.error('Error fetching exercises', err);
        setExercises([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [selectedLanguage, auth?.isLoggedIn, page]);

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'green';
      case 'medium':
        return 'orange';
      case 'hard':
        return 'red';
      default:
        return 'black';
    }
  };

  if (!auth?.isLoggedIn) {
    return (
      <div className="card-section exercises-samples">
        <h3>Please log in to view exercises</h3>
      </div>
    );
  }

  const languages: Language[] = [
    'javascript',
    'python',
    'java',
    'typescript',
    'csharp',
    'cpp',
    'html',
    'css',
  ];

  return (
    <div className="card-section exercises-samples">
      <h3>
        Exercises ({total}) - Page {page}
      </h3>

      <div className="language-card-grid">
        {languages.map((lang) => (
          <button
            key={lang}
            className={`language-card ${selectedLanguage === lang ? 'active' : ''}`}
            onClick={() => {
              setPage(1);
              onSelectExercise({ id: '', language: lang });
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {exercises.map((exercise) => (
            <li
              key={exercise._id}
              className={selectedExercise === exercise._id ? 'selected-exercise' : ''}
              onClick={() =>
                onSelectExercise({ id: exercise._id, language: selectedLanguage })
              }
              style={{ cursor: 'pointer', color: difficultyColor(exercise.difficulty) }}
            >
              {exercise.description || 'No description available'}
            </li>
          ))}

          {solvedExercises.length > 0 && (
            <>
              <h4>Solved Exercises</h4>
              {solvedExercises.map((ex) => (
                <li
                  key={ex.exerciseId}
                  className={selectedExercise === ex.exerciseId ? 'selected-exercise' : ''}
                  onClick={() =>
                    onSelectExercise({ id: ex.exerciseId, language: selectedLanguage })
                  }
                  style={{ cursor: 'pointer', fontStyle: 'italic', color: 'green' }}
                >
                  {ex.name}
                </li>
              ))}
            </>
          )}
        </ul>
      )}

      {total > exercises.length && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <button disabled={page * 30 >= total} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
