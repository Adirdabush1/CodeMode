import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './LoginSignup.css';
import MenuBar from "../components/MenuBar";

type LoginResponse = {
  access_token: string;
};

const LoginSignup: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // States טופס הרשמה
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('');

  // States טופס התחברות
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInMessage, setSignInMessage] = useState('');

  const handleSignUpClick = () => {
    containerRef.current?.classList.add('right-panel-active');
  };

  const handleSignInClick = () => {
    containerRef.current?.classList.remove('right-panel-active');
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/signup', {
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Registration successful!',
        showConfirmButton: false,
        timer: 1500
      });
      setSignUpMessage('');
      containerRef.current?.classList.remove('right-panel-active');
      navigate('/profile'); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
          text: error.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration failed',
        });
      }
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<LoginResponse>('http://localhost:5000/auth/login', {
        email: signInEmail,
        password: signInPassword,
      });
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem('token', token);
      }
      await Swal.fire({
        icon: 'success',
        title: 'Login successful!',
        showConfirmButton: false,
        timer: 1500
      });
      setSignInMessage('');
      navigate('/profile');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: error.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
        });
      }
    }
  };

  return (
    <>
      <MenuBar/>
      <div className="login-signup-root">
        <div className="container" id="container" ref={containerRef}>
          <div className="form-container sign-up-container">
            <form onSubmit={handleSignUpSubmit}>
              <h1>Create Account</h1>
              <div className="social-container">
                <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              </div>
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
              />
              <button type="submit">Sign Up</button>
              {signUpMessage && <p>{signUpMessage}</p>}
            </form>
          </div>

          <div className="form-container sign-in-container">
            <form onSubmit={handleSignInSubmit}>
              <h1>Sign in</h1>
              <div className="social-container">
                <a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
                <a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <span>or use your account</span>
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
              <a href="#">Forgot your password?</a>
              <button type="submit">Sign In</button>
              {signInMessage && <p>{signInMessage}</p>}
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" id="signIn" onClick={handleSignInClick}>Sign In</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start journey with us</p>
                <button className="ghost" id="signUp" onClick={handleSignUpClick}>Sign Up</button>
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
