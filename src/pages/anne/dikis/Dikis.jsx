import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './Dikis.css';

import { API_URL } from '../../config/api';
const response = await fetch(`${API_URL}/api/categories`);


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
    

    fetchDikisProducts();
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

  const fetchDikisProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Dikiş ürünleri API çağrısı başlıyor...');
      
     
      const dikisProductIds = [
        432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 
        442, 443, 444, 445, 446, 447, 448, 449, 450
      ];
      
      let fetchedProducts = [];
      
      try {
        console.log('Tüm ürünler çekiliyor...');
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API yanıtı:', data);
          
          let allProducts = [];
          
        
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
          console.log('Aranacak dikiş ID\'leri:', dikisProductIds.length, 'adet');
          
     
          fetchedProducts = allProducts.filter(product => {
            const productId = parseInt(product.id);
            const isDikisProduct = dikisProductIds.includes(productId);
            
            if (isDikisProduct) {
              console.log('✅ Dikiş ürünü bulundu:', product.id, '-', product.name);
            }
            
            return isDikisProduct;
          });
          
          console.log(`🎯 ID Filtresi Sonucu: ${fetchedProducts.length}/${dikisProductIds.length} dikiş ürünü bulundu`);
          
   
          const foundIds = fetchedProducts.map(p => parseInt(p.id));
          const missingIds = dikisProductIds.filter(id => !foundIds.includes(id));
          if (missingIds.length > 0) {
            console.warn('⚠️ Bulunamayan dikiş ürünü ID\'leri:', missingIds);
          }
          
  
          fetchedProducts = fetchedProducts.map(product => ({
            ...product,
            image_url: fixImageUrl(product.image_url)
          }));
          
     
          fetchedProducts.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          
          console.log('Filtrelenmiş ve sıralanmış dikiş ürünleri:', fetchedProducts.slice(0, 5).map(p => ({
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
        setError('Belirtilen ID\'lerde dikiş ürünü bulunamadı. Veritabanını kontrol edin.');
      } else {
        console.log(`🎉 ${fetchedProducts.length} dikiş ürünü başarıyla yüklendi`);
      }
      
    } catch (error) {
      console.error('fetchDikisProducts genel hatası:', error);
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
   
      const existingSepet = localStorage.getItem('sepet');
      let sepetItems = existingSepet ? JSON.parse(existingSepet) : [];

      
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


      const existingItemIndex = sepetItems.findIndex(item => item.id === cartItem.id);

      if (existingItemIndex !== -1) {
      
        sepetItems[existingItemIndex].adet = (parseInt(sepetItems[existingItemIndex].adet) || 1) + 1;
        sepetItems[existingItemIndex].quantity = sepetItems[existingItemIndex].adet;
      } else {
  
        sepetItems.push(cartItem);
      }

    
      localStorage.setItem('sepet', JSON.stringify(sepetItems));
      

      updateCartCount();


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

  
  const getFilteredProducts = () => {
    if (!products || products.length === 0) return [];
    
    console.log('Filtreleme başlıyor...', selectedCategory, 'Toplam ürün:', products.length);
    
    let filteredProducts = [];
    
    switch (selectedCategory) {
      case 'dikiş-makineleri':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('makine') || 
                 name.includes('dikiş') ||
                 name.includes('dikis') ||
                 desc.includes('makine') ||
                 desc.includes('dikiş');
        });
        break;
        
      case 'kumaslar':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('kumaş') || 
                 name.includes('kumash') ||
                 name.includes('bez') ||
                 name.includes('pamuk') ||
                 name.includes('iplik') ||
                 desc.includes('kumaş') ||
                 desc.includes('bez');
        });
        break;
        
      case 'iplik-makara':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('iplik') || 
                 name.includes('makara') ||
                 name.includes('makrome') ||
                 name.includes('örgü') ||
                 name.includes('orgu') ||
                 desc.includes('iplik') ||
                 desc.includes('makara');
        });
        break;
        
      case 'dikiş-aletleri':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('makas') || 
                 name.includes('iğne') ||
                 name.includes('igne') ||
                 name.includes('cetvel') ||
                 name.includes('ölçü') ||
                 name.includes('olcu') ||
                 name.includes('kesim') ||
                 desc.includes('makas') ||
                 desc.includes('kesim');
        });
        break;
        
      case 'fermuar-dugme':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('fermuar') || 
                 name.includes('düğme') ||
                 name.includes('dugme') ||
                 name.includes('düğmeler') ||
                 name.includes('dugmeler') ||
                 name.includes('metal') ||
                 name.includes('plastik') ||
                 desc.includes('fermuar') ||
                 desc.includes('düğme');
        });
        break;
        
      case 'nakis-malzemeleri':
        filteredProducts = products.filter(p => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          return name.includes('nakış') || 
                 name.includes('nakis') ||
                 name.includes('kasak') ||
                 name.includes('süsleme') ||
                 name.includes('susleme') ||
                 name.includes('dekoratif') ||
                 desc.includes('nakış') ||
                 desc.includes('süsleme');
        });
        break;
        
      default:
     
        filteredProducts = products;
    }
    
    console.log(`${selectedCategory} kategorisi için ${filteredProducts.length} ürün bulundu`);
    
 
    if (filteredProducts.length === 0) {
      console.log('Spesifik filtre boş, tüm dikiş ürünlerini gösteriyor');
      filteredProducts = products.slice(0, 15);
    }
    
    return filteredProducts;
  };

  const currentProducts = getFilteredProducts();
  const currentCategoryInfo = categories[selectedCategory] || categories['dikiş-makineleri'];


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

 
  if (error && products.length === 0) {
    return (
      <div className="pasta-gallery-wrapper">
        <div className="error-message">
          <h2>❌ Hata</h2>
          <p>{error}</p>
          <div className="error-details">
            <p>🔍 Kontrol edilecekler:</p>
          
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

   
      <div className="breadcrumb">
        Anne → Dikiş Malzemeleri → <span style={{ color: currentCategoryInfo.color, fontWeight: 'bold' }}>
          {currentCategoryInfo.name}
        </span>
      </div>

 
      <div className="category-header" style={{ color: currentCategoryInfo.color }}>
        {currentCategoryInfo.name} - {currentProducts.length} Ürün
        {user && <span className="user-welcome"> | Hoş geldin, <strong>{user.username}</strong>!</span>}
      </div>

     
      
      
      {currentProducts.length === 0 ? (
        <div className="no-products">
          <div className="no-products-icon">🪡</div>
          <h3>Bu kategoride henüz ürün bulunmuyor</h3>
          <p>Toplam {products.length} dikiş ürünü veritabanında mevcut ama "{currentCategoryInfo.name}" kategorisinde ürün bulunamadı.</p>
          <p>Diğer kategorileri kontrol edebilir veya daha sonra tekrar bakabilirsiniz.</p>
          <button onClick={fetchDikisProducts} className="refresh-btn">
            🔄 Ürünleri Yenile
          </button>
        </div>
      ) : (
     
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