import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/useAuth';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <nav className="menu-bar">
      <div className="logo" onClick={() => navigate('/')}>CodeMode</div>

      <div className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
        <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <span style={{ opacity: menuOpen ? 0 : 1 }} />
        <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }} />
      </div>

      <ul className={menuOpen ? 'open' : ''}>
        <li onClick={() => { navigate('/'); setMenuOpen(false); }}>Home</li>
        {!isLoggedIn && <li onClick={() => { navigate('/login'); setMenuOpen(false); }}>Login / Signup</li>}
        <li onClick={() => { navigate('/practice'); setMenuOpen(false); }}>Practice</li>
        {isLoggedIn && <>
          <li onClick={() => { navigate('/profile'); setMenuOpen(false); }}>Profile</li>
          <li onClick={() => { logout(); setMenuOpen(false); }}>Logout</li>
        </>}
      </ul>
    </nav>
  );
};

export default MenuBar;
