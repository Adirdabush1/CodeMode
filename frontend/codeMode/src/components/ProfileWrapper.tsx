import { useEffect, useState } from 'react';
import axios from 'axios';
import Profile from '../pages/Profile';

type UserData = {
  name: string;
  email: string;
};

const ProfileWrapper = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<UserData>('http://localhost:5000/user/me', {
          withCredentials: true, // חשוב!
        });
        setUserData(response.data);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUserData(null);
        // פה אפשר להוסיף ניתוב לדף login או הודעה למשתמש
      }
    };

    fetchProfile();
  }, []);

  if (!userData) return <div>Loading profile...</div>;

  return (
    <Profile
      name={userData.name || 'Anonymous'}
      title="Beginner"
      description="No description yet."
      points={100}
      level="1"
      exercisesSolved={5}
      successRate={70}
      avgSolveTime="2 min"
      email={userData.email}
      githubUrl="https://github.com/placeholder"
      status="Active"
      badges={['Newbie', 'Explorer']}
      avatarUrl="https://i.pravatar.cc/150?img=3"
    />
  );
};

export default ProfileWrapper;
