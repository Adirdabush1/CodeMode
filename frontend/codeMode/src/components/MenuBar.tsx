import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuBar.css';

const MenuBar: React.FC = () => {
  const navigate = useNavigate();

  // פונקציה לגלילה חלקה
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ul className="menu-bar">
      <li onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
        Login & Signup
      </li>
      <li onClick={() => scrollToSection('about-us')} style={{ cursor: 'pointer' }}>
        About Us
      </li>
      <li onClick={() => scrollToSection('developer')} style={{ cursor: 'pointer' }}>
        Developer
      </li>
      <li onClick={() => scrollToSection('product')} style={{ cursor: 'pointer' }}>
        Product
      </li>
    </ul>
  );
};

export default MenuBar;
