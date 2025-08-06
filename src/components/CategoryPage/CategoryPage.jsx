import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  TrendingUp,
  Package
} from 'lucide-react';
import './CategoryPages.css';
import Header2 from '../Header2/Header2.jsx';

const CategoryPage = () => {
  const { categorySlug, subCategorySlug } = useParams();
  const navigate = useNavigate();
  
  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  
  // HobiEdin'den eklenen state'ler
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  // Kullanıcı ve sepet verilerini yükle
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

    // Sepet verilerini yükle - UrunDetay formatında
    const cartData = localStorage.getItem('sepet');
    if (cartData) {
      try {
        const rawCart = JSON.parse(cartData);
        console.log('Yüklenen sepet verisi:', rawCart);
        setCart(rawCart);
      } catch (error) {
        console.error('Sepet verisi okunamadı:', error);
        setCart([]);
      }
    }
  }, []);

  // Ürünleri kategoriye göre çek - DÜZELTİLMİŞ VERSİYON
useEffect(() => {
  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      
      if (subCategorySlug) {
        // Alt kategori henüz desteklenmiyor
        setError('Alt kategori sistemi henüz aktif değil');
        setLoading(false);
        return;
      }
      
      // Ana kategori sayfası - slug ile API çağrısı
      const apiUrl = `http://localhost:5001/api/categories/${categorySlug}/products?sortBy=${sortBy}&priceMin=${priceRange[0]}&priceMax=${priceRange[1]}`;
      
      console.log('API çağrısı yapılıyor:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Hatası:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Yanıtı:', data);
      
      if (data.success) {
        setCategoryData(data.data);
        setProducts(data.data.products || []);
      } else {
        throw new Error(data.error || 'Veriler alınamadı');
      }
      
      setError(null);
    } catch (error) {
      console.error('Kategori verileri alınamadı:', error);
      setError(error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (categorySlug) {
    fetchCategoryData();
  }
}, [categorySlug, subCategorySlug, sortBy, priceRange]);

  // HobiEdin'den eklenen sepete ekleme fonksiyonu
  const addToCart = (product, event) => {
    // Event bubbling'i durdur (kart tıklamasını engellemek için)
    event.stopPropagation();
    event.preventDefault();

    if (!user) {
      alert('Sepete eklemek için giriş yapmalısınız!');
      return;
    }

    if (product.stock <= 0) {
      alert('Bu ürün stokta yok!');
      return;
    }

    try {
      // Mevcut sepeti al
      const currentCart = JSON.parse(localStorage.getItem('sepet')) || [];
      console.log('Mevcut sepet:', currentCart);
      
      // Aynı ürün sepette var mı kontrol et
      const existingItemIndex = currentCart.findIndex(item => 
        item.id === product.id
      );
      
      if (existingItemIndex !== -1) {
        // Ürün zaten sepette varsa, adetini artır
        const newQuantity = currentCart[existingItemIndex].adet + 1;
        
        // Stok kontrolü
        if (newQuantity > product.stock) {
          alert(`Maksimum ${product.stock} adet ekleyebilirsiniz. Sepetteki mevcut adet: ${currentCart[existingItemIndex].adet}`);
          currentCart[existingItemIndex].adet = product.stock;
        } else {
          currentCart[existingItemIndex].adet = newQuantity;
        }
        console.log('Mevcut ürün güncellendi:', currentCart[existingItemIndex]);
        
      } else {
        // Yeni ürün olarak sepete ekle - UrunDetay formatında
        const sepetItem = {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price), // Number olarak kaydet
          adet: 1,
          image_url: product.image_url,
          category_name: product.category_name,
          stock: product.stock,
          addedDate: new Date().toISOString()
        };
        currentCart.push(sepetItem);
        console.log('Yeni ürün sepete eklendi:', sepetItem);
      }
      
      // Güncellenmiş sepeti localStorage'a kaydet
      localStorage.setItem('sepet', JSON.stringify(currentCart));
      console.log('Sepet localStorage\'a kaydedildi:', currentCart);
      
      // State'i güncelle
      setCart(currentCart);
      
      // Başarı mesajı
      const notification = document.createElement('div');
      notification.className = 'cart-notification';
      notification.textContent = `${product.name} sepete eklendi!`;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      alert('Sepete eklenirken bir hata oluştu!');
    }
  };

  // Favorileri kontrol et
  const isFavorite = (productId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(productId);
  };

  // Favorilere ekle/çıkar
  const toggleFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    
    if (favorites.includes(productId)) {
      newFavorites = favorites.filter(id => id !== productId);
    } else {
      newFavorites = [...favorites, productId];
    }
    
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setProducts(prev => [...prev]); // Re-render için
  };

  // Resim URL'sini düzenle
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/spor.jpg';
    
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

  if (loading) {
    return (
      <>
        <Header2 />
        <div className="category-page-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Kategori yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !categoryData) {
    return (
      <>
        <Header2 />
        <div className="category-page-container">
          <div className="error-state">
            <h2>Kategori Bulunamadı</h2>
            <p>Aradığınız kategori mevcut değil veya kaldırılmış olabilir.</p>
            <button 
              className="geri-don-btn"
              onClick={() => navigate('/')}
            >
              <ArrowLeft size={18} />
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </>
    );
  }

  // Sayfa başlığı ve açıklaması
  const pageTitle = subCategorySlug 
    ? categoryData.categoryInfo?.subcategory_name || 'Alt Kategori'
    : categoryData.category?.name || 'Kategori';
    
  const pageDescription = subCategorySlug
    ? categoryData.categoryInfo?.subcategory_description || 'Alt kategori ürünleri'
    : categoryData.category?.description || 'Kategori ürünleri';

  return (
    <>
      <Header2 />
      <div className="category-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span> / </span>
          <Link to={`/kategori/${categorySlug}`}>
            {categoryData.category?.name || categoryData.categoryInfo?.category_name}
          </Link>
          {subCategorySlug && (
            <>
              <span> / </span>
              <span>{categoryData.categoryInfo?.subcategory_name}</span>
            </>
          )}
        </nav>

        {/* Kategori Header */}
        <div className="category-header">
          <div className="category-title">
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
          <div className="category-stats">
            <span>{products.length} ürün</span>
          </div>
        </div>

        {/* Alt Kategoriler - Sadece ana kategori sayfasında göster */}
        {!subCategorySlug && categoryData.subCategories && categoryData.subCategories.length > 0 && (
          <div className="subcategories-section">
           
       
             
              
              
          </div>
        )}

        {/* Filtreler ve Sıralama */}
        <div className="filters-section">
          <div className="filters-top">
            <button 
              className="filters-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filtreler
            </button>
            
            <div className="view-controls">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="newest">En Yeni</option>
                <option value="price-low">Fiyat (Düşük-Yüksek)</option>
                <option value="price-high">Fiyat (Yüksek-Düşük)</option>
                <option value="popular">En Popüler</option>
                <option value="rating">En Çok Beğenilen</option>
              </select>
              
              <div className="view-mode-buttons">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 size={18} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filtre Paneli */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <h4>Fiyat Aralığı</h4>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  />
                  <span>0 - {priceRange[1]} TL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ürünler Grid/List */}
        <div className={`productss-section ${viewMode}`}>
          {products.length === 0 ? (
            <div className="no-productss">
              <p>Bu kategoride henüz ürün bulunmuyor.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'productss-grid' : 'productss-list'}>
              {products.map((product) => (
                <div key={product.id} className="productt-card">
                  <Link to={`/urun/${product.id}`} className="productt-link">
                    <div className="productt-image">
                      <img 
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = '/spor.jpg';
                        }}
                      />
                      {product.discount > 0 && (
                        <div className="discount-badge">
                          %{product.discount} İndirim
                        </div>
                      )}
                      {product.stock <= 0 && (
                        <div className="stock-badge">Stokta Yok</div>
                      )}
                    </div>
                    
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      {product.category_name && (
                        <p className="product-category">{product.category_name}</p>
                      )}
                      
                      <div className="product-rating">
                        
                        <span>({product.rating || 4.3})</span>
                      </div>
                      
                      <div className="product-price">
                        {product.discount > 0 && (
                          <span className="old-price">
                            {((parseFloat(product.price) || 0) / (1 - (parseFloat(product.discount) || 0) / 100)).toFixed(2)} TL
                          </span>
                        )}
                        <span className="current-price">{(parseFloat(product.price) || 0).toFixed(2)} TL</span>
                      </div>
                      
                      {viewMode === 'list' && product.description && (
                        <p className="product-description">
                          {product.description.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  <div className="product-actions">
                    <button 
                      className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(product.id, e)}
                    >
                      <Heart 
                        size={18} 
                        fill={isFavorite(product.id) ? '#ff4757' : 'none'} 
                      />
                    </button>
                    
                    <button 
                      className="quick-add-btn"
                      disabled={product.stock <= 0}
                      onClick={(e) => addToCart(product, e)}
                    >
                      <ShoppingCart size={18} />
                      {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary - HobiEdin'den eklendi */}
        {cart.length > 0 && (
          <div className="cart-summary">
            <div className="cart-info">
              <span>🛒 Sepette {cart.length} ürün</span>
              <span>
                Toplam: ₺{cart.reduce((total, item) => {
                  const itemPrice = parseFloat(item.price) || 0;
                  const itemQuantity = parseInt(item.adet || item.quantity) || 0;
                  return total + (itemPrice * itemQuantity);
                }, 0).toFixed(2)}
              </span>
            </div>
            <button 
              onClick={() => navigate('/sepet')}
              className="go-to-cart-btn"
            >
              Sepete Git →
            </button>
          </div>
        )}

        {/* Geri Dön */}
        <div className="back-button-container">
          <button 
            className="geri-don-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Geri Dön
          </button>
        </div>
      </div>
    </>
  );
};

export default CategoryPage;