
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';
import {
  FaTshirt,
  FaMobileAlt,
  FaChild,
  FaBaby,
  FaHome,
  FaFootballBall,
  FaSprayCan,
  FaBook,
  FaCar,
  FaAppleAlt,
} from 'react-icons/fa';

const iconMap = {
  'FaTshirt': <FaTshirt />,
  'FaMobileAlt': <FaMobileAlt />,
  'FaChild': <FaChild />,
  'FaBaby': <FaBaby />,
  'FaHome': <FaHome />,
  'FaFootballBall': <FaFootballBall />,
  'FaSprayCan': <FaSprayCan />,
  'FaBook': <FaBook />,
  'FaCar': <FaCar />,
  'FaAppleAlt': <FaAppleAlt />,
};

function Categories() {
  const [categories, setCategories] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      console.log('🔍 API çağrısı başlıyor...');
      try {
        const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";
const response = await fetch(`${API_URL}/api/categories`);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API\'den gelen data:', data);
        
      
        if (data.success && Array.isArray(data.data)) {
          console.log('✅ Kategoriler başarıyla alındı:', data.data);
          setCategories(data.data);
          setError(null);
        } else if (Array.isArray(data)) {
          console.log('✅ Kategoriler direkt dizi olarak alındı:', data);
          setCategories(data);
          setError(null);
        } else {
          console.log('❌ API başarısız veya veri formatı hatalı:', data.message || 'Bilinmeyen hata');
          setError(data.message || 'Kategoriler yüklenemedi');
          setCategories([]);
        }
      } catch (error) {
        console.error('💥 Kategoriler yüklenemedi:', error);
        setError('Kategoriler yüklenirken bir hata oluştu: ' + error.message);
        setCategories([]);
      } finally {
        setLoading(false);
        console.log('⏰ Loading false yapıldı');
      }
    };

    fetchCategories();
  }, []);

  console.log('🎯 Current state - categories:', categories);
  console.log('🎯 Current state - loading:', loading);
  console.log('🎯 Current state - error:', error);


  const handleCategoryClick = (categorySlug) => {
    console.log('🖱️ Kategori tıklandı:', categorySlug);
    navigate(`/kategori/${categorySlug}`);
  };

  const handleSubCategoryClick = (categorySlug, subCategorySlug, e) => {
    e.stopPropagation();
    navigate(`/kategori/${categorySlug}/${subCategorySlug}`);
  };


  const handleRetry = () => {
    setLoading(true);
    setError(null);
   
    window.location.reload();
  };

  if (loading) {
    console.log('⏳ Loading durumunda...');
    return <div className="categories-loading">Kategoriler yükleniyor...</div>;
  }

  if (error) {
    console.log('❌ Hata durumunda:', error);
    return (
      <div className="categories-error">
        <p>{error}</p>
        <button onClick={handleRetry} className="retry-button">
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    console.log('📭 Kategoriler boş!');
    return (
      <div className="categories-empty">
        <p>Henüz kategori bulunmuyor</p>
        <button onClick={handleRetry} className="retry-button">
          Yenile
        </button>
      </div>
    );
  }

  console.log('🎨 Render ediliyor, kategori sayısı:', categories.length);

  return (
    <nav className="category-navv">
      <ul className="category-listt">
        {categories.map((cat, index) => {
          console.log('🏷️ Render edilen kategori:', cat);
          return (
            <li
              key={cat.id}
              className="category-itemm clickable"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => handleCategoryClick(cat.slug)}
            >
              <div className="container">
                <div className="category-header">
                  <span className="category-icon">
                    {iconMap[cat.icon] || <FaHome />}
                  </span>
                  <span className="category-name">{cat.name}</span>
                </div>
              </div>
             
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Categories;