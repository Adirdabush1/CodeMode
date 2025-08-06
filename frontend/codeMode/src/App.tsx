import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Feedback from './pages/Feedback ';
 import ProfileWrapper from './components/ProfileWrapper'; 

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
                <Route path="/profile" element={<ProfileWrapper />} />    {/* כאן! */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
