import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/useAuth';

import LoginSignup from './components/LoginSignup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';

import ProfileWrapper from './components/ProfileWrapper';
import { Loader } from './components/Loader';  // הוספתי את ה-loader

import './App.css';
import { useEffect, useState } from 'react';

function App() {
  const { isLoggedIn, loading } = useAuth();  // הנח ש־useAuth מחזיר גם loading

  // Show a short splash loader on first load so the app feels intentional.
  const [splashVisible, setSplashVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading || splashVisible) {
    // מציג את ה-loader כל עוד הטעינה בעיצומה
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/profile" /> : <LoginSignup />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        
        
        <Route
          path="/profile"
          element={isLoggedIn ? <ProfileWrapper /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
