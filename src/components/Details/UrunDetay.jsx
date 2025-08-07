import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  ArrowLeft,
  Truck,
  Shield,
  RotateCcw,
  Award,
  Package,
  Palette
} from 'lucide-react';
import './UrunDetay.css';
import ProductComments from "../../pages/ProductComments/ProductComments.jsx";
import CommentSystem from '../../pages/CommentSystem.jsx';
import Header2 from '../Header2/Header2.jsx';

const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";

const UrunDetay = () => {
  const { urunId } = useParams();
  const navigate = useNavigate();
  const [urun, setUrun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adet, setAdet] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  const productSizes = ['S', 'M', 'L', 'XL'];
  const productColors = [
    { name: 'Siyah', code: '#000000' },
    { name: 'Beyaz', code: '#FFFFFF' },
    { name: 'Kırmızı', code: '#DC2626' },
    { name: 'Mavi', code: '#3B82F6' }
  ];

  // Ürün detayını getir
  useEffect(() => {
    const fetchUrun = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Ürün ID:', urunId);
        console.log('API URL:', `${API_URL}/api/products/${urunId}`);
        
        // ✅ Doğru endpoint: /api/products/:id (kategoriler değil!)
        const response = await fetch(`${API_URL}/api/products/${urunId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Hatası:', response.status, errorText);
          throw new Error(`Ürün bulunamadı (${response.status})`);
        }
        
        const data = await response.json();
        console.log('API Yanıtı:', data);
        
        // Backend'den gelen veri yapısına göre düzenle
        if (data.success && data.data) {
          setUrun(data.data);
        } else if (data.id) {
          // Direkt ürün verisi geldiyse
          setUrun(data);
        } else {
          throw new Error('Ürün verisi alınamadı');
        }
        
        console.log('Ürün detayı yüklendi:', data);
        setImageError(false);
        
      } catch (error) {
        console.error('Ürün detayı alınamadı:', error);
        setError(error.message);
        setUrun(null);
      } finally {
        setLoading(false);
      }
    };

    if (urunId) {
      fetchUrun();
    } else {
      setError('Ürün ID bulunamadı');
      setLoading(false);
    }
  }, [urunId]);

  // Favoriler kontrolü
  useEffect(() => {
    if (urun?.id) {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const favorites = new Set(JSON.parse(savedFavorites));
          setIsFavorite(favorites.has(urun.id));
        } catch (error) {
          console.error('Favoriler okunamadı:', error);
        }
      }
    }
  }, [urun?.id]);

  const handleAdetChange = (type) => {
    const currentStock = urun.stock || 999;
    if (type === 'increase' && adet < currentStock) {
      setAdet(adet + 1);
    } else if (type === 'decrease' && adet > 1) {
      setAdet(adet - 1);
    }
  };

  const toggleFavorite = () => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      const favorites = savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
      
      if (favorites.has(urun.id)) {
        favorites.delete(urun.id);
        setIsFavorite(false);
        console.log('Favorilerden çıkarıldı:', urun.name);
      } else {
        favorites.add(urun.id);
        setIsFavorite(true);
        console.log('Favorilere eklendi:', urun.name);
      }
      
      localStorage.setItem('favorites', JSON.stringify([...favorites]));
    } catch (error) {
      console.error('Favori işlemi hatası:', error);
    }
  };

  const sepeteEkle = () => {
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    console.log('Sepete ekleme başlıyor...', { userData, isLoggedIn });
    
    if (!userData || isLoggedIn !== 'true') {
      console.log('Kullanıcı giriş yapmamış, AuthForm sayfasına yönlendiriliyor...');
      navigate('/authForm', {
        state: {
          message: `${urun.name} ürününü (${adet} adet) satın almak için giriş yapmalısınız.`,
          product: urun,
          quantity: adet
        }
      });
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      console.log('Kullanıcı doğrulandı:', user.username || user.email);
      
      const currentCart = JSON.parse(localStorage.getItem('sepet')) || [];
      console.log('Mevcut sepet:', currentCart);
      
      // Aynı ürün, boyut ve renk kombinasyonunu ara
      const existingItemIndex = currentCart.findIndex(item => 
        item.id === urun.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
      );
      
      if (existingItemIndex !== -1) {
        // Mevcut ürünün adedini artır
        const newQuantity = currentCart[existingItemIndex].adet + adet;
        const currentStock = urun.stock || 999;
        
        if (newQuantity > currentStock) {
          alert(`Maksimum ${currentStock} adet ekleyebilirsiniz. Sepetteki mevcut adet: ${currentCart[existingItemIndex].adet}`);
          currentCart[existingItemIndex].adet = currentStock;
        } else {
          currentCart[existingItemIndex].adet = newQuantity;
        }
        console.log('Mevcut ürün güncellendi:', currentCart[existingItemIndex]);
        
      } else {
        // Yeni ürün ekle
        const sepetItem = {
          id: urun.id,
          name: urun.name || urun.title,
          price: parseFloat(urun.price) || 0,
          adet: adet,
          image_url: urun.image_url || urun.image,
          category_name: urun.category_name || urun.category,
          selectedSize: selectedSize || 'Standart',
          selectedColor: selectedColor || 'Varsayılan',
          stock: urun.stock || 999,
          addedDate: new Date().toISOString()
        };
        currentCart.push(sepetItem);
        console.log('Yeni ürün sepete eklendi:', sepetItem);
      }
      
      localStorage.setItem('sepet', JSON.stringify(currentCart));
      console.log('Sepet localStorage\'a kaydedildi:', currentCart);
      
      alert(`✅ ${urun.name || urun.title} sepete eklendi! (${adet} adet)\n\nSepet sayfasına yönlendiriliyorsunuz...`);
      
      setTimeout(() => {
        navigate('/sepet');
      }, 1000);
      
    } catch (error) {
      console.error('Sepete ekleme hatası:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/authForm', {
        state: {
          message: 'Oturum süresi dolmuş, lütfen tekrar giriş yapın.'
        }
      });
    }
  };

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

  const handleImageError = (e) => {
    console.log('Resim yüklenemedi:', e.target.src);
    if (!imageError) {
      setImageError(true);
      e.target.src = '/spor.jpg';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header2 />
        <div className="urun-detay-container">
          <div className="loading-state flex items-center justify-center py-16">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-600">Ürün detayları yükleniyor...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !urun) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header2 />
        <div className="urun-bulunamadi container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-600 mb-6">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <p className="text-sm text-gray-500 mb-6">Hata: {error}</p>
          <Link to="/urunler" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <ArrowLeft size={18} />
            Ürünlere Geri Dön
          </Link>
        </div>
      </div>
    );
  }

  const eskiFiyat = urun.discount > 0 
    ? (urun.price / (1 - urun.discount / 100)).toFixed(2)
    : null;

  return (
    <>
    <Header2></Header2>
      <div className="urun-detay-container">
        <nav className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span> / </span>
          <Link to="/">Ürünler</Link>
          <span> / </span>
          {urun.category_name && (
            <>
              <span>{urun.category_name}</span>
              <span> / </span>
            </>
          )}
          <span>{urun.name}</span>
        </nav>

        <div className="urun-detay-content">
       
          <div className="urun-resimler">
            <div className="ana-resim">
              <img 
                src={getImageUrl(urun.image_url)}
                alt={urun.name}
                onError={handleImageError}
                onLoad={() => console.log('Resim başarıyla yüklendi:', getImageUrl(urun.image_url))}
              />
              {urun.stock <= 0 && (
                <div className="stok-yok-overlay">Stokta Yok</div>
              )}
              <div className="hizli-teslimat-badge">
                <Truck size={16} />
                Hızlı Teslimat
              </div>
            </div>
          </div>

        
          <div className="urun-bilgileri">
            <div className="urun-baslik">
             
              <h1>{urun.name}</h1>
              {urun.category_name && (
                <p className="marka-kategori">{urun.category_name}</p>
              )}
            </div>

            
         

            {/* Fiyat */}
            <div className="fiyat-bolumu">
              <div className="fiyat-container">
                {eskiFiyat && (
                  <span className="eski-fiyat">{eskiFiyat} TL</span>
                )}
                <span className="guncel-fiyat">{urun.price} TL</span>
                {urun.discount > 0 && (
                  <span className="indirim-orani">
                    %{urun.discount} İndirim
                  </span>
                )}
              </div>
             
            </div>

            

   
          


            {urun.description && (
              <div className="urun-aciklama">
                <p>{urun.description}</p>
              </div>
            )}

            {/* Adet Seçimi */}
            {urun.stock > 0 && (
              <div className="adet-secimi">
                <h3>Adet:</h3>
                <div className="adet-kontrol">
                  <button 
                    onClick={() => handleAdetChange('decrease')}
                    disabled={adet <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{adet}</span>
                  <button 
                    onClick={() => handleAdetChange('increase')}
                    disabled={adet >= urun.stock}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Sepete Ekle */}
            <div className="sepet-bolumu">
              <div className="action-buttons">
                <button className="simdi-al-btn">
                  Şimdi Al
                </button>
                <button 
                  className={`sepete-ekle-btn ${urun.stock <= 0 ? 'disabled' : ''}`}
                  onClick={sepeteEkle}
                  disabled={urun.stock <= 0}
                >
                  <ShoppingCart size={18} />
                  {urun.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
                
                <button 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={toggleFavorite}
                >
                  <Heart size={18} fill={isFavorite ? '#ff4757' : 'none'} />
                </button>
              </div>
              
              <div className="stok-durumu">
                {urun.stock > 0 ? (
                  <span className="stokta-var">✓ Stokta Var ({urun.stock} adet) - Hızlı Teslimat</span>
                ) : (
                  <span className="stokta-yok">✗ Bu ürün şu anda stokta bulunmuyor</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgiler */}
        <div className="alt-bilgiler">
          <div className="ozellik-kartlari">
            <div className="ozellik-karti">
              <Truck size={24} />
              <div>
                <h4>Ücretsiz Kargo</h4>
                <p>150₺ ve üzeri alışverişlerde</p>
              </div>
            </div>
            
            <div className="ozellik-karti">
              <RotateCcw size={24} />
              <div>
                <h4>Kolay İade</h4>
                <p>14 gün içinde ücretsiz iade</p>
              </div>
            </div>
            
            <div className="ozellik-karti">
              <Shield size={24} />
              <div>
                <h4>Garanti</h4>
                <p>2 yıl resmi distribütör garantisi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Geri Dön Butonu */}
        <div className="geri-don-container">
          <button 
            className="geri-don-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Geri Dön
          </button>
          <ProductComments productId={urun.id} />
        </div>
      </div>
      <CommentSystem></CommentSystem>
      
    </>
  );
};

export default UrunDetay;