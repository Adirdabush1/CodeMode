import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import Home from './pages/Home';
import Dashboard from './pages/dashboard';
import Practice from './pages/practice';
import Feedback from './pages/feedback ';
import Profile from './pages/profile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />              {/* דף הבית */}
        <Route path="/login" element={<LoginSignup />} />  {/* התחברות */}
        <Route path="/dashboard" element={<Dashboard />} />{/* לוח בקרה */}
        <Route path="/practice" element={<Practice />} />  {/* עורך תרגול */}
        <Route path="/feedback" element={<Feedback />} />  {/* פידבק מה-AI */}
        <Route path="/profile" element={<Profile />} />    {/* פרופיל משתמש */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
