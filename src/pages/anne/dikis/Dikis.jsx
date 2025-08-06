import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './Dikis.css';

const API_BASE_URL = 'http://localhost:5001';

// Kategori bilgileri (UI için)
const categories = {
  'dikiş-makineleri': { name: '🪡 Dikiş Makineleri', color: '#e91e63' },
  'kumaslar': { name: '🧵 Kumaşlar', color: '#673ab7' },
  'iplik-makara': { name: '🧶 İplik & Makara', color: '#3f51b5' },
  'dikiş-aletleri': { name: '✂️ Dikiş Aletleri', color: '#2196f3' },
  'fermuar-dugme': { name: '🔘 Fermuar & Düğme', color: '#009688' },
  'nakis-malzemeleri': { name: '🌸 Nakış Malzemeleri', color: '#ff5722' }
};

const Dikis = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(subcategoryId || 'dikiş-makineleri');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  
  // Yeni state'ler - veritabanı için
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

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

    if (subcategoryId && categories[subcategoryId]) {
      setSelectedCategory(subcategoryId);
    }
    
    // Sepet sayısını güncelle
    updateCartCount();
    
    // Ürünleri çek
    fetchDikisProducts();
  }, [subcategoryId]);

  const fetchDikisProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Kategori ID 1'den 423-451 arası ürünleri çek
      const response = await fetch(`${API_BASE_URL}/api/categories/1/products?start_id=423&end_id=451`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dikiş Ürünleri API Response:', data);
      
      let fetchedProducts = [];
      
      // Server'dan gelen response format kontrol et
      if (data.success && data.data && data.data.products) {
        fetchedProducts = data.data.products;
      } else if (Array.isArray(data)) {
        fetchedProducts = data;
      } else if (data.products) {
        fetchedProducts = data.products;
      } else {
        console.error('Beklenmeyen veri formatı:', data);
        fetchedProducts = [];
      }

      // Eğer özel ID aralığı endpoint'i yoksa fallback
      if (fetchedProducts.length === 0) {
        console.log('ID aralığı endpoint\'i bulunamadı, fallback yapılıyor...');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/categories/1/products`);
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          let allCategoryProducts = [];
          
          if (fallbackData.success && fallbackData.data && fallbackData.data.products) {
            allCategoryProducts = fallbackData.data.products;
          } else if (Array.isArray(fallbackData)) {
            allCategoryProducts = fallbackData;
          } else if (fallbackData.products) {
            allCategoryProducts = fallbackData.products;
          }
          
          // ID 423-451 arasındaki ürünleri filtrele
          fetchedProducts = allCategoryProducts.filter(product => 
            product.id >= 423 && product.id <= 451
          );
        }
      }

      setProducts(fetchedProducts);
      
    } catch (error) {
      console.error('Dikiş ürünleri yüklenirken hata:', error);
      setError(`Ürünler yüklenirken bir hata oluştu: ${error.message}`);
      
      // Son fallback: Tüm ürünlerden dikiş ile alakalı olanları çek
      try {
        console.log('Final fallback: Tüm ürünleri kontrol ediliyor...');
        const finalResponse = await fetch(`${API_BASE_URL}/api/products`);
        if (finalResponse.ok) {
          const allProducts = await finalResponse.json();
          // Dikiş ile alakalı kelimeleri içeren ürünleri filtrele
          const dikisKeywords = ['dikiş', 'makine', 'kumaş', 'iplik', 'fermuar', 'düğme', 'nakış', 'makara', 'igne', 'makas'];
          const relatedProducts = allProducts.filter(product => 
            dikisKeywords.some(keyword => 
              product.name.toLowerCase().includes(keyword) || 
              (product.description && product.description.toLowerCase().includes(keyword))
            )
          ).slice(0, 30); // İlk 30 ürünü al
          
          if (relatedProducts.length > 0) {
            setProducts(relatedProducts);
            setError(''); // Hata mesajını temizle
          }
        }
      } catch (finalError) {
        console.error('Final fallback da başarısız:', finalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    try {
      const sepetData = localStorage.getItem('sepet');
      if (sepetData) {
        const items = JSON.parse(sepetData);
        const totalCount = items.reduce((total, item) => {
          return total + (parseInt(item.adet || item.quantity) || 1);
        }, 0);
        setCartCount(totalCount);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Sepet sayısı hesaplanırken hata:', error);
      setCartCount(0);
    }
  };

  const handleCategoryChange = (categoryKey) => {
    setSelectedCategory(categoryKey);
    window.history.pushState({}, '', `/anne/dikis-malzemeleri/${categoryKey}`);
  };

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const openProductDetail = (product) => {
    setSelectedProduct({
      ...product,
      category: selectedCategory,
      categoryName: categories[selectedCategory].name
    });
    setIsModalOpen(true);
  };

  const closeProductDetail = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product, event) => {
    // Event bubbling'i durdur
    if (event) {
      event.stopPropagation();
    }

    if (!user) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }

    try {
      // Mevcut sepeti al
      const existingSepet = localStorage.getItem('sepet');
      let sepetItems = existingSepet ? JSON.parse(existingSepet) : [];

      // Ürün formatını Sepet.jsx'e uygun hale getir
      const cartItem = {
        id: `dikis-${product.id}`,
        name: product.name,
        price: product.discount > 0 ? (product.price * (1 - product.discount / 100)) : product.price,
        originalPrice: product.price,
        image_url: product.image_url,
        category_name: 'Dikiş Malzemeleri',
        category: selectedCategory,
        adet: 1,
        quantity: 1,
        stock: product.stock || 50,
        selectedSize: null,
        selectedColor: null,
        description: product.description
      };

      // Aynı ürün var mı kontrol et
      const existingItemIndex = sepetItems.findIndex(item => item.id === cartItem.id);

      if (existingItemIndex !== -1) {
        // Mevcut ürünün adedini artır
        sepetItems[existingItemIndex].adet = (parseInt(sepetItems[existingItemIndex].adet) || 1) + 1;
        sepetItems[existingItemIndex].quantity = sepetItems[existingItemIndex].adet;
      } else {
        // Yeni ürün ekle
        sepetItems.push(cartItem);
      }

      // Sepeti localStorage'a kaydet
      localStorage.setItem('sepet', JSON.stringify(sepetItems));
      
      // Sepet sayısını güncelle
      updateCartCount();

      // Başarı bildirimi
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = `${product.name} sepete eklendi!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);

      console.log('Sepete eklendi:', product.name);
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  const handleProductClick = (product) => {
    // Ürün detay sayfasına ID ile yönlendir
    navigate(`/urun/${product.id}`);
  };

  // Alt kategorilere göre ürünleri filtrele (isimlere göre basit filtreleme)
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    switch (selectedCategory) {
      case 'dikiş-makineleri':
        return products.filter(p => 
          p.name.toLowerCase().includes('makine') || 
          p.name.toLowerCase().includes('dikiş')
        );
      case 'kumaslar':
        return products.filter(p => 
          p.name.toLowerCase().includes('kumaş') || 
          p.name.toLowerCase().includes('bez') ||
          p.name.toLowerCase().includes('pamuk')
        );
      case 'iplik-makara':
        return products.filter(p => 
          p.name.toLowerCase().includes('iplik') || 
          p.name.toLowerCase().includes('makara')
        );
      case 'dikiş-aletleri':
        return products.filter(p => 
          p.name.toLowerCase().includes('makas') || 
          p.name.toLowerCase().includes('igne') ||
          p.name.toLowerCase().includes('cetvel')
        );
      case 'fermuar-dugme':
        return products.filter(p => 
          p.name.toLowerCase().includes('fermuar') || 
          p.name.toLowerCase().includes('düğme') ||
          p.name.toLowerCase().includes('dugme')
        );
      case 'nakis-malzemeleri':
        return products.filter(p => 
          p.name.toLowerCase().includes('nakış') || 
          p.name.toLowerCase().includes('kasak')
        );
      default:
        return products.slice(0, 10); // Varsayılan olarak ilk 10 ürünü göster
    }
  };

  const currentProducts = getFilteredProducts();
  const currentCategoryInfo = categories[selectedCategory] || categories['dikiş-makineleri'];

  // Loading state
  if (loading) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Dikiş malzemeleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="error-message">
          <h2>❌ Hata</h2>
          <p>{error}</p>
          <div className="error-details">
            <p>🔍 Kontrol edilecekler:</p>
            <ul>
              <li>Server çalışıyor mu? (http://localhost:5001)</li>
              <li>Kategori ID 1 veritabanında var mı?</li>
              <li>ID 423-451 arası ürünler var mı?</li>
            </ul>
          </div>
          <button onClick={fetchDikisProducts} className="retry-btn">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pasta-gallery-wrapper">
      <h2 className="gallery-title">🪡 Anne için Dikiş Malzemeleri Hediye Önerileri</h2>
      
      {/* Navigation */}
      <div className="navigation-section">
        <button
          onClick={() => navigate('/')}
          className="back-button"
        >
          ← Ana Sayfaya Dön
        </button>
        
        <button
          onClick={() => navigate('/sepet')}
          className="cart-button"
        >
          🛒 Sepete Git {cartCount > 0 && `(${cartCount})`}
        </button>
      </div>
      
      {/* Kategori Seçim Butonları */}
      <div className="category-buttons">
        {Object.keys(categories).map(categoryKey => (
          <button
            key={categoryKey}
            onClick={() => handleCategoryChange(categoryKey)}
            className={`category-btn ${selectedCategory === categoryKey ? 'active' : ''}`}
            style={{
              backgroundColor: selectedCategory === categoryKey 
                ? categories[categoryKey].color 
                : '#f0f0f0',
              color: selectedCategory === categoryKey ? 'white' : '#666'
            }}
          >
            {categories[categoryKey].name}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        Anne → Dikiş Malzemeleri → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
          {currentCategoryInfo.name}
        </span>
      </div>

      {/* Kategori Başlığı */}
      <div className="category-header" style={{ color: currentCategoryInfo.color }}>
        {currentCategoryInfo.name} - {currentProducts.length} Ürün
        {user && <span className="user-welcome"> | Hoş geldin, <strong>{user.username}</strong>!</span>}
      </div>

      {/* Ürün Yoksa Mesaj */}
      {currentProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🪡</div>
          <h3>Bu kategoride henüz ürün bulunmuyor</h3>
          <p>Diğer kategorileri kontrol edebilir veya daha sonra tekrar bakabilirsiniz.</p>
          <button onClick={fetchDikisProducts} className="refresh-btn">
            🔄 Ürünleri Yenile
          </button>
        </div>
      ) : (
        /* Ürün Grid'i */
        <div className="products-grid">
          {currentProducts.map((product) => (
            <div key={product.id} className="product-card clickable-card" data-product-index={product.id}>
              <div className="product-image-container" onClick={() => handleProductClick(product)}>
                {product.discount > 0 && (
                  <div className="discount-badge">
                    %{product.discount} İndirim
                  </div>
                )}
                
                <img
                  src={product.image_url || '/images/default-product.png'}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  style={{ cursor: 'pointer' }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-product.png';
                  }}
                />
                
                {/* Favori Butonu */}
                <button
                  className={`favorite-btn ${favorites.has(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                >
                  <Heart size={16} fill={favorites.has(product.id) ? '#ff6b9d' : 'none'} />
                </button>
              </div>
              
              <div className="product-info">
                <h3 
                  className="product-title" 
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.name}
                </h3>
                
                <p className="product-description">
                  {product.description && product.description.length > 100 
                    ? product.description.substring(0, 100) + '...'
                    : product.description || 'Kaliteli dikiş malzemesi'
                  }
                </p>
                
                <div className="price-section">
                  {product.discount > 0 ? (
                    <>
                      <span className="current-price">
                        {(product.price * (1 - product.discount / 100)).toFixed(2)} TL
                      </span>
                      <span className="original-price">{product.price} TL</span>
                    </>
                  ) : (
                    <span className="current-price">{product.price} TL</span>
                  )}
                </div>

                <div className="product-stock">
                  {(product.stock || 0) > 0 ? (
                    <span className="in-stock">✅ Stokta ({product.stock || 50} adet)</span>
                  ) : (
                    <span className="out-of-stock">❌ Stokta yok</span>
                  )}
                </div>
                
                <button
                  className={`add-to-cart-btn ${(product.stock || 0) === 0 ? 'disabled' : ''}`}
                  onClick={(e) => addToCart(product, e)}
                  disabled={(product.stock || 0) === 0}
                >
                  <ShoppingCart size={16} />
                  {(product.stock || 0) > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performans Bilgisi */}
      <div className="performance-info">
        ⚡ Performans: Veritabanından {products.length} ürün yüklendi (Kategori ID: 1, Ürün ID: 423-451)
        <br />
        📊 Filtrelenmiş: {currentProducts.length} ürün "{currentCategoryInfo.name}" kategorisinde gösteriliyor
      </div>

      {/* Ürün Detay Modal */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>×</button>
            
            <div className="modal-body">
              <div className="modal-image-section">
                <img
                  src={selectedProduct.image_url || '/images/default-product.png'}
                  alt={selectedProduct.name}
                  className="modal-image"
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-product.png';
                  }}
                />
              </div>
              
              <div className="modal-info-section">
                <div className="modal-category">
                  {selectedProduct.categoryName}
                </div>
                
                <h2 className="modal-title">{selectedProduct.name}</h2>
                
                <div className="modal-price-section">
                  {selectedProduct.discount > 0 ? (
                    <>
                      <span className="modal-current-price">
                        {(selectedProduct.price * (1 - selectedProduct.discount / 100)).toFixed(2)} TL
                      </span>
                      <span className="modal-original-price">{selectedProduct.price} TL</span>
                      <span className="modal-discount">%{selectedProduct.discount} İndirim</span>
                    </>
                  ) : (
                    <span className="modal-current-price">{selectedProduct.price} TL</span>
                  )}
                </div>
                
                <div className="modal-description">
                  <h4>Ürün Açıklaması:</h4>
                  <p>{selectedProduct.description || 'Kaliteli dikiş malzemesi. Hobiniz ve projeleriniz için ideal.'}</p>
                  
                  <div className="product-details">
                    <p><strong>Stok:</strong> {selectedProduct.stock || 50} adet</p>
                    <p><strong>Ürün ID:</strong> {selectedProduct.id}</p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    className={`modal-favorite-btn ${favorites.has(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedProduct.id)}
                  >
                    <Heart size={18} fill={favorites.has(selectedProduct.id) ? '#ff6b9d' : 'none'} />
                    {favorites.has(selectedProduct.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </button>
                  
                  <button
                    className={`modal-add-to-cart-btn ${(selectedProduct.stock || 0) === 0 ? 'disabled' : ''}`}
                    onClick={() => {
                      addToCart(selectedProduct);
                      closeProductDetail();
                    }}
                    disabled={(selectedProduct.stock || 0) === 0}
                  >
                    <ShoppingCart size={18} />
                    {(selectedProduct.stock || 0) > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dikis;