import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/useAuth';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="menu-bar" role="navigation" aria-label="Main navigation">
      <Link to="/" className="logo" onClick={closeMenu}>CodeMode</Link>

      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu" aria-expanded={menuOpen}>
        <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <span style={{ opacity: menuOpen ? 0 : 1 }} />
        <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'none' }} />
      </button>

      <ul className={menuOpen ? 'open' : ''}>
        <li><Link to="/" onClick={closeMenu}>Home</Link></li>
        {!isLoggedIn && <li><Link to="/login" onClick={closeMenu}>Login / Signup</Link></li>}
        <li><Link to="/practice" onClick={closeMenu}>Practice</Link></li>
        <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
        {isLoggedIn && <>
          <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
          <li><button className="nav-logout-btn" onClick={() => { logout(); closeMenu(); }}>Logout</button></li>
        </>}
      </ul>
    </nav>
  );
};

export default MenuBar;
