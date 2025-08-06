import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
       
          <div className="footer-section">
            <h3 className="footer-title">Kurumsal</h3>
            <nav className="footer-nav">
              <a href="/About" className="footer-link">Hakkımızda</a>
              
              <a href="/Stores" className="footer-link">Mağazalarımız</a>
          
             
              <a href="/Contact" className="footer-link">İletişim</a>
            </nav>
          </div>

       

         

        </div>

    
        <div className="footer-platforms">
          <h3 className="footer-title">Bizi Takip Edin</h3>
         
        </div>


        <div className="footer-social">
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">📘</a>
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
            <a href="#" className="social-link" aria-label="Twitter">🐦</a>
            <a href="#" className="social-link" aria-label="YouTube">🎥</a>
            <a href="#" className="social-link" aria-label="LinkedIn">💼</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">&copy; 2025 Şirket Adı. Tüm hakları saklıdır.</p>
          <p className="footer-info">7/24 Müşteri Hizmetleri: 0850 XXX XX XX</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;