import React from 'react';
import { ShoppingCart, Gift, RotateCw } from 'lucide-react';
import './SearchCategories.css';

function SearchCategories() {
  const handleCartClick = () => {
    window.location.href = '/sepet';
  };
  
  const handleGiftClick = () => {
    window.location.href = '/GiftFinderHomePage';
  };

  return (
    <div className="heade">
      <div className="header-container">
        <div className="search-section">
          <div className="action-buttons">
            <button className="action-button gift-btn" onClick={handleGiftClick}>
              <Gift size={24} />
              <span>Hediye Ara</span>
            </button>
            
            <button className="action-button cart-btn" onClick={handleCartClick}>
              <ShoppingCart size={24} />
              <span>Sepetim</span>
            </button>
            
            <a href="/cark" className="action-button spin-btn">
              <RotateCw size={24} className="spin-icon" />
              <span>Şans Çarkı</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchCategories;