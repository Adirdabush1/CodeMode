import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './components/useAuth';
import { Loader } from './components/Loader';

import './App.css';

const Home = lazy(() => import('./pages/Home'));
const LoginSignup = lazy(() => import('./components/LoginSignup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Practice = lazy(() => import('./pages/Practice'));
const ProfileWrapper = lazy(() => import('./components/ProfileWrapper'));

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 2rem', fontFamily: 'Montserrat, system-ui, sans-serif' }}>
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" style={{ color: '#E67E22' }}>Go back home</Link>
    </div>
  );
}

function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
