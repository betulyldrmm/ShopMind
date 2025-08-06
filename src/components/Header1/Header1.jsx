import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header1.css';

function Header1() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Oturumu sil
    localStorage.removeItem('token'); // veya ne kullandıysan
    sessionStorage.clear(); // opsiyonel
    // Anasayfaya yönlendir
    navigate('/');
  };

  return (
    <header className="header">
      <h1 className="logo">ShopMind</h1>
         <a href='/ProfilePage'className='profil'>profil</a>
      <button className="logout-button" onClick={handleLogout}>
        Çıkış Yap
      </button>
      
    </header>
 
  );
}

export default Header1;
