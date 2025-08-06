import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KendineHediye.css';
import Header2 from '../../components/Header2/Header2';

const API_BASE_URL = 'http://localhost:5001';

const KendineHediye = () => {
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

    fetchKendineHediyeProducts();
  }, []);

  const fetchKendineHediyeProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/categories/16/products`);
      
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
     
          const category16Products = allProducts.filter(p => p.category_id === 16);
          if (category16Products.length > 0) {
            setProducts(category16Products);
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
            <p>Kendine özel ürünler yükleniyor...</p>
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
              <ul>
                <li>Server çalışıyor mu? (http://localhost:5001)</li>
                <li>Kategori ID 16 veritabanında var mı?</li>
                <li>Bu kategoride ürün var mı?</li>
              </ul>
            </div>
            <button onClick={fetchKendineHediyeProducts} className="retry-btn">
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
       
        <div className="pagee-header">
          <div className="headerr-content">
            <h1>🎁 Kendine Hediye</h1>
            <h3 className="headerr-subtitle">
              Kendini şımartmak için özel seçilmiş ürünler. 
              {user && <span> Hoş geldin, <strong>{user.username}</strong>!</span>}
            
            </h3>
            <h2 className='headerr-subtitle'>
                  Bugün Kendin İçin Bir Şey Yap
            </h2>
            {products.length > 0 && (
              <p className="product-count">
                📦 {products.length} özel ürün bulundu
              </p>
            )}
          </div>
          
          <div className="motivationn-cards">
            <div className="motivationn-card">
              <span className="motivationn-icon">💝</span>
              <h3>Kendini Sev</h3>
              <p>Bazen kendimize en güzel hediyeyi vermek gerekir</p>
            </div>
            <div className="motivationn-card">
              <span className="motivationn-icon">✨</span>
              <h3>Özel Hisset</h3>
              <p>Her gün kendini özel hissetmeyi hak ediyorsun</p>
            </div>
            <div className="motivationn-card">
              <span className="motivationn-icon">🌟</span>
              <h3>Mutlu Ol</h3>
              <p>Küçük mutluluklar büyük değişimler yaratır</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Ürün ara..."
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
              <div className="no-productss-icon">🎁</div>
              <h3>
                {searchTerm ? 'Aradığın ürün bulunamadı' : 'Henüz ürün yok'}
              </h3>
              <p>
                {searchTerm 
                  ? 'Farklı arama terimleri veya filtreler deneyebilirsin'
                  : 'Kendine Hediye kategorisinde henüz ürün bulunmuyor'
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

                  <div className="product-info">
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
                        className={product.stock > 0 ? 'add-to-cart-btn' : 'add-to-cart-btn disabled'}
                      >
                        {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                      </button>
                    </div>

                   
                    
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

export default KendineHediye;