// Arac.jsx - API çağrılarını düzelt

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './Arac.css';

// ✅ API URL'yi doğru tanımla
const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";

// Araç kategorileri (UI için)
const categories = {
  'motor-yagi': { name: '🛢️ Motor Yağı', color: '#ff6b9d' },
  'arac-aksesuar': { name: '🚗 Araç Aksesuar', color: '#4ecdc4' },
  'lastik-jant': { name: '🛞 Lastik & Jant', color: '#ffa726' },
  'arac-temizlik': { name: '🧽 Araç Temizlik', color: '#66bb6a' },
  'elektronik-sistem': { name: '🔌 Elektronik Sistem', color: '#ab47bc' },
  'yedek-parca': { name: '🔧 Yedek Parça', color: '#8d6e63' }
};

const Arac = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(subcategoryId || 'motor-yagi');
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
    fetchAracProducts();
  }, [subcategoryId]);

  // Resim URL'sini düzelt
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return '/default-product.png';
    
    // Eğer http ile başlıyorsa olduğu gibi bırak
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // /images/ ile başlıyorsa sadece dosya adını al
    if (imageUrl.startsWith('/images/')) {
      const fileName = imageUrl.replace('/images/', '');
      return `/${fileName}`;
    }
    
    // images/ ile başlıyorsa sadece dosya adını al
    if (imageUrl.startsWith('images/')) {
      const fileName = imageUrl.replace('images/', '');
      return `/${fileName}`;
    }
    
    // Zaten / ile başlıyorsa olduğu gibi bırak
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    // Hiçbiri değilse başına / ekle
    return `/${imageUrl}`;
  };

  // ✅ fetchAracProducts fonksiyonunu düzelt - Kategori ID 7
  const fetchAracProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Araç ürünleri API çağrısı başlıyor...');
      
      let fetchedProducts = [];
      
      try {
        console.log('Kategori 7 ürünleri çekiliyor...');
        // ✅ API_URL kullan, API_BASE_URL değil
        const response = await fetch(`${API_URL}/api/products`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API yanıtı:', data);
          
          let allProducts = [];
          
          // Farklı response formatlarını destekle
          if (Array.isArray(data)) {
            allProducts = data;
          } else if (data.data && Array.isArray(data.data)) {
            allProducts = data.data;
          } else if (data.products && Array.isArray(data.products)) {
            allProducts = data.products;
          } else if (data.success && data.data && Array.isArray(data.data)) {
            allProducts = data.data;
          } else {
            console.warn('Beklenmeyen API yanıt formatı:', data);
            allProducts = [];
          }
          
          console.log('Toplam ürün sayısı:', allProducts.length);
          
          // SADECE KATEGORİ ID'Sİ 7 OLAN ÜRÜNLERİ FİLTRELE
          fetchedProducts = allProducts.filter(product => {
            const categoryId = parseInt(product.category_id);
            const isCategory7 = categoryId === 7;
            
            if (isCategory7) {
              console.log('✅ Kategori 7 ürünü bulundu:', product.id, '-', product.name);
            }
            
            return isCategory7;
          });
          
          console.log(`🎯 Kategori Filtresi Sonucu: ${fetchedProducts.length} araç ürünü bulundu`);
          
          // Resim URL'lerini düzelt
          fetchedProducts = fetchedProducts.map(product => ({
            ...product,
            image_url: fixImageUrl(product.image_url)
          }));
          
          // ID'ye göre sırala
          fetchedProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          
          console.log('Filtrelenmiş ve sıralanmış araç ürünleri:', fetchedProducts.slice(0, 5).map(p => ({
            id: p.id, 
            name: p.name,
            category_id: p.category_id
          })));
          
        } else {
          throw new Error(`API yanıt hatası: ${response.status}`);
        }
        
      } catch (apiError) {
        console.error('API çağrısı başarısız:', apiError);
        setError(`API bağlantı hatası: ${apiError.message}`);
      }
      
      setProducts(fetchedProducts);
      
      if (fetchedProducts.length === 0) {
        setError('Kategori 7\'de araç ürünü bulunamadı. Veritabanını kontrol edin.');
      } else {
        console.log(`🎉 ${fetchedProducts.length} araç ürünü başarıyla yüklendi`);
      }
      
    } catch (error) {
      console.error('fetchAracProducts genel hatası:', error);
      setError(`Ürünler yüklenirken hata: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Sepet sayısını güncelle
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
    window.history.pushState({}, '', `/arac/${categoryKey}`);
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
        id: `arac-${product.id}`,
        name: product.name,
        price: product.discount > 0 ? (product.price * (1 - product.discount / 100)) : product.price,
        originalPrice: product.price,
        image_url: product.image_url,
        category_name: 'Araç Ürünleri',
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

  // GENİŞLETİLMİŞ FİLTRELEME - Araç ürünleri için
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    console.log('Filtreleme başlıyor...', selectedCategory, 'Toplam ürün:', products.length);
    
    let filteredProducts = [];
    
    switch (selectedCategory) {
      case 'motor-yagi':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('motor') || 
                 name.includes('yağ') ||
                 name.includes('yag') ||
                 name.includes('oil') ||
                 name.includes('lubricant') ||
                 name.includes('sentetik') ||
                 desc.includes('motor') ||
                 desc.includes('yağ');
        });
        break;
        
      case 'arac-aksesuar':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('aksesuar') || 
                 name.includes('araç') ||
                 name.includes('arac') ||
                 name.includes('kılıf') ||
                 name.includes('kilif') ||
                 name.includes('kemer') ||
                 name.includes('navigasyon') ||
                 name.includes('telefon') ||
                 desc.includes('aksesuar') ||
                 desc.includes('araç');
        });
        break;
        
      case 'lastik-jant':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('lastik') || 
                 name.includes('jant') ||
                 name.includes('tekerlek') ||
                 name.includes('rim') ||
                 name.includes('tire') ||
                 name.includes('kauçuk') ||
                 name.includes('kaucuk') ||
                 desc.includes('lastik') ||
                 desc.includes('jant');
        });
        break;
        
      case 'arac-temizlik':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('temizlik') || 
                 name.includes('temizleyici') ||
                 name.includes('şampuan') ||
                 name.includes('sampuan') ||
                 name.includes('wax') ||
                 name.includes('polish') ||
                 name.includes('cilalayıcı') ||
                 name.includes('cilalayici') ||
                 name.includes('mikrofiber') ||
                 desc.includes('temiz') ||
                 desc.includes('yıka');
        });
        break;
        
      case 'elektronik-sistem':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('elektronik') || 
                 name.includes('sistem') ||
                 name.includes('alarm') ||
                 name.includes('güvenlik') ||
                 name.includes('guvenlik') ||
                 name.includes('kamera') ||
                 name.includes('sensör') ||
                 name.includes('sensor') ||
                 name.includes('bluetooth') ||
                 name.includes('usb') ||
                 desc.includes('elektronik') ||
                 desc.includes('sistem');
        });
        break;
        
      case 'yedek-parca':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('yedek') || 
                 name.includes('parça') ||
                 name.includes('parca') ||
                 name.includes('fren') ||
                 name.includes('balata') ||
                 name.includes('filtre') ||
                 name.includes('amortisör') ||
                 name.includes('amortisör') ||
                 name.includes('motor') ||
                 name.includes('vites') ||
                 desc.includes('yedek') ||
                 desc.includes('parça');
        });
        break;
        
      default:
        // Varsayılan olarak ilk 20 ürünü göster
        filteredProducts = products.slice(0, 20);
    }
    
    console.log(`${selectedCategory} kategorisi için ${filteredProducts.length} ürün bulundu`);
    
    // Eğer filtrelenmiş ürün yoksa, kategoriye göre daha geniş arama yap
    if (filteredProducts.length === 0) {
      console.log('Spesifik filtre boş, genel araç ürünlerini gösteriyor');
      const aracKeywords = ['araç', 'motor', 'lastik', 'yağ', 'temizlik', 'aksesuar'];
      filteredProducts = products.filter(p => 
        aracKeywords.some(keyword => p.name.toLowerCase().includes(keyword))
      ).slice(0, 15);
    }
    
    return filteredProducts;
  };

  const currentProducts = getFilteredProducts();
  const currentCategoryInfo = categories[selectedCategory] || categories['motor-yagi'];

  // Loading state
  if (loading) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Araç ürünleri yükleniyor...</p>
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
            <p>🔍 API Endpoint'lerini kontrol edin:</p>
            <ul>
              <li><strong>Temel endpoint:</strong> GET {API_BASE_URL}/api/products</li>
              <li><strong>Kategori 7 kontrolü:</strong> category_id = 7</li>
            </ul>
            <p>💡 Tavsiyeler:</p>
            <ul>
              <li>Tarayıcıda manuel olarak {API_BASE_URL}/api/products adresini ziyaret edin</li>
              <li>Kategori 7'de ürün olup olmadığını kontrol edin</li>
              <li>Server loglarını kontrol edin</li>
              <li>CORS ayarlarını kontrol edin</li>
            </ul>
          </div>
          <button onClick={fetchAracProducts} className="retry-btn">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pasta-gallery-wrapper">
      <h2 className="gallery-title">🚗 Araç Ürünleri & Aksesuar</h2>
      
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
        Araç → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
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
          <div className="no-products-icon">🚗</div>
          <h3>Bu kategoride henüz ürün bulunmuyor</h3>
          <p>Toplam {products.length} ürün kategori 7'de mevcut ama "{currentCategoryInfo.name}" kategorisinde ürün bulunamadı.</p>
          <p>Diğer kategorileri kontrol edebilir veya daha sonra tekrar bakabilirsiniz.</p>
          <button onClick={fetchAracProducts} className="refresh-btn">
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
                  src={product.image_url || '/default-product.png'}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  style={{ cursor: 'pointer' }}
                  onError={(e) => {
                    console.log('Resim yükleme hatası:', e.target.src);
                    e.currentTarget.src = '/default-product.png';
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
                    : product.description || 'Kaliteli araç ürünü'
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

     

      {/* Ürün Detay Modal */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>×</button>
            
            <div className="modal-body">
              <div className="modal-image-section">
                <img
                  src={selectedProduct.image_url || '/default-product.png'}
                  alt={selectedProduct.name}
                  className="modal-image"
                  onError={(e) => {
                    e.currentTarget.src = '/default-product.png';
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
                  <p>{selectedProduct.description || 'Bu ürün aracınız için gerekli olan kaliteli bir üründür. Güvenli sürüş deneyiminizi arttırır ve aracınızın performansını optimize eder.'}</p>
                  
                  <div className="product-details">
                    <p><strong>Stok:</strong> {selectedProduct.stock || 50} adet</p>
                    <p><strong>Ürün ID:</strong> {selectedProduct.id}</p>
                    <p><strong>Kategori:</strong> Araç Ürünleri</p>
                  </div>

                  <h4>Özellikler:</h4>
                  <ul>
                    <li>Yüksek kaliteli malzemeden üretilmiştir</li>
                    <li>Aracınız için güvenli ve uyumlu</li>
                    <li>Dayanıklı ve uzun ömürlü</li>
                    <li>Kolay montaj ve kullanım</li>
                    <li>Garanti kapsamında</li>
                  </ul>
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

export default Arac;