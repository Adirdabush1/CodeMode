import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ul className="menu-bar">
      <li onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Home
      </li>
      <li onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
        Login & Signup
      </li>
      <li onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        Dashboard
      </li>
      <li onClick={() => navigate('/practice')} style={{ cursor: 'pointer' }}>
        Practice
      </li>
      <li onClick={() => navigate('/feedback')} style={{ cursor: 'pointer' }}>
        Feedback
      </li>
      <li onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
        Profile
      </li>
    </ul>
  );
};

export default MenuBar;
