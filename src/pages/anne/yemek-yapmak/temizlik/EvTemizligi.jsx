import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './EvTemizligi.css';

// Her kategoriden 10'ar ürün - fiyatlar eklendi
const allImages = {
  'temizlik-urunleri': [
    { filename: 'cok-amacli-temizleyici.jpg', alt: 'Çok Amaçlı Temizleyici', price: 29.99, originalPrice: 39.99 },
    { filename: 'dezenfektan.jpg', alt: 'Dezenfektan Sprey', price: 19.99, originalPrice: 29.99 },
    { filename: 'cam-temizleyici.jpg', alt: 'Cam Temizleyici', price: 24.99, originalPrice: 34.99 },
    { filename: 'banyo-temizleyici.jpg', alt: 'Banyo Temizleyici', price: 34.99, originalPrice: 44.99 },
    { filename: 'mutfak-temizleyici.jpg', alt: 'Mutfak Temizleyici', price: 27.99, originalPrice: 37.99 },
    { filename: 'halı-temizleyici.jpg', alt: 'Halı Temizleyici', price: 49.99, originalPrice: 64.99 },
    { filename: 'yüzey-temizleyici.jpg', alt: 'Yüzey Temizleyici', price: 22.99, originalPrice: 32.99 },
    { filename: 'antibakteriyel-sprey.jpg', alt: 'Antibakteriyel Sprey', price: 17.99, originalPrice: 25.99 },
    { filename: 'genel-temizlik-seti.jpg', alt: 'Genel Temizlik Seti', price: 89.99, originalPrice: 119.99 },
    { filename: 'eko-temizleyici.jpg', alt: 'Ekolojik Temizleyici', price: 35.99, originalPrice: 45.99 }
  ],
  'temizlik-aletleri': [
    { filename: 'elektrikli-supurge.jpg', alt: 'Elektrikli Süpürge', price: 899.99, originalPrice: 1199.99 },
    { filename: 'robot-supurge.jpg', alt: 'Robot Süpürge', price: 1899.99, originalPrice: 2499.99 },
    { filename: 'buharlı-temizleyici.jpg', alt: 'Buharlı Temizleyici', price: 699.99, originalPrice: 899.99 },
    { filename: 'yüksek-basınclı-temizleyici.jpg', alt: 'Yüksek Basınçlı Temizleyici', price: 1299.99, originalPrice: 1699.99 },
    { filename: 'halı-yıkama-makinesi.jpg', alt: 'Halı Yıkama Makinesi', price: 599.99, originalPrice: 799.99 },
    { filename: 'pencere-temizlik-robotu.jpg', alt: 'Pencere Temizlik Robotu', price: 1199.99, originalPrice: 1499.99 },
    { filename: 'ultrasonic-temizleyici.jpg', alt: 'Ultrasonik Temizleyici', price: 299.99, originalPrice: 399.99 },
    { filename: 'hava-temizleyici.jpg', alt: 'Hava Temizleyici', price: 799.99, originalPrice: 999.99 },
    { filename: 'nem-alici.jpg', alt: 'Nem Alıcı', price: 549.99, originalPrice: 699.99 },
    { filename: 'ozon-jeneratoru.jpg', alt: 'Ozon Jeneratörü', price: 399.99, originalPrice: 549.99 }
  ],
  'supurge-mop': [
    { filename: 'klasik-supurge.jpg', alt: 'Klasik Süpürge', price: 49.99, originalPrice: 69.99 },
    { filename: 'mikrofiber-mop.jpg', alt: 'Mikrofiber Mop', price: 89.99, originalPrice: 119.99 },
    { filename: 'spin-mop.jpg', alt: 'Spin Mop Seti', price: 129.99, originalPrice: 169.99 },
    { filename: 'el-supurgesi.jpg', alt: 'El Süpürgesi', price: 29.99, originalPrice: 39.99 },
    { filename: 'paspas.jpg', alt: 'Paspas', price: 39.99, originalPrice: 54.99 },
    { filename: 'toz-alma-bezi.jpg', alt: 'Toz Alma Bezi', price: 19.99, originalPrice: 29.99 },
    { filename: 'temizlik-fircasi.jpg', alt: 'Temizlik Fırçası Seti', price: 59.99, originalPrice: 79.99 },
    { filename: 'jiletli-cam-silecegi.jpg', alt: 'Jiletli Cam Sileceği', price: 34.99, originalPrice: 49.99 },
    { filename: 'uzatılabilir-mop.jpg', alt: 'Uzatılabilir Mop', price: 79.99, originalPrice: 99.99 },
    { filename: 'elektrostatik-toz-bezi.jpg', alt: 'Elektrostatik Toz Bezi', price: 24.99, originalPrice: 34.99 }
  ],
  'banyo-temizlik': [
    { filename: 'tuvalet-fircasi.jpg', alt: 'Tuvalet Fırçası', price: 39.99, originalPrice: 54.99 },
    { filename: 'banyo-fayans-temizleyici.jpg', alt: 'Banyo Fayans Temizleyici', price: 32.99, originalPrice: 44.99 },
    { filename: 'wc-temizlik-jeli.jpg', alt: 'WC Temizlik Jeli', price: 18.99, originalPrice: 26.99 },
    { filename: 'duş-kabini-temizleyici.jpg', alt: 'Duş Kabini Temizleyici', price: 29.99, originalPrice: 39.99 },
    { filename: 'banyo-deterjan.jpg', alt: 'Banyo Deterjanı', price: 25.99, originalPrice: 35.99 },
    { filename: 'kireç-cozucu.jpg', alt: 'Kireç Çözücü', price: 22.99, originalPrice: 32.99 },
    { filename: 'banyo-sungeri.jpg', alt: 'Banyo Süngeri', price: 14.99, originalPrice: 21.99 },
    { filename: 'tıkanıklık-acici.jpg', alt: 'Tıkanıklık Açıcı', price: 42.99, originalPrice: 57.99 },
    { filename: 'banyo-dezenfektanı.jpg', alt: 'Banyo Dezenfektanı', price: 27.99, originalPrice: 37.99 },
    { filename: 'banyo-temizlik-seti.jpg', alt: 'Banyo Temizlik Seti', price: 89.99, originalPrice: 119.99 }
  ],
  'mutfak-temizlik': [
    { filename: 'bulaşık-deterjanı.jpg', alt: 'Bulaşık Deterjanı', price: 19.99, originalPrice: 27.99 },
    { filename: 'fırın-temizleyici.jpg', alt: 'Fırın Temizleyici', price: 34.99, originalPrice: 47.99 },
    { filename: 'yag-cozucu.jpg', alt: 'Yağ Çözücü', price: 28.99, originalPrice: 38.99 },
    { filename: 'bulaşık-makinesi-deterjanı.jpg', alt: 'Bulaşık Makinesi Deterjanı', price: 45.99, originalPrice: 59.99 },
    { filename: 'mutfak-sungeri.jpg', alt: 'Mutfak Süngeri Paketi', price: 12.99, originalPrice: 18.99 },
    { filename: 'mikrodalga-temizleyici.jpg', alt: 'Mikrodalga Temizleyici', price: 22.99, originalPrice: 32.99 },
    { filename: 'buzdolabı-temizleyici.jpg', alt: 'Buzdolabı Temizleyici', price: 26.99, originalPrice: 36.99 },
    { filename: 'lavabo-temizleyici.jpg', alt: 'Lavabo Temizleyici', price: 31.99, originalPrice: 42.99 },
    { filename: 'ocak-temizleyici.jpg', alt: 'Ocak Temizleyici', price: 29.99, originalPrice: 39.99 },
    { filename: 'mutfak-temizlik-seti.jpg', alt: 'Mutfak Temizlik Seti', price: 79.99, originalPrice: 109.99 }
  ],
  'camasir-urunleri': [
    { filename: 'camasir-deterjanı.jpg', alt: 'Çamaşır Deterjanı', price: 39.99, originalPrice: 52.99 },
    { filename: 'camasir-yumuşatıcısı.jpg', alt: 'Çamaşır Yumuşatıcısı', price: 24.99, originalPrice: 34.99 },
    { filename: 'leke-cikartici.jpg', alt: 'Leke Çıkartıcı', price: 29.99, originalPrice: 39.99 },
    { filename: 'beyazlatici.jpg', alt: 'Beyazlatıcı', price: 18.99, originalPrice: 26.99 },
    { filename: 'renk-koruyucu.jpg', alt: 'Renk Koruyucu', price: 32.99, originalPrice: 44.99 },
    { filename: 'camasir-makinesi-temizleyici.jpg', alt: 'Çamaşır Makinesi Temizleyici', price: 36.99, originalPrice: 49.99 },
    { filename: 'kuru-temizleme-seti.jpg', alt: 'Kuru Temizleme Seti', price: 89.99, originalPrice: 119.99 },
    { filename: 'camasir-sepeti.jpg', alt: 'Çamaşır Sepeti', price: 69.99, originalPrice: 89.99 },
    { filename: 'camasir-asma-askısı.jpg', alt: 'Çamaşır Asma Askısı', price: 45.99, originalPrice: 62.99 },
    { filename: 'ütü-spray.jpg', alt: 'Ütü Spray', price: 21.99, originalPrice: 31.99 }
  ]
};

