import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Categories.css';
import { API_URL } from '../../config/api';
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
  FaTshirt: <FaTshirt />,
  FaMobileAlt: <FaMobileAlt />,
  FaChild: <FaChild />,
  FaBaby: <FaBaby />,
  FaHome: <FaHome />,
  FaFootballBall: <FaFootballBall />,
  FaSprayCan: <FaSprayCan />,
  FaBook: <FaBook />,
  FaCar: <FaCar />,
  FaAppleAlt: <FaAppleAlt />,
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
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_URL}/api/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`Server hatası: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📦 Kategoriler alındı:', data);

        // API yapısına göre kontrol
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          setError(null);
        } else if (Array.isArray(data)) {
          setCategories(data);
          setError(null);
        } else {
          setCategories([]);
          setError(data.message || 'Kategoriler yüklenemedi');
          console.log('❌ API başarısız veya veri formatı hatalı:', data.message || 'Bilinmeyen hata');
        }
      } catch (error) {
        console.error('❌ Kategoriler alınamadı:', error);
        if (error.name === 'AbortError') {
          setError('Bağlantı zaman aşımına uğradı');
        } else {
          setError(`Kategoriler yüklenemedi: ${error.message}`);
        }
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
    // Tekrar fetch etmek için fetchCategories'yi burada çağırabiliriz ya da sayfayı yenile
    // fetchCategories();  // Ancak fetchCategories useEffect içinde tanımlı, dışarıya çıkarabiliriz istersen
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