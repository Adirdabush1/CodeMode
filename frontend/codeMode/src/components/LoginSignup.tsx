import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginSignup.css';
import MenuBar from "../components/MenuBar";
import { useAuth } from '../components/useAuth';
import type { User } from '../components/AuthContext';

interface CustomAxiosError {
  isAxiosError: boolean;
  response?: { data?: { message?: string } };
  message: string;
}

function isAxiosError(error: unknown): error is CustomAxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as CustomAxiosError).isAxiosError === true
  );
}

const BACKEND_URL = 'https://backend-codemode-9p1s.onrender.com';

const LoginSignup: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('');

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInMessage, setSignInMessage] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const handleSignUpClick = () => containerRef.current?.classList.add('right-panel-active');
  const handleSignInClick = () => containerRef.current?.classList.remove('right-panel-active');

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BACKEND_URL}/auth/signup`,
        {
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
        },
        { withCredentials: true }
      );
      await Swal.fire({
        icon: 'success',
        title: 'Registration successful!',
        showConfirmButton: false,
        timer: 1000,
      });
      setSignUpMessage('');
      containerRef.current?.classList.remove('right-panel-active');

      // אופציה: לנווט לפרופיל או ל-login אוטומטי אם ה-backend יוצר session
      navigate('/profile');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: error.response?.data?.message || error.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: 'An unexpected error occurred',
        });
      }
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        {
          email: signInEmail,
          password: signInPassword,
        },
        { withCredentials: true }
      );

      // --- שינוי: cast ל-any כדי למנוע שגיאות טיפוסיות על res.data ---
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = res.data;

      // נסה להוציא את פרטי המשתמש מהתשובה (support ל-data.user או data)
      let userFromServer: User | null = (data?.user ?? data) as User | null;

      // אם אין פרטי משתמש בתשובת ה-login — בקש /user/me כגיבוי
      if (!userFromServer || !userFromServer.name) {
        try {
          const meRes = await axios.get<User>(`${BACKEND_URL}/user/me`, { withCredentials: true });
          userFromServer = meRes.data;
        } catch  {
          userFromServer = null;
        }
      }

      if (!userFromServer) {
        throw new Error('Login succeeded but failed to retrieve user profile.');
      }

      // מעדכן את ה־AuthContext עם פרטי המשתמש
      login(userFromServer);

      await Swal.fire({
        icon: 'success',
        title: 'Login successful!',
        showConfirmButton: false,
        timer: 1500,
      });

      setSignInMessage('');
      navigate('/profile');
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: error.response?.data?.message || error.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: (error as Error)?.message || 'An unexpected error occurred',
        });
      }
    } finally {
      setSignInLoading(false);
    }
  };

  return (
    <>
      <MenuBar />
      <div className="login-signup-root">
        <div className="container" id="container" ref={containerRef}>
          {/* Sign Up */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUpSubmit}>
              <h1>Create Account</h1>
              <span>or use your email for registration</span>
              <input
                type="text"
                placeholder="Name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button type="submit">Sign Up</button>
              {signUpMessage && <p>{signUpMessage}</p>}
            </form>
          </div>

          {/* Sign In */}
          <div className="form-container sign-in-container">
            <form onSubmit={handleSignInSubmit}>
              <h1>Sign in</h1>
              <span>or use your account</span>
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="submit" disabled={signInLoading}>
                {signInLoading ? 'Signing in...' : 'Sign In'}
              </button>
              {signInMessage && <p>{signInMessage}</p>}
            </form>
          </div>

          {/* Overlay */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" onClick={handleSignInClick}>Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start journey with us</p>
                <button className="ghost" onClick={handleSignUpClick}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>

        <footer>
          <p>all rights reserved &copy; 2025 CodeMode</p>
        </footer>
      </div>
    </>
  );
};

export default LoginSignup;