const categories = {
  'temizlik-urunleri': { name: '🧽 Temizlik Ürünleri', color: '#4fc3f7' },
  'temizlik-aletleri': { name: '🤖 Temizlik Aletleri', color: '#66bb6a' },
  'supurge-mop': { name: '🧹 Süpürge & Mop', color: '#ffa726' },
  'banyo-temizlik': { name: '🚿 Banyo Temizliği', color: '#ab47bc' },
  'mutfak-temizlik': { name: '🍽️ Mutfak Temizliği', color: '#ef5350' },
  'camasir-urunleri': { name: '👕 Çamaşır Ürünleri', color: '#26c6da' }
};

const EvTemizligi = () => {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(subcategoryId || 'temizlik-urunleri');
  const [favorites, setFavorites] = useState(new Set());
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (subcategoryId && allImages[subcategoryId]) {
      setSelectedCategory(subcategoryId);
    }
    
    // Sepet sayısını güncelle
    updateCartCount();
  }, [subcategoryId]);

  const updateCartCount = () => {
    try {
      const sepetData = localStorage.getItem('sepet');
      if (sepetData) {
        const items = JSON.parse(sepetData);
        const totalCount = items.reduce((total, item) => {
          return total + (parseInt(item.adet) || 1);
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
    window.history.pushState({}, '', `/anne/ev-temizligi/${categoryKey}`);
  };

  const toggleFavorite = (index) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const openProductDetail = (product, index) => {
    setSelectedProduct({
      ...product,
      index,
      category: selectedCategory,
      categoryName: categories[selectedCategory].name
    });
    setIsModalOpen(true);
  };

  const closeProductDetail = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = (product, index) => {
    try {
      // Mevcut sepeti al
      const existingSepet = localStorage.getItem('sepet');
      let sepetItems = existingSepet ? JSON.parse(existingSepet) : [];

      // Ürün formatını Sepet.jsx'e uygun hale getir
      const cartItem = {
        id: `ev-temizlik-${selectedCategory}-${index}`,
        name: product.alt,
        price: product.price,
        originalPrice: product.originalPrice,
        image_url: product.filename,
        category_name: categories[selectedCategory].name,
        category: selectedCategory,
        adet: 1,
        stock: 50, // Varsayılan stok
        selectedSize: null,
        selectedColor: null
      };

      // Aynı ürün var mı kontrol et
      const existingItemIndex = sepetItems.findIndex(item => item.id === cartItem.id);

      if (existingItemIndex !== -1) {
        // Mevcut ürünün adedini artır
        sepetItems[existingItemIndex].adet = (parseInt(sepetItems[existingItemIndex].adet) || 1) + 1;
      } else {
        // Yeni ürün ekle
        sepetItems.push(cartItem);
      }

      // Sepeti localStorage'a kaydet
      localStorage.setItem('sepet', JSON.stringify(sepetItems));
      
      // Sepet sayısını güncelle
      updateCartCount();

      // Başarı mesajı göster
      const button = document.querySelector(`[data-product-index="${index}"] .add-to-cart-btn`) ||
                     document.querySelector('.modal-add-to-cart-btn');
      if (button) {
        const originalText = button.textContent;
        const originalBg = button.style.backgroundColor;
        button.textContent = 'Eklendi! ✓';
        button.style.backgroundColor = '#28a745';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = originalBg;
        }, 1500);
      }

      console.log('Sepete eklendi:', product.alt);
      console.log('Güncel sepet:', sepetItems);
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  const currentImages = allImages[selectedCategory] || allImages['temizlik-urunleri'];
  const currentCategoryInfo = categories[selectedCategory] || categories['temizlik-urunleri'];

  return (
    <div className="pasta-gallery-wrapper">
      <h2 className="gallery-title">🧽 Anne için Ev Temizliği Hediye Önerileri</h2>
      
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
        Anne → Ev Temizliği → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
          {currentCategoryInfo.name}
        </span>
      </div>

      {/* Kategori Başlığı */}
      <div className="category-header" style={{ color: currentCategoryInfo.color }}>
        {currentCategoryInfo.name} - {currentImages.length} Ürün
      </div>

      {/* Ürün Grid'i */}
      <div className="products-grid">
        {currentImages.map((product, index) => (
          <div key={index} className="product-card" data-product-index={index}>
            <div className="product-image-container">
              <img
                src={`/${product.filename}`}
                alt={product.alt}
                className="product-image"
                loading="lazy"
                onClick={() => openProductDetail(product, index)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  e.currentTarget.src =
                    'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22280%22%20height%3D%22200%22%20fill%3D%22%23e2e8f0%22/%3E%3Ctext%20x%3D%22140%22%20y%3D%22100%22%20font-size%3D%2212%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666%22%3E' + encodeURIComponent(product.filename) + '%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {/* Favori Butonu */}
              <button
                className={`favorite-btn ${favorites.has(index) ? 'active' : ''}`}
                onClick={() => toggleFavorite(index)}
              >
                <Heart size={16} fill={favorites.has(index) ? '#ff6b9d' : 'none'} />
              </button>
            </div>
            
            <div className="product-info">
              <h3 
                className="product-title" 
                onClick={() => openProductDetail(product, index)}
                style={{ cursor: 'pointer' }}
              >
                {product.alt}
              </h3>
              
              <div className="price-section">
                <span className="current-price">{product.price} TL</span>
                <span className="original-price">{product.originalPrice} TL</span>
              </div>
              
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product, index)}
              >
                <ShoppingCart size={16} />
                Sepete Ekle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Performans Bilgisi */}
      <div className="performance-info">
        ⚡ Performans: Sadece seçili kategorideki {currentImages.length} resim yükleniyor
        <br />
        📊 Toplam: {Object.values(allImages).flat().length} resim ({Object.keys(allImages).length} kategori × 10 resim)
      </div>

      {/* Ürün Detay Modal */}
      {isModalOpen && selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>×</button>
            
            <div className="modal-body">
              <div className="modal-image-section">
                <img
                  src={`/${selectedProduct.filename}`}
                  alt={selectedProduct.alt}
                  className="modal-image"
                  onError={(e) => {
                    e.currentTarget.src =
                      'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-size%3D%2216%22%20text-anchor%3D%22middle%22%20fill%3D%22%23666%22%3E' + encodeURIComponent(selectedProduct.filename) + '%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              <div className="modal-info-section">
                <div className="modal-category">
                  {selectedProduct.categoryName}
                </div>
                
                <h2 className="modal-title">{selectedProduct.alt}</h2>
                
                <div className="modal-price-section">
                  <span className="modal-current-price">{selectedProduct.price} TL</span>
                  <span className="modal-original-price">{selectedProduct.originalPrice} TL</span>
                  <span className="modal-discount">
                    %{Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)} İndirim
                  </span>
                </div>
                
                <div className="modal-description">
                  <h4>Ürün Özellikleri:</h4>
                  <ul>
                    <li>Yüksek kaliteli malzemeden üretilmiştir</li>
                    <li>Etkili temizlik performansı sağlar</li>
                    <li>Güvenli ve sağlıklı kullanım</li>
                    <li>Uzun ömürlü ve dayanıklı</li>
                    <li>Çevre dostu formül</li>
                  </ul>
                  
                  <h4>Kullanım Alanları:</h4>
                  <p>
                    Bu ürün ev temizliğinizde size büyük kolaylık sağlayacak. 
                    Pratik kullanımı ve etkili sonuçları ile temizlik işlerinizi 
                    daha keyifli hale getirir.
                  </p>
                </div>
                
                <div className="modal-actions">
                  <button
                    className={`modal-favorite-btn ${favorites.has(selectedProduct.index) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(selectedProduct.index)}
                  >
                    <Heart size={18} fill={favorites.has(selectedProduct.index) ? '#ff6b9d' : 'none'} />
                    {favorites.has(selectedProduct.index) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </button>
                  
                  <button
                    className="modal-add-to-cart-btn"
                    onClick={() => {
                      addToCart(selectedProduct, selectedProduct.index);
                      closeProductDetail();
                    }}
                  >
                    <ShoppingCart size={18} />
                    Sepete Ekle
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

export default EvTemizligi;