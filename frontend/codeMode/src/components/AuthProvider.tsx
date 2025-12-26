// src/components/AuthProvider.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import type { AuthContextType, User } from './AuthContext';
import { Loader } from './Loader';

type Props = { children: React.ReactNode };

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // בקשה ל־/user/me כדי לבדוק אם יש משתמש מחובר ולמלא את ה־user
    axios
      .get<User>('https://backend-codemode-9p1s.onrender.com/user/me', { withCredentials: true })
      .then((res) => {
        if (res && res.data) {
          setUser(res.data);
          setIsLoggedIn(true);
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setUser(null);
        setIsLoggedIn(false);
      })
      .then(() => setLoading(false));
  }, []);

  // לפי הטייפ ב־AuthContext: login מקבל User
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

 const logout = async () => {
  try {
    await axios.post(
      'https://backend-codemode-9p1s.onrender.com/auth/logout',
      {},
      { withCredentials: true }
    );
  } catch (err) {
    console.error('Logout failed', err);
  } finally {
    setUser(null);
    setIsLoggedIn(false);
  }
};

 if (loading) {
    return <Loader />;
  }

  const value: AuthContextType = {
    user,
    setUser,
    isLoggedIn,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
