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
  const [signUpLoading, setSignUpLoading] = useState(false);

  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInMessage, setSignInMessage] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  const handleSignUpClick = () => containerRef.current?.classList.add('right-panel-active');
  const handleSignInClick = () => containerRef.current?.classList.remove('right-panel-active');

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLoading(true);
    try {
      await axios.post(
        `${BACKEND_URL}/auth/signup`,
        { name: signUpName, email: signUpEmail, password: signUpPassword },
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
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/auth/login`,
        { email: signInEmail, password: signInPassword },
        { withCredentials: true }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = res.data;
      let userFromServer: User | null = (data?.user ?? data) as User | null;

      if (!userFromServer || !userFromServer.name) {
        try {
          const meRes = await axios.get<User>(`${BACKEND_URL}/user/me`, { withCredentials: true });
          userFromServer = meRes.data;
        } catch {
          userFromServer = null;
        }
      }

      if (!userFromServer) {
        throw new Error('Login succeeded but failed to retrieve user profile.');
      }

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
        <h1 className="sr-only">CodeMode - Login or Sign Up</h1>
        <div className="container" id="container" ref={containerRef}>
          {/* Sign Up */}
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUpSubmit}>
              <h2>Create Account</h2>
              <span>Start your coding journey today</span>
              <input
                type="text"
                placeholder="Full Name"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                required
                aria-label="Full name"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-label="Password"
                minLength={6}
              />
              <button type="submit" disabled={signUpLoading}>
                {signUpLoading ? 'Creating...' : 'Sign Up'}
              </button>
              {signUpMessage && <p role="alert">{signUpMessage}</p>}
            </form>
          </div>

          {/* Sign In */}
          <div className="form-container sign-in-container">
            <form onSubmit={handleSignInSubmit}>
              <h2>Welcome Back</h2>
              <span>Sign in to continue coding</span>
              <input
                type="email"
                placeholder="Email Address"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                autoComplete="username"
                aria-label="Email address"
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-label="Password"
              />
              <button type="submit" disabled={signInLoading}>
                {signInLoading ? 'Signing in...' : 'Sign In'}
              </button>
              {signInMessage && <p role="alert">{signInMessage}</p>}
            </form>
          </div>

          {/* Overlay (desktop) */}
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h2>Welcome Back!</h2>
                <p>Already have an account? Sign in to pick up where you left off.</p>
                <button className="ghost" onClick={handleSignInClick} type="button">Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h2>New Here?</h2>
                <p>Create an account and start practicing with your AI coding mentor.</p>
                <button className="ghost" onClick={handleSignUpClick} type="button">Sign Up</button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile toggle (visible only on small screens) */}
        <div className="mobile-toggle">
          <button type="button" onClick={handleSignUpClick}>Don't have an account? Sign Up</button>
          <button type="button" onClick={handleSignInClick}>Already have an account? Sign In</button>
        </div>

        <footer>
          <p>All rights reserved &copy; {new Date().getFullYear()} CodeMode</p>
        </footer>
      </div>
    </>
  );
};

export default LoginSignup;
