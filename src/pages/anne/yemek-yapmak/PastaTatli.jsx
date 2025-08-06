import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './PastaTatli.css';

const API_BASE_URL = 'http://localhost:5001';

// Kategori bilgileri (UI için)
const categories = {
  'pasta-tatli': { name: '🍰 Pasta & Tatlı', color: '#ff6b9d' },
  'dunya-mutfagi': { name: '🌍 Dünya Mutfağı', color: '#4ecdc4' },
  'kahvalti': { name: '☕ Kahvaltı', color: '#ffa726' },
  'mutfak-esyalari': { name: '🍳 Mutfak Eşyaları', color: '#66bb6a' },
  'saglikli-yemek': { name: '💪 Sağlıklı Yemek', color: '#ab47bc' },
  'baharat-konserve': { name: '🧂 Baharat & Konserve', color: '#8d6e63' }
};

const PastaTatli = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(subcategoryId || 'pasta-tatli');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    
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
    
   
    updateCartCount();
    

    fetchYemekProducts();
  }, [subcategoryId]);

  
  const fixImageUrl = (imageUrl) => {
    if (!imageUrl) return '/default-product.png';
    
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    
    if (imageUrl.startsWith('/images/')) {
      const fileName = imageUrl.replace('/images/', '');
      return `/${fileName}`;
    }
    
   
    if (imageUrl.startsWith('images/')) {
      const fileName = imageUrl.replace('images/', '');
      return `/${fileName}`;
    }
    
    
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    
    
    return `/${imageUrl}`;
  };


  const fetchYemekProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('API çağrısı başlıyor...');
      
      const kitchenProductIds = [
        306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319,
        321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334,
        335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348,
        349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360
      ];
      
      let fetchedProducts = [];
      
      try {
        console.log('Tüm ürünler çekiliyor...');
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
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
          console.log('Aranacak mutfak ID\'leri:', kitchenProductIds.length, 'adet');
          
          
          fetchedProducts = allProducts.filter(product => {
            const productId = parseInt(product.id);
            const isKitchenProduct = kitchenProductIds.includes(productId);
            
            if (isKitchenProduct) {
              console.log('✅ Mutfak ürünü bulundu:', product.id, '-', product.name);
            }
            
            return isKitchenProduct;
          });
          
          console.log(`🎯 ID Filtresi Sonucu: ${fetchedProducts.length}/${kitchenProductIds.length} mutfak ürünü bulundu`);
          
          // Bulunamayan ID'leri kontrol et
          const foundIds = fetchedProducts.map(p => parseInt(p.id));
          const missingIds = kitchenProductIds.filter(id => !foundIds.includes(id));
          if (missingIds.length > 0) {
            console.warn('⚠️ Bulunamayan mutfak ürünü ID\'leri:', missingIds.slice(0, 10));
          }
          
          // Resim URL'lerini düzelt
          fetchedProducts = fetchedProducts.map(product => ({
            ...product,
            image_url: fixImageUrl(product.image_url)
          }));
          
          // Kategoriye göre sırala (önce pasta/tatlı, sonra diğerleri)
          fetchedProducts.sort((a, b) => {
            const aId = parseInt(a.id);
            const bId = parseInt(b.id);
            
            const aIsPasta = aId >= 306 && aId <= 320;
            const bIsPasta = bId >= 306 && bId <= 320;
            
            if (aIsPasta && !bIsPasta) return -1;
            if (!aIsPasta && bIsPasta) return 1;
            
            return aId - bId; // ID'ye göre sırala
          });
          
          console.log('Filtrelenmiş ve sıralanmış mutfak ürünleri:', fetchedProducts.slice(0, 5).map(p => ({
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
        setError('Belirtilen ID\'lerde mutfak ürünü bulunamadı. Veritabanını kontrol edin.');
      } else {
        console.log(`🎉 ${fetchedProducts.length} mutfak ürünü başarıyla yüklendi`);
      }
      
    } catch (error) {
      console.error('fetchYemekProducts genel hatası:', error);
      setError(`Ürünler yüklenirken hata: ${error.message}`);
      setProducts([]);
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
    window.history.pushState({}, '', `/anne/yemek-yapmak/${categoryKey}`);
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
        id: `yemek-yapmak-${product.id}`,
        name: product.name,
        price: product.discount > 0 ? (product.price * (1 - product.discount / 100)) : product.price,
        originalPrice: product.price,
        image_url: product.image_url,
        category_name: 'Yemek Yapmak',
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
    
    navigate(`/urun/${product.id}`);
  };

  // GENİŞLETİLMİŞ FİLTRELEME - Daha akıllı ve kapsamlı
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    console.log('Filtreleme başlıyor...', selectedCategory, 'Toplam ürün:', products.length);
    
    let filteredProducts = [];
    
    switch (selectedCategory) {
      case 'pasta-tatli':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('pasta') || 
                 name.includes('tatlı') ||
                 name.includes('tatli') ||
                 name.includes('kek') ||
                 name.includes('şeker') ||
                 name.includes('seker') ||
                 name.includes('krema') ||
                 name.includes('hamur') ||
                 name.includes('süsleme') ||
                 name.includes('susleme') ||
                 desc.includes('pasta') ||
                 desc.includes('tatlı') ||
                 desc.includes('kek');
        });
        break;
        
      case 'dunya-mutfagi':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('pizza') || 
                 name.includes('sushi') ||
                 name.includes('wok') ||
                 name.includes('tortilla') ||
                 name.includes('döner') ||
                 name.includes('doner') ||
                 desc.includes('dünya') ||
                 desc.includes('uluslararası');
        });
        break;
        
      case 'kahvalti':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('kahvaltı') || 
                 name.includes('kahvalti') ||
                 name.includes('yumurta') ||
                 name.includes('ekmek') ||
                 name.includes('reçel') ||
                 name.includes('recal') ||
                 name.includes('kahve') ||
                 name.includes('çay') ||
                 name.includes('cay') ||
                 desc.includes('kahvaltı');
        });
        break;
        
      case 'mutfak-esyalari':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('tencere') || 
                 name.includes('tava') ||
                 name.includes('bıçak') ||
                 name.includes('bicak') ||
                 name.includes('blender') ||
                 name.includes('fırın') ||
                 name.includes('firin') ||
                 name.includes('spatula') ||
                 name.includes('mikser') ||
                 name.includes('terazi') ||
                 name.includes('stand') ||
                 name.includes('şantiyör') ||
                 name.includes('santiyor') ||
                 name.includes('kalem') ||
                 name.includes('dilim') ||
                 name.includes('cam') ||
                 name.includes('saklama') ||
                 name.includes('çelik') ||
                 name.includes('celik') ||
                 name.includes('süzgeç') ||
                 name.includes('suzgec') ||
                 desc.includes('mutfak') ||
                 desc.includes('pişir') ||
                 desc.includes('yemek');
        });
        break;
        
      case 'saglikli-yemek':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('vitamin') || 
                 name.includes('organik') ||
                 name.includes('sağlık') ||
                 name.includes('saglik') ||
                 name.includes('diyet') ||
                 name.includes('fit') ||
                 desc.includes('sağlık') ||
                 desc.includes('organik');
        });
        break;
        
      case 'baharat-konserve':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('baharat') || 
                 name.includes('konserve') ||
                 name.includes('zeytinyağı') ||
                 name.includes('zeytinyagi') ||
                 name.includes('sirke') ||
                 name.includes('tuz') ||
                 name.includes('temizleyici') ||
                 name.includes('spray') ||
                 name.includes('parke') ||
                 name.includes('antibakteriyel') ||
                 name.includes('duş') ||
                 name.includes('dus') ||
                 name.includes('banyo') ||
                 desc.includes('baharat') ||
                 desc.includes('temizl');
        });
        break;
        
      default:
       
        filteredProducts = products.slice(0, 20);
    }
    
    console.log(`${selectedCategory} kategorisi için ${filteredProducts.length} ürün bulundu`);
    
    // Eğer filtrelenmiş ürün yoksa, kategoriye göre daha geniş arama yap
    if (filteredProducts.length === 0) {
      console.log('Spesifik filtre boş, genel mutfak ürünlerini gösteriyor');
      const mutfakKeywords = ['cam', 'çelik', 'terazi', 'mikser', 'stand', 'pasta', 'krem', 'süsleme', 'dilim'];
      filteredProducts = products.filter(p => 
        mutfakKeywords.some(keyword => p.name.toLowerCase().includes(keyword))
      ).slice(0, 15);
    }
    
    return filteredProducts;
  };

  const currentProducts = getFilteredProducts();
  const currentCategoryInfo = categories[selectedCategory] || categories['pasta-tatli'];

  
  if (loading) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Yemek yapma ürünleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  
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
              <li><strong>Kategori endpoint:</strong> GET {API_BASE_URL}/api/categories/1/products</li>
            </ul>
            <p>💡 Tavsiyeler:</p>
            <ul>
              <li>Tarayıcıda manuel olarak {API_BASE_URL}/api/products adresini ziyaret edin</li>
              <li>Server loglarını kontrol edin</li>
              <li>CORS ayarlarını kontrol edin</li>
              <li>Postman ile API'yi test edin</li>
            </ul>
          </div>
          <button onClick={fetchYemekProducts} className="retry-btn">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pasta-gallery-wrapper">
      <h2 className="gallery-title">🎁 Anne için Yemek Yapma Hediye Önerileri</h2>
      
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
        Anne → Yemek Yapmak → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
          {currentCategoryInfo.name}
        </span>
      </div>

      {/* Kategori Başlığı */}
      <div className="category-header" style={{ color: currentCategoryInfo.color }}>
        {currentCategoryInfo.name} - {currentProducts.length} Ürün
        {user && <span className="user-welcome"> | Hoş geldin, <strong>{user.username}</strong>!</span>}
      </div>

      {/* Debug Bilgisi - Geliştirme için */}
      <div className="debug-info" style={{ 
        background: '#f8f9fa', 
        padding: '10px', 
        margin: '10px 0', 
        fontSize: '12px',
        borderRadius: '5px',
        border: '1px solid #dee2e6'
      }}>
        🔍 Debug: Toplam {products.length} ürün yüklendi, {currentProducts.length} ürün gösteriliyor
        <br />
        📊 Seçili kategori: {selectedCategory}
        <br />
        🏷️ Örnek ürünler: {products.slice(0, 3).map(p => `${p.id}-${p.name}`).join(' | ')}
      </div>

      {/* Ürün Yoksa Mesaj */}
      {currentProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🍳</div>
          <h3>Bu kategoride henüz ürün bulunmuyor</h3>
          <p>Toplam {products.length} ürün veritabanında mevcut ama "{currentCategoryInfo.name}" kategorisinde ürün bulunamadı.</p>
          <p>Diğer kategorileri kontrol edebilir veya daha sonra tekrar bakabilirsiniz.</p>
          <button onClick={fetchYemekProducts} className="refresh-btn">
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
                  onLoad={() => {
                    console.log('Resim başarıyla yüklendi:', product.image_url, '→', e.target.src);
                  }}
                />
                
             
               
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
                    : product.description || 'Yemek yapma deneyiminizi keyifli hale getirecek kaliteli ürün'
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
                  <p>{selectedProduct.description || 'Bu ürün mutfak işlerinizde size büyük kolaylık sağlayacak. Yemek yapma deneyiminizi daha keyifli ve verimli hale getirir. Anne için mükemmel bir hediye seçeneği.'}</p>
                  
                  <div className="product-details">
                    <p><strong>Stok:</strong> {selectedProduct.stock || 50} adet</p>
                    <p><strong>Ürün ID:</strong> {selectedProduct.id}</p>
                    <p><strong>Kategori:</strong> Yemek Yapmak</p>
                  </div>

                  <h4>Özellikler:</h4>
                  <ul>
                    <li>Yüksek kaliteli malzemeden üretilmiştir</li>
                    <li>Mutfakta pratik kullanım sağlar</li>
                    <li>Dayanıklı ve uzun ömürlü</li>
                    <li>Kolay temizlenebilir</li>
                    <li>Güvenli kullanım için tasarlanmıştır</li>
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

export default PastaTatli;