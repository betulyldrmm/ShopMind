import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Product.css';

const Product = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "MODA VE AKSESUAR",
      subtitle: "Moda İle İlgili Her Şey",
      buttonText: "Alışverişe Başla",
      categorySlug: "aksesuar" 
    },
    {
      id: 2,
      title: "KİTAP KURTLARINA ÖZEL",
      subtitle: "Kitap Kurtlar İçin",
      buttonText: "Keşfet",
      categorySlug: "kitap" 
    },
    {
      id: 3,
      title: "Sporla Alakalı Her Şey",
      subtitle: "Aktif Yaşam",
      buttonText: "İncele",
      categorySlug: "spor" 
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  
  const handleButtonClick = (categorySlug) => {
    console.log('🛒 Slide button tıklandı, kategori slug:', categorySlug);
   
    navigate(`/kategori/${categorySlug}`);
  };

  return (
    <div className="carousel-container">
   
      <div className="date-badge">
        
      </div>

    

      <div className="main-content">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide slide-${index} ${index === currentSlide ? 'active' : ''}`}
          >
           
            <div className="shapes-container">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="info-panel">
        <div className="panel-content">
          <div className="panel-date">31 Temmuz</div>
          <h2 className="panel-title">
            {slides[currentSlide].title}
          </h2>
          
          <button 
            onClick={() => handleButtonClick(slides[currentSlide].categorySlug)}
            className="action-button"
          >
            <span>{slides[currentSlide].buttonText}</span>
            <svg className="button-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

  
      <button onClick={prevSlide} className="nav-arrow nav-left">
        <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button onClick={nextSlide} className="nav-arrow nav-right">
        <svg className="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      
      <div className="dots-container">
        <div className="dots-wrapper">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;