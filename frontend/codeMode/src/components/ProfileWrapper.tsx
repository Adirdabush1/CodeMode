//profile wrapper
import { useEffect, useState } from 'react';
import axios from 'axios';
import Profile from '../pages/Profile';

type SolvedExercise = {
  exerciseId: string;
  name?: string;
  code: string;
  solvedAt: string;
};

type UserData = {
  name: string;
  email: string;
  title: string;
  description: string;
  points: number;
  level: string;
  exercisesSolved: number;
  successRate: number;
  avgSolveTime: string;
  githubUrl: string;
  status: string;
  badges: string[];
  avatarUrl: string;
  solvedExercises: { exerciseId: string; code: string; solvedAt: string }[]; // אובייקטים
};

// מיפוי מזהי תרגילים לשמות
const exercisesById: Record<string, string> = {
  '1': 'Reverse a string',
  '2': 'Fibonacci sequence',
  '3': 'Email validation',
  '4': 'Check prime number',
  '5': 'Factorial with recursion',
  '6': 'Parse JSON and validate',
};

const ProfileWrapper = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<UserData>(
          'https://backend-codemode-9p1s.onrender.com/user/me',
          { withCredentials: true }
        );
        setUserData(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUserData(null);
      }
    };
    fetchProfile();
  }, []);

  if (!userData) return <div>Loading profile...</div>;

  // ממיר את solvedExercises למערך עם שם ותאריך
  const mappedSolvedExercises: SolvedExercise[] = userData.solvedExercises.map(ex => ({
    exerciseId: ex.exerciseId,
    name: exercisesById[ex.exerciseId] || ex.exerciseId,
    code: ex.code,
    solvedAt: new Date(ex.solvedAt).toLocaleString(), // תאריך קריא
  }));

  return (
    <Profile
      name={userData.name || 'Anonymous'}
      title={userData.title || 'Beginner'}
      description={userData.description || 'No description yet.'}
      points={userData.points || 0}
      level={userData.level || '1'}
      exercisesSolved={userData.exercisesSolved || 0}
      successRate={userData.successRate || 0}
      avgSolveTime={userData.avgSolveTime || 'N/A'}
      email={userData.email}
      githubUrl={userData.githubUrl || ''}
      status={userData.status || 'Active'}
      badges={userData.badges || []}
      avatarUrl={userData.avatarUrl || 'https://i.pravatar.cc/150?img=3'}
      solvedExercises={mappedSolvedExercises}
    />
  );
};

export default ProfileWrapper;
