// brand.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Brand.css'; // CSS dosyasını import edin

const Brand = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const brands = [
    { name: 'MANGO', logo: 'MANGO', className: 'brand-mango' },
    { name: 'STRADIVARIUS', logo: '♩ STRADIVARIUS', className: 'brand-stradivarius' },
    { name: 'DEFACTO', logo: 'DeFacto', className: 'brand-defacto' },
    { name: 'BERSHKA', logo: 'BERSHKA', className: 'brand-bershka' },
    { name: 'PULL&BEAR', logo: 'PULL&BEAR', className: 'brand-pullbear' },
    { name: 'BIANCO LUCCI', logo: 'blp', subtext: 'BIANCO LUCCI', className: 'brand-bianco-lucci' },
    { name: 'H&M', logo: 'H&M', className: 'brand-hm' },
    { name: 'PENTI', logo: 'Penti', className: 'brand-penti' },
    { name: 'HAPPINESS', logo: 'HAPPINESS', subtext: 'İSTANBUL', className: 'brand-happiness' }
  ];

  const itemsPerView = 8;
  const maxIndex = Math.max(0, brands.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="brandd-carousel">
      <h2 className="brand-title">Sana Özel Markalar</h2>
      
      <div className="carousell-container">
        {/* Sol Ok */}
        <button 
          onClick={prevSlide}
          className="carousell-button carousell-button-left"
          disabled={currentIndex === 0}
        >
          <ChevronLeft />
        </button>

        {/* Carousel Container */}
        <div className="carousell-overflow">
          <div 
            className="carousell-track"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {brands.map((brand, index) => (
              <div key={index} className="carousell-item">
                <div className="brandd-card">
                  <div className={`brandd-logo ${brand.className}`}>
                    {brand.logo}
                  </div>
                  {brand.subtext && (
                    <div className="brandd-subtext">
                      {brand.subtext}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Ok */}
        <button 
          onClick={nextSlide}
          className="carousell-button carousell-button-right"
          disabled={currentIndex === maxIndex}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Brand;