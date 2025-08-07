import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './PopularProducts.css';

import { API_URL } from '../../config/api';

function PopularProducts() {
  const [popularProducts, setPopularProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const displayLimit = 10;

  const getProductImage = (product) => {
    if (product.image_url && !product.image_url.includes('via.placeholder.com')) {
      return product.image_url;
    }
    
    const productName = product.name?.toLowerCase();
    if (productName?.includes('masa')) return '/images/masa.jpg';
    if (productName?.includes('laptop') || productName?.includes('bilgisayar')) return '/images/laptop.jpg';
    if (productName?.includes('telefon')) return '/images/telefon.jpg';
    if (productName?.includes('kitap')) return '/images/kitap.jpg';
    if (productName?.includes('spor')) return '/images/spor.jpg';
    if (productName?.includes('ayakkabı')) return '/images/ayakkabi.jpg';
    if (productName?.includes('çanta')) return '/images/canta.jpg';
    if (productName?.includes('saat')) return '/images/saat.jpg';
    
    return '/images/default-product.jpg';
  };

  const handleImageError = (e, product) => {
    const img = e.target;
    const productName = product.name?.toLowerCase();
    
    if (!img.src.includes('default-product.jpg')) {
      if (productName?.includes('masa')) {
        img.src = '/masa.jpg';
      } else if (productName?.includes('laptop') || productName?.includes('bilgisayar')) {
        img.src = '/laptop.jpg';
      } else if (productName?.includes('telefon')) {
        img.src = '/telefon.jpg';
      } else if (productName?.includes('kitap')) {
        img.src = '/kitap.jpg';
      } else if (productName?.includes('spor')) {
        img.src = '/spor.jpg';
      } else {
        img.src = '/images/default-product.jpg';
      }
    } else {
      img.src = `https://picsum.photos/400/400?random=${product.id}`;
    }
  };

  // ✅ Popüler ürünleri getir - DOĞRU ENDPOINT
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        
        console.log('Popüler ürünler için API çağrısı yapılıyor...');
        console.log('API URL:', `${API_URL}/api/products`);
        
        // ✅ Doğru endpoint: /api/products (kategoriler değil!)
        const response = await fetch(`${API_URL}/api/products`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Hatası:', response.status, errorText);
          throw new Error(`Popüler ürünler alınamadı (${response.status})`);
        }
        
        const data = await response.json();
        console.log('API Yanıtı:', data);
        
        let productsArray = [];
        
        // Backend'den gelen veri yapısına göre parse et
        if (data.success && data.data) {
          if (Array.isArray(data.data)) {
            productsArray = data.data;
          } else if (data.data.products && Array.isArray(data.data.products)) {
            productsArray = data.data.products;
          }
        } else if (Array.isArray(data)) {
          productsArray = data;
        }
        
        console.log('İşlenmiş ürünler:', productsArray);
        
        if (productsArray.length === 0) {
          throw new Error('Hiç ürün bulunamadı');
        }
        
        // İlk displayLimit kadar ürünü al
        setPopularProducts(productsArray.slice(0, displayLimit));
        setError(null);
        
      } catch (error) {
        console.error('Popüler ürünler alınamadı:', error);
        setError(error.message);
        
        // Alternatif olarak kategorileri dene
        await tryFetchCategories();
      } finally {
        setLoading(false);
      }
    };

    const tryFetchCategories = async () => {
      try {
        console.log('Alternatif olarak kategoriler deneniyor...');
        const response = await fetch(`${API_URL}/api/categories`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Kategoriler yanıtı:', data);
          
          if (Array.isArray(data)) {
            setPopularProducts(data.slice(0, displayLimit));
            setError(null);
          } else if (data.success && Array.isArray(data.data)) {
            setPopularProducts(data.data.slice(0, displayLimit));
            setError(null);
          }
        }
      } catch (error) {
        console.error('Kategoriler de alınamadı:', error);
      }
    };

    fetchPopularProducts();
  }, []);

  // Favorileri localStorage'dan yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(savedFavorites)));
      } catch (error) {
        console.error('Favoriler okunamadı:', error);
      }
    }
  }, []);

  const toggleFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    
    // localStorage'a kaydet
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const addToCart = (product, e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    // Kullanıcı giriş durumunu kontrol et
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!userData || isLoggedIn !== 'true') {
      // Giriş yapmamış - AuthForm'a yönlendir
      navigate('/authForm', { 
        state: { 
          message: `${product.name} ürününü satın almak için giriş yapmalısınız.`,
          product: product 
        } 
      });
    } else {
      // Giriş yapmış - sepete ekle
      try {
        const currentCart = JSON.parse(localStorage.getItem('sepet')) || [];
        
        const existingItemIndex = currentCart.findIndex(item => item.id === product.id);
        
        if (existingItemIndex !== -1) {
          // Mevcut ürünün adedini artır
          currentCart[existingItemIndex].adet += 1;
        } else {
          // Yeni ürün ekle
          const cartItem = {
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            adet: 1,
            image_url: product.image_url,
            category_name: product.category_name,
            addedDate: new Date().toISOString()
          };
          currentCart.push(cartItem);
        }
        
        localStorage.setItem('sepet', JSON.stringify(currentCart));
        
        // Başarı mesajı göster
        alert(`✅ ${product.name} sepete eklendi!`);
        
      } catch (error) {
        console.error('Sepete ekleme hatası:', error);
        alert('❌ Ürün sepete eklenirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return (
      <div className="popular-section-wrapper">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">Popüler Ürünler</h2>
          <div className="loading-spinner-state flex items-center justify-center py-12">
            <div className="text-center">
              <div className="loading-circle-spinner inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Popüler ürünler yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && popularProducts.length === 0) {
    return (
      <div className="popular-section-wrapper">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">Popüler Ürünler</h2>
          <div className="error-display-state text-center py-12">
            <p className="text-red-600 mb-4">Popüler ürünler yüklenirken bir hata oluştu:</p>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="popular-section-wrapper">
      <div className="popular-header-area">
        <h2 className="main-section-title">POPÜLER ÜRÜNLER</h2>
      </div>

      {popularProducts.length === 0 ? (
        <div className="no-products-message">
          <p>Henüz popüler ürün bulunmuyor.</p>
        </div>
      ) : (
        <div className="products-display-grid">
          {popularProducts.map((product) => (
            <Link 
              key={product.id} 
              to={`/urun/${product.id}`} 
              className="product-card-link"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-display-card">
               
                {product.rank <= 3 && (
                  <div className="product-label-tag bestseller-label-tag">
                    En Popüler #{product.rank}
                  </div>
                )}
                
                {product.discount > 0 && (
                  <div className="product-label-tag discount-label-tag">
                    %{product.discount} İndirim
                  </div>
                )}
                
                <div className="product-img-container">
                  <img 
                    src={getProductImage(product)}
                    alt={product.name}
                    className="product-main-image"
                    onError={(e) => handleImageError(e, product)}
                  />

                  <button 
                    className={`favorite-heart-btn ${favorites.has(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                  >
                    <Heart size={18} fill={favorites.has(product.id) ? '#ff4757' : 'none'} />
                  </button>
                </div>

                <div className="product-details-info">
                  <h3 className="product-name-title">{product.name}</h3>
                  
                
                  {product.category_name && (
                    <p className="product-category-text">{product.category_name}</p>
                  )}
                  
              
                  {product.description && (
                    <p className="product-description-text">
                      {product.description.length > 60 
                        ? `${product.description.substring(0, 60)}...` 
                        : product.description
                      }
                    </p>
                  )}
        
                  
                   

                  <div className="price-display-container">
                  
                    {product.discount > 0 && (
                      <span className="original-old-price">
                        {(product.price / (1 - product.discount / 100)).toFixed(2)} TL
                      </span>
                    )}
                    <span className="current-new-price">{product.price} TL</span>
                  </div>

                 
                  <div className="stock-status-info">
                    {product.stock > 0 ? (
                      <span className="in-stock-available">
                        ✓ Stokta ({product.stock} adet)
                        {product.stock < 5 && <span className="low-stock-warning"> - Son {product.stock} adet!</span>}
                      </span>
                    ) : (
                      <span className="out-of-stock-unavailable">✗ Stokta Yok</span>
                    )}
                  </div>

                  <button 
                    className={`add-cart-action-btn ${product.stock === 0 ? 'disabled' : ''}`}
                    onClick={(e) => addToCart(product, e)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart size={16} />
                    {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PopularProducts;