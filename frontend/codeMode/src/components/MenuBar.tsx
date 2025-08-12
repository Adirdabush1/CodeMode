import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/useAuth'; 
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  return (
    <ul className="menu-bar">
      <li onClick={() => navigate('/')}>Home</li>

      {!isLoggedIn && (
        <li onClick={() => navigate('/login')}>Login & Signup</li>
      )}

      <li onClick={() => navigate('/dashboard')}>Dashboard</li>
      <li onClick={() => navigate('/practice')}>Practice</li>
     

      {isLoggedIn && (
        <>
          <li onClick={() => navigate('/profile')}>Profile</li>
          <li onClick={logout}>Logout</li>
        </>
      )}
    </ul>
  );
};

export default MenuBar;
