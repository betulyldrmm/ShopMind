import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './Nostalji.css';
const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";
const response = await fetch(`${API_URL}/api/categories`);

// Büyükbabaya hediye kategorileri (UI için)
const categories = {
  'nostaljik-eglence': { name: '📻 Nostaljik Eğlence', color: '#8B4513' },
  'konfor-saglik': { name: '🪑 Konfor & Sağlık', color: '#2F4F4F' },
  'hobi-koleksiyon': { name: '🎯 Hobi & Koleksiyon', color: '#8B0000' },
  'kitap-kultur': { name: '📚 Kitap & Kültür', color: '#4682B4' }
 
  
};

const Nostalji = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(subcategoryId || 'nostaljik-eglence');
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
    fetchBuyukbabaProducts();
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

  // fetchBuyukbabaProducts fonksiyonu - Arac.jsx örneğine göre düzeltildi
  const fetchBuyukbabaProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Büyükbabaya hediye ürünleri API çağrısı başlıyor...');
      
      let fetchedProducts = [];
      
      try {
        console.log('Büyükbabaya hediye ürünleri çekiliyor...');
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
          
          // BÜYÜKBABAנA HEDİYE ÜRÜNLERİNİ FİLTRELE - Kategori ID veya içerik bazlı
          // Önce büyükbaba/nostaljik ile ilgili ürünleri bul
          fetchedProducts = allProducts.filter(product => {
            const name = (product.name || '').toLowerCase();
            const desc = (product.description || '').toLowerCase();
            
            // Büyükbaba/nostaljik anahtar kelimeler
            const nostaljikKeywords = [
              'nostaljik', 'nostalji', 'büyükbaba', 'buyukbaba', 'dede',
              'vintage', 'retro', 'klasik', 'geçmiş', 'gecmis',
              'hatıra', 'hatira', 'anı', 'ani', 'radyo', 'plak',
              'gramofon', 'müzik', 'muzik', 'kitap', 'satranç', 'satrenc',
              'puzzle', 'oyun', 'masa', 'lamba', 'saat', 'çerçeve', 'cerceve',
              'fotoğraf', 'fotograf', 'yastık', 'yastigı', 'konfor',
              'termos', 'bardak', 'masaj'
            ];
            
            const isBuyukbabaProduct = nostaljikKeywords.some(keyword => 
              name.includes(keyword) || desc.includes(keyword)
            );
            
            if (isBuyukbabaProduct) {
              console.log('✅ Büyükbaba ürünü bulundu:', product.id, '-', product.name);
            }
            
            return isBuyukbabaProduct;
          });
          
          console.log(`🎯 Anahtar Kelime Filtresi Sonucu: ${fetchedProducts.length} büyükbaba ürünü bulundu`);
          
          // Eğer anahtar kelime ile bulunamadıysa, kategori ID bazlı arama yap
          if (fetchedProducts.length === 0) {
            console.log('Anahtar kelime ile bulunamadı, kategori ID ile deneniyor...');
            
            // Kategori ID 1 ile dene (büyükbaba kategorisi olabilir)
            fetchedProducts = allProducts.filter(product => {
              const categoryId = parseInt(product.category_id);
              return categoryId === 1;
            });
            
            console.log(`Kategori ID 1 ile ${fetchedProducts.length} ürün bulundu`);
          }
          
          // Hala bulunamadıysa, ID aralığı ile dene
          if (fetchedProducts.length === 0) {
            console.log('Kategori ID ile bulunamadı, ID aralığı ile deneniyor...');
            
            fetchedProducts = allProducts.filter(product => {
              const productId = parseInt(product.id);
              // Genel olarak kullanılabilecek ID aralıkları
              return (productId >= 1 && productId <= 50) || 
                     (productId >= 100 && productId <= 150) ||
                     (productId >= 200 && productId <= 250);
            }).slice(0, 15); // İlk 15 ürünü al
            
            console.log(`ID aralığı ile ${fetchedProducts.length} ürün bulundu`);
          }
          
          // Son çare: ilk 15 ürünü al
          if (fetchedProducts.length === 0 && allProducts.length > 0) {
            console.log('Hiçbir filtre işe yaramadı, ilk 15 ürün alınıyor...');
            fetchedProducts = allProducts.slice(0, 15);
          }
          
          // Resim URL'lerini düzelt
          fetchedProducts = fetchedProducts.map(product => ({
            ...product,
            image_url: fixImageUrl(product.image_url)
          }));
          
          // ID'ye göre sırala
          fetchedProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          
          console.log('Filtrelenmiş ve sıralanmış büyükbaba ürünleri:', fetchedProducts.slice(0, 5).map(p => ({
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
        setError('Büyükbabaya hediye ürünü bulunamadı. Veritabanında uygun ürün bulunmuyor.');
      } else {
        console.log(`🎉 ${fetchedProducts.length} büyükbaba ürünü başarıyla yüklendi`);
      }
      
    } catch (error) {
      console.error('fetchBuyukbabaProducts genel hatası:', error);
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
    window.history.pushState({}, '', `/buyukbaba/${categoryKey}`);
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
      
      const existingSepet = localStorage.getItem('sepet');
      let sepetItems = existingSepet ? JSON.parse(existingSepet) : [];

      // Ürün formatını Sepet.jsx'e uygun hale getir
      const cartItem = {
        id: `buyukbaba-${product.id}`,
        name: product.name,
        price: product.discount > 0 ? (product.price * (1 - product.discount / 100)) : product.price,
        originalPrice: product.price,
        image_url: product.image_url,
        category_name: 'Büyükbabaya Hediye',
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
      notification.textContent = `${product.name} büyükbaba hediye sepetine eklendi! 👴`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #8B4513;
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

      console.log('Büyükbaba sepetine eklendi:', product.name);
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  const handleProductClick = (product) => {
    // Ürün detay sayfasına ID ile yönlendir
    navigate(`/urun/${product.id}`);
  };

  // GENİŞLETİLMİŞ FİLTRELEME - Arac.jsx örneğine göre düzeltildi
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    console.log('Filtreleme başlıyor...', selectedCategory, 'Toplam ürün:', products.length);
    
    let filteredProducts = [];
    
    switch (selectedCategory) {
      case 'nostaljik-eglence':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('radyo') || 
                 name.includes('gramofon') ||
                 name.includes('plak') ||
                 name.includes('müzik') ||
                 name.includes('muzik') ||
                 name.includes('nostaljik') ||
                 name.includes('retro') ||
                 name.includes('vintage') ||
                 desc.includes('müzik') ||
                 desc.includes('nostaljik');
        });
        break;
        
      case 'konfor-saglik':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('yastık') || 
                 name.includes('yastigı') ||
                 name.includes('masaj') ||
                 name.includes('bardak') ||
                 name.includes('termos') ||
                 name.includes('sıcak') ||
                 name.includes('sicak') ||
                 name.includes('konfor') ||
                 desc.includes('rahat') ||
                 desc.includes('sağlık');
        });
        break;
        
      case 'hobi-koleksiyon':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('puzzle') || 
                 name.includes('satranç') ||
                 name.includes('satranc') ||
                 name.includes('oyun') ||
                 name.includes('koleksiyon') ||
                 name.includes('hobi') ||
                 name.includes('takım') ||
                 name.includes('takim') ||
                 desc.includes('koleksiyon') ||
                 desc.includes('hobi');
        });
        break;
        
      case 'kitap-kultur':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('kitap') || 
                 name.includes('dvd') ||
                 name.includes('film') ||
                 name.includes('sinema') ||
                 name.includes('kültür') ||
                 name.includes('kultur') ||
                 name.includes('edebiyat') ||
                 name.includes('okuma') ||
                 desc.includes('kitap') ||
                 desc.includes('okuma');
        });
        break;
        
      case 'pratik-yasam':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('masa') || 
                 name.includes('lamba') ||
                 name.includes('saat') ||
                 name.includes('aydınlatma') ||
                 name.includes('aydinlatma') ||
                 name.includes('pratik') ||
                 name.includes('günlük') ||
                 name.includes('gunluk') ||
                 desc.includes('pratik') ||
                 desc.includes('kullanışlı');
        });
        break;
        
      case 'anı-hatıra':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('fotoğraf') || 
                 name.includes('fotograf') ||
                 name.includes('çerçeve') ||
                 name.includes('cerceve') ||
                 name.includes('hatıra') ||
                 name.includes('hatira') ||
                 name.includes('anı') ||
                 name.includes('ani') ||
                 desc.includes('hatıra') ||
                 desc.includes('anı');
        });
        break;
        
      default:
        // Varsayılan olarak ilk 20 ürünü göster
        filteredProducts = products.slice(0, 20);
    }
    
    console.log(`${selectedCategory} kategorisi için ${filteredProducts.length} ürün bulundu`);
    
    // Eğer filtrelenmiş ürün yoksa, kategoriye göre daha geniş arama yap
    if (filteredProducts.length === 0) {
      console.log('Spesifik filtre boş, genel büyükbaba ürünlerini gösteriyor');
      const buyukbabaKeywords = ['nostaljik', 'vintage', 'klasik', 'geçmiş', 'hatıra', 'anı'];
      filteredProducts = products.filter(p => 
        buyukbabaKeywords.some(keyword => p.name.toLowerCase().includes(keyword))
      ).slice(0, 15);
      
      // Hala yoksa tüm ürünleri göster
      if (filteredProducts.length === 0) {
        filteredProducts = products;
      }
    }
    
    return filteredProducts;
  };

  const currentProducts = getFilteredProducts();
  const currentCategoryInfo = categories[selectedCategory] || categories['nostaljik-eglence'];

  // Loading state
  if (loading) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Büyükbabaya hediye ürünleri yükleniyor... 👴</p>
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
              <li><strong>Arama stratejisi:</strong> Anahtar kelime → Kategori ID → ID aralığı → İlk 15 ürün</li>
            </ul>
            <p>💡 Tavsiyeler:</p>
            <ul>
              <li>Tarayıcıda manuel olarak {API_BASE_URL}/api/products adresini ziyaret edin</li>
              <li>Nostaljik/büyükbaba ile ilgili ürün olup olmadığını kontrol edin</li>
              <li>Server loglarını kontrol edin</li>
              <li>CORS ayarlarını kontrol edin</li>
            </ul>
          </div>
          <button onClick={fetchBuyukbabaProducts} className="retry-btn">
            🔄 Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pasta-gallery-wrapper">
      <h2 className="gallery-title">👴 Büyükbabaya Özel Hediyeler</h2>
      
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
          🛒 Hediye Sepeti {cartCount > 0 && `(${cartCount})`}
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
        Büyükbabaya Hediye → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
          {currentCategoryInfo.name}
        </span>
      </div>

      {/* Kategori Başlığı */}
      <div className="category-header" style={{ color: currentCategoryInfo.color }}>
        {currentCategoryInfo.name} - {currentProducts.length} Özel Hediye
        {user && <span className="user-welcome"> | Hoş geldin, <strong>{user.username}</strong>! 👋</span>}
      </div>

      {/* Debug Bilgisi - Geliştirme için */}
     
      {/* Ürün Yoksa Mesaj */}
      {currentProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">👴</div>
          <h3>Bu kategoride henüz hediye bulunmuyor</h3>
          <p>Toplam {products.length} ürün mevcut ama "{currentCategoryInfo.name}" kategorisinde ürün bulunamadı.</p>
          <p>Diğer kategorileri kontrol edebilir veya daha sonra tekrar bakabilirsiniz.</p>
          <button onClick={fetchBuyukbabaProducts} className="refresh-btn">
            🔄 Hediyeleri Yenile
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
                
                {/* Hediye etiketi */}
                <div className="gift-badge">
                  🎁 Hediye
                </div>
                
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
                  <Heart size={16} fill={favorites.has(product.id) ? '#8B4513' : 'none'} />
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
                    : product.description || 'Büyükbabanız için özel seçilmiş nostaljik hediye'
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
                  style={{
                    backgroundColor: (product.stock || 0) > 0 ? '#8B4513' : '#ccc',
                    color: 'white'
                  }}
                >
                  <ShoppingCart size={16} />
                  {(product.stock || 0) > 0 ? '🎁 Hediye Sepetine Ekle' : 'Stokta Yok'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performans Bilgisi */}
     

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
                <div className="modal-gift-badge">🎁 Büyükbabaya Özel Hediye</div>
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
                  <h4>Hediye Açıklaması:</h4>
                  <p>{selectedProduct.description || 'Bu özel hediye, büyükbabanızın nostaljik anılarını canlandıracak ve günlük yaşamına keyif katacak özel olarak seçilmiş bir üründür. Geçmişe dair güzel anıları hatırlatırken, modern konfor ve kaliteyi bir araya getirir.'}</p>
                  
                  <div className="product-details">
                    <p><strong>Stok:</strong> {selectedProduct.stock || 50} adet</p>
                    <p><strong>Ürün ID:</strong> {selectedProduct.id}</p>
                    <p><strong>Kategori:</strong> Büyükbabaya Özel Hediyeler</p>
                    <p><strong>Hediye Uygunluğu:</strong> Büyükbabalar için özel seçildi 👴</p>
                  </div>

                  <h4>Bu Hediyenin Özellikleri:</h4>
                  <ul>
                    <li>Nostaljik değer taşır ve anıları canlandırır</li>
                    <li>Kaliteli malzemeden üretilmiş dayanıklı yapı</li>
                    <li>Büyükbabaların beğenisine uygun tasarım</li>
                    <li>Günlük kullanıma uygun pratik özellikler</li>
                    <li>Özel hediye paketleme seçeneği mevcut</li>
                    <li>Garanti kapsamında güvenli alışveriş</li>
                  </ul>
                  
                  <div className="gift-suggestion">
                    <h4>💡 Hediye Önerisi:</h4>
                    <p>Bu ürün büyükbabanızın {selectedProduct.categoryName.toLowerCase()} ilgisine uygun olarak seçilmiştir. 
                    Doğum günü, babalar günü veya özel günlerde verilebilecek anlamlı bir hediyedir.</p>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button
                    className={`modal-favorite-btn ${favorites.has(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    style={{ backgroundColor: favorites.has(selectedProduct.id) ? '#8B4513' : '#f0f0f0' }}
                  >
                    <Heart size={18} fill={favorites.has(selectedProduct.id) ? '#8B4513' : 'none'} />
                    {favorites.has(selectedProduct.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </button>
                  
                  <button
                    className={`modal-add-to-cart-btn ${(selectedProduct.stock || 0) === 0 ? 'disabled' : ''}`}
                    onClick={() => {
                      addToCart(selectedProduct);
                      closeProductDetail();
                    }}
                    disabled={(selectedProduct.stock || 0) === 0}
                    style={{
                      backgroundColor: (selectedProduct.stock || 0) > 0 ? '#8B4513' : '#ccc',
                      color: 'white'
                    }}
                  >
                    <ShoppingCart size={18} />
                    {(selectedProduct.stock || 0) > 0 ? '🎁 Hediye Sepetine Ekle' : 'Stokta Yok'}
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

export default Nostalji;