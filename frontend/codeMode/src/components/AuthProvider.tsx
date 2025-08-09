import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import type { AuthContextType } from './AuthContext';

type Props = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // כדי לנהל טעינה בזמן הבדיקה

  // בדיקת התחברות אוטומטית בעת טעינת הקומפוננטה
  useEffect(() => {
    axios.get('http://localhost:5000/user/me', { withCredentials: true })
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false))
      .then(() => setLoading(false));
  }, []);

  const login = () => setIsLoggedIn(true);
  const logout = () => {
    // כאן מומלץ לקרוא ל־API logout או לפחות למחוק את ה-cookie בצד השרת
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Loading...</div>; // או כל קומפוננטת טעינה
  }

  const value: AuthContextType = { isLoggedIn, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
