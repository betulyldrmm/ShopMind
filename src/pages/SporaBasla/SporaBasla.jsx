import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SporaBasla.css';
import Header2 from '../../components/Header2/Header2';
import { API_URL } from '../config/api';
const SporaBasla = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Kullanıcı bilgilerini kontrol et
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Kullanıcı verisi okunamadı:', error);
      }
    }

    // Sepet verilerini yükle
    const cartData = localStorage.getItem('sepet');
    if (cartData) {
      try {
        setCart(JSON.parse(cartData));
      } catch (error) {
        console.error('Sepet verisi okunamadı:', error);
      }
    }

    fetchSporaBaslaProducts();
  }, []);

  const fetchSporaBaslaProducts = async () => {
    try {
      setLoading(true);
      
  
      const response = await fetch(`${API_URL}/api/categories/3/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
    
      if (data.success && data.data && data.data.products) {
        
        setProducts(data.data.products);
      } else if (Array.isArray(data)) {
     
        setProducts(data);
      } else if (data.products) {
      
        setProducts(data.products);
      } else {
        console.error('Beklenmeyen veri formatı:', data);
        setProducts([]);
      }
      
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setError(`Ürünler yüklenirken bir hata oluştu: ${error.message}`);
      
     
      console.log('Fallback: Tüm ürünleri çekmeye çalışıyorum...');
      try {
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/products`);
        if (fallbackResponse.ok) {
          const allProducts = await fallbackResponse.json();
       
          const category3Products = allProducts.filter(p => p.category_id === 3);
          if (category3Products.length > 0) {
            setProducts(category3Products);
            setError(''); 
          } else {
      
            const randomProducts = allProducts.slice(0, 12);
            setProducts(randomProducts);
            setError(''); 
          }
        }
      } catch (fallbackError) {
        console.error('Fallback da başarısız:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
   
    navigate(`/urun/${product.id}`);
  };

  const addToCart = (product, event) => {
    
    event.stopPropagation();

    if (!user) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('sepet', JSON.stringify(newCart));
    
    // Başarı mesajı
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = `${product.name} sepete eklendi!`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'discounted') return matchesSearch && product.discount > 0;
    if (selectedFilter === 'expensive') return matchesSearch && product.price > 100;
    if (selectedFilter === 'cheap') return matchesSearch && product.price <= 100;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <>
        <Header2 />
        <div className="kendine-hediye-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Spor ürünleri yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && products.length === 0) {
    return (
      <>
        <Header2 />
        <div className="kendine-hediye-container">
          <div className="error-message">
            <h2>❌ Hata</h2>
            <p>{error}</p>
            <div className="error-details">
              <p>🔍 Kontrol edilecekler:</p>
             
            </div>
            <button onClick={fetchSporaBaslaProducts} className="retry-btn">
              🔄 Tekrar Dene
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header2 />
      <div className="kendine-hediye-container">
       
        <div className="pageee-header">
          <div className="headerrr-content">
            <h1>💪 Spora Başla</h1>
            <p className="headerrr-subtitle">
              Motivasyonunu artıracak spor ekipmanları ve ürünleri. 
              {user && <span> Hoş geldin, <strong>{user.username}</strong>!</span>}
            </p>
            {products.length > 0 && (
              <p className="product-count">
                📦 {products.length} spor ürünü bulundu
              </p>
            )}
          </div>

          <div className="motivationn-cards">
            <div className="motivationn-card">
              <span className="motivationn-icon">🏋️‍♀️</span>
              <h3>Hedefine Ulaş</h3>
              <p>Formda kalmak ve hedeflerine ulaşmak için ihtiyacın olan her şey burada</p>
            </div>
            <div className="motivationn-card">
              <span className="motivationn-icon">🥗</span>
              <h3>Sağlıklı Yaşa</h3>
              <p>Sporu destekleyen sağlıklı yaşam ürünleriyle enerjini artır</p>
            </div>
            <div className="motivationn-card">
              <span className="motivationn-icon">👟</span>
              <h3>Konforlu Antrenman</h3>
              <p>Spor kıyafetleri ve ekipmanlarla antrenmanlarını daha verimli hale getir</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Spor ürünü ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button 
              className={selectedFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('all')}
            >
              Tümü ({products.length})
            </button>
            
            <button 
              className={selectedFilter === 'cheap' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('cheap')}
            >
              💰 Uygun Fiyat
            </button>
            <button 
              className={selectedFilter === 'expensive' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('expensive')}
            >
              ✨ Premium
            </button>
            <button 
              className={selectedFilter === 'discounted' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setSelectedFilter('discounted')}
            >
              🔥 İndirimli
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="productss-section">
          {filteredProducts.length === 0 ? (
            <div className="no-productss">
              <div className="no-productss-icon">🏃‍♂️</div>
              <h3>
                {searchTerm ? 'Aradığın spor ürünü bulunamadı' : 'Henüz spor ürünü yok'}
              </h3>
              <p>
                {searchTerm 
                  ? 'Farklı arama terimleri veya filtreler deneyebilirsin'
                  : 'Spora Başla kategorisinde henüz ürün bulunmuyor'
                }
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className="clear-filters-btn"
              >
                {searchTerm ? 'Filtreleri Temizle' : 'Tüm Ürünleri Gör'}
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="product-card clickable-card"
                  onClick={() => handleProductClick(product)}
                >
                  {product.discount > 0 && (
                    <div className="discount-badge">
                      %{product.discount} İndirim
                    </div>
                  )}
                  
                  <div className="productt-image">
                    <img 
                      src={product.image_url || '/images/default-product.png'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/images/default-product.png';
                      }}
                    />
                  </div>

                  <div className="productt-info">
                    <h3 className="productt-name">{product.name}</h3>
                    <p className="productt-description">
                      {product.description && product.description.length > 100 
                        ? product.description.substring(0, 100) + '...'
                        : product.description || 'Ürün açıklaması mevcut değil'
                      }
                    </p>
                    
                    <div className="product-price">
                      {product.discount > 0 ? (
                        <>
                          <span className="original-price">₺{product.price}</span>
                          <span className="discounted-price">
                            ₺{(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="current-price">₺{product.price}</span>
                      )}
                    </div>

                    <div className="product-stock">
                      {product.stock > 0 ? (
                        <span className="in-stock">✅ Stokta ({product.stock} adet)</span>
                      ) : (
                        <span className="out-of-stock">❌ Stokta yok</span>
                      )}
                    </div>

                    <div className="product-actions">
                      <button 
                        onClick={(e) => addToCart(product, e)}
                        disabled={product.stock === 0}
                        className={product.stock > 0 ? 'addd-to-cart-btn' : 'addd-to-cart-btn disabled'}
                      >
                        {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                      </button>
                    </div>

                    {/* Debug info - geliştirme aşamasında */}
                 
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

       
        
         
        
      </div>
    </>
  );
};

export default SporaBasla;