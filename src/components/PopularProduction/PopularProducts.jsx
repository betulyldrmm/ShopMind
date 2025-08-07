import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './PopularProducts.css';

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

  
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
      const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";
const response = await fetch(`${API_URL}/api/categories`);
        
        if (!response.ok) {
          throw new Error('Popüler ürünler alınamadı');
        }
        
        const data = await response.json();
        console.log('Popüler ürünler:', data);
    
        setPopularProducts(data.slice(0, displayLimit));
        setError(null);
      } catch (error) {
        console.error('Popüler ürünler alınamadı:', error);
        setError(error.message);
     
        fetchAllProducts();
      } finally {
        setLoading(false);
      }
    };

    const fetchAllProducts = async () => {
      try {
     const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";
const response = await fetch(`${API_URL}/api/categories`);
        if (response.ok) {
          const data = await response.json();
          // İlk 10 ürünü popüler olarak göster
          setPopularProducts(data.slice(0, displayLimit));
        }
      } catch (error) {
        console.error('Ürünler alınamadı:', error);
      }
    };

    fetchPopularProducts();
  }, []);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    
    
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };


  const addToCart = (product, e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Event bubbling'i durdur
    
 
    navigate('/authForm', { 
      state: { 
        message: `${product.name} ürününü satın almak için giriş yapmalısınız.`,
        product: product 
      } 
    });
  };


  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  if (loading) {
    return (
      <div className="popular-section-wrapper">
        <div className="loading-spinner-state">
          <div className="loading-circle-spinner"></div>
          <p>Popüler ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && popularProducts.length === 0) {
    return (
      <div className="popular-section-wrapper">
        <div className="error-display-state">
          <p>Popüler ürünler yüklenirken bir hata oluştu.</p>
          <button onClick={() => window.location.reload()}>Tekrar Dene</button>
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