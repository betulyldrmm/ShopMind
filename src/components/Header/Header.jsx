import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
  <a href='/'>  <div className="logo">ShopMind</div></a>  

      <nav className="main-nav">
      
        
          <a href="/authForm">GİRİŞ YAP</a>
      </nav>
    </header>
  );
}

export default Header;
