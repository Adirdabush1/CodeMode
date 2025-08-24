// AuthProvider.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';
import { Loader } from './Loader'; // Import the Loader component
type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ניהול מצב טעינה

  // בדיקת התחברות אוטומטית בעת טעינת הקומפוננטה
  useEffect(() => {
    axios.get('https://backend-codemode-9p1s.onrender.com/user/me', { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .then(() => setLoading(false)); // שימוש ב-finally לשחרור loading בכל מצב
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    // מומלץ לקרוא API ל-logout כאן ולנקות קוקיז
    setIsLoggedIn(false);
  };

  // מחזיר את קומפוננטת הטעינה בזמן loading
  if (loading) {
    return <Loader />; // אפשר להחליף ב-Komponentת Loader שלך
  }

  const value: AuthContextType = { isLoggedIn, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
