import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  CreditCard,
  Package,
  User,
  Tag,
  Gift,
  X,
  Check
} from 'lucide-react';
import Header2 from '../components/Header2/Header2';
import './Sepet.css';

const Sepet = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [sepetItems, setSepetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoupons, setUserCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Predefined kupon kodları
  const predefinedCoupons = {
    'KUPON25': { type: 'discount', value: 25, description: '25 TL İndirim' },
    'KUPON50': { type: 'discount', value: 50, description: '50 TL İndirim' },
    'KUPON75': { type: 'discount', value: 75, description: '75 TL İndirim' },
    'KUPON100': { type: 'discount', value: 100, description: '100 TL İndirim' },
    'KUPON200': { type: 'discount', value: 200, description: '200 TL İndirim' },
    'YUZDE10': { type: 'percentage', value: 10, description: '%10 İndirim' },
    'YUZDE15': { type: 'percentage', value: 15, description: '%15 İndirim' },
    'YUZDE20': { type: 'percentage', value: 20, description: '%20 İndirim' }
  };

  // Giriş kontrolü
  useEffect(() => {
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      
      if (!userData || isLoggedIn !== 'true') {
        navigate('/authForm', {
          state: {
            message: 'Sepetinizi görüntülemek için giriş yapmalısınız.'
          }
        });
        return;
      }
      
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        loadSepetData();
        loadUserCoupons(user.id);
      } catch (error) {
        console.error('Kullanıcı verisi parse edilemedi:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        navigate('/authForm', {
          state: {
            message: 'Oturum verisi bozuk, lütfen tekrar giriş yapın.'
          }
        });
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Kullanıcı kuponlarını yükle
  const loadUserCoupons = (userId) => {
    try {
      const storedCoupons = localStorage.getItem(`userCoupons_user_${userId}`);
      if (storedCoupons) {
        const coupons = JSON.parse(storedCoupons);
        // Sadece kullanılmamış ve süresi geçmemiş kuponlar
        const validCoupons = coupons.filter(coupon => 
          !coupon.used && new Date(coupon.expires_at) > new Date()
        );
        setUserCoupons(validCoupons);
      } else {
        setUserCoupons([]);
      }
    } catch (error) {
      console.error('Kuponlar yüklenirken hata:', error);
      setUserCoupons([]);
    }
  };

  const loadSepetData = () => {
    try {
      const sepetData = localStorage.getItem('sepet');
      if (sepetData) {
        const items = JSON.parse(sepetData);
        
        // Her item'ın adet değerini kontrol et ve düzelt
        const validatedItems = items.map(item => ({
          ...item,
          adet: isNaN(parseInt(item.adet)) || parseInt(item.adet) < 1 ? 1 : parseInt(item.adet),
          price: isNaN(parseFloat(item.price)) ? 0 : parseFloat(item.price),
          stock: isNaN(parseInt(item.stock)) ? 1 : parseInt(item.stock)
        }));
        
        setSepetItems(validatedItems);
        localStorage.setItem('sepet', JSON.stringify(validatedItems));
      } else {
        setSepetItems([]);
      }
    } catch (error) {
      console.error('Sepet verileri yüklenirken hata:', error);
      setSepetItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Kupon uygula (kod ile)
  const applyCouponCode = () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu giriniz.');
      return;
    }

    const code = couponCode.toUpperCase().trim();
    
    // Önce predefined kuponlarda ara
    if (predefinedCoupons[code]) {
      const coupon = {
        id: `code_${code}`,
        code: code,
        type: 'code',
        prize_type: predefinedCoupons[code].type,
        prize_value: predefinedCoupons[code].value,
        title: predefinedCoupons[code].description,
        description: predefinedCoupons[code].description,
        source: 'manual'
      };
      
      setAppliedCoupon(coupon);
      setCouponCode('');
      setShowCoupons(false);
      return;
    }

    // Kullanıcının çarktan kazandığı kuponlarda ara
    const userCoupon = userCoupons.find(coupon => 
      !coupon.used && 
      new Date(coupon.expires_at) > new Date() &&
      (coupon.code === code || `KUPON${coupon.prize_value}` === code)
    );

    if (userCoupon) {
      setAppliedCoupon({
        ...userCoupon,
        source: 'wheel'
      });
      setCouponCode('');
      setShowCoupons(false);
      return;
    }

    setCouponError('Geçersiz kupon kodu veya kupon süresi dolmuş!');
  };

  // Kupon uygula (listeden)
  const applyCouponFromList = (coupon) => {
    setAppliedCoupon({
      ...coupon,
      source: 'wheel'
    });
    setShowCoupons(false);
    setCouponError('');
  };

  // Kupon kaldır
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Kupon kullanıldı olarak işaretle
  const markCouponAsUsed = (couponId, userId) => {
    if (!userId) return;
    
    const storedCoupons = localStorage.getItem(`userCoupons_user_${userId}`);
    if (storedCoupons) {
      const coupons = JSON.parse(storedCoupons);
      const updatedCoupons = coupons.map(coupon => 
        coupon.id === couponId ? { ...coupon, used: true, used_at: new Date().toISOString() } : coupon
      );
      localStorage.setItem(`userCoupons_user_${userId}`, JSON.stringify(updatedCoupons));
      loadUserCoupons(userId);
    }
  };

  // Ürün adetini değiştir
  const updateQuantity = (itemIndex, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity === null || newQuantity === undefined) {
      return;
    }
    
    const quantity = parseInt(newQuantity, 10);
    
    if (isNaN(quantity) || quantity < 1) {
      return;
    }
    
    const updatedItems = [...sepetItems];
    const item = updatedItems[itemIndex];
    
    if (!item) {
      return;
    }
    
    if (quantity > item.stock) {
      alert(`Maksimum ${item.stock} adet ekleyebilirsiniz.`);
      return;
    }
    
    updatedItems[itemIndex].adet = quantity;
    setSepetItems(updatedItems);
    localStorage.setItem('sepet', JSON.stringify(updatedItems));
  };

  // Ürünü sepetten kaldır
  const removeItem = (itemIndex) => {
    const item = sepetItems[itemIndex];
    
    if (window.confirm(`${item.name} ürününü sepetten kaldırmak istediğinizden emin misiniz?`)) {
      const updatedItems = sepetItems.filter((_, index) => index !== itemIndex);
      setSepetItems(updatedItems);
      localStorage.setItem('sepet', JSON.stringify(updatedItems));
    }
  };

  // Sepeti temizle
  const clearCart = () => {
    if (window.confirm('Sepetteki tüm ürünleri kaldırmak istediğinizden emin misiniz?')) {
      setSepetItems([]);
      setAppliedCoupon(null);
      localStorage.removeItem('sepet');
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz? Sepetiniz korunacaktır.')) {
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      navigate('/authForm');
    }
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

  const handleImageError = (e) => {
    e.target.src = '/spor.jpg';
  };

  // Ara toplam hesapla
  const calculateSubTotal = () => {
    return sepetItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const adet = parseInt(item.adet) || 1;
      return total + (price * adet);
    }, 0);
  };

  // İndirim hesapla
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subTotal = calculateSubTotal();
    
    if (appliedCoupon.prize_type === 'percentage') {
      return (subTotal * appliedCoupon.prize_value) / 100;
    } else {
      // money type - sabit tutar indirimi
      return Math.min(appliedCoupon.prize_value, subTotal);
    }
  };

  // Toplam fiyat hesapla (indirim sonrası)
  const calculateTotal = () => {
    const subTotal = calculateSubTotal();
    const discount = calculateDiscount();
    return Math.max(0, subTotal - discount);
  };

  // Toplam ürün adedi
  const getTotalItems = () => {
    return sepetItems.reduce((total, item) => {
      const adet = parseInt(item.adet) || 1;
      return total + adet;
    }, 0);
  };

  // Sipariş tamamla
  const completeOrder = () => {
    if (appliedCoupon && appliedCoupon.source === 'wheel') {
      // Çarktan kazanılan kupon kullanıldı olarak işaretle
      markCouponAsUsed(appliedCoupon.id, currentUser.id);
    }
    
    alert(`Sipariş tamamlandı! 
    
Sipariş Özeti:
• Ürün Tutarı: ${calculateSubTotal().toFixed(2)} TL
${appliedCoupon ? `• İndirim (${appliedCoupon.title}): -${calculateDiscount().toFixed(2)} TL` : ''}
• Kargo: ${calculateTotal() >= 150 ? 'Ücretsiz' : '15.00 TL'}
• Toplam: ${(calculateTotal() + (calculateTotal() >= 150 ? 0 : 15)).toFixed(2)} TL

Teşekkür ederiz!`);
    
    // Sipariş sonrası temizlik
    setSepetItems([]);
    setAppliedCoupon(null);
    localStorage.removeItem('sepet');
  };

  // Kullanıcı doğrulanmadıysa loading göster
  if (!currentUser || loading) {
    return (
      <>
        <Header2 />
        <div className="sepet-container">
          <div className="sepet-loading">
            <div className="loading-spinner"></div>
            <p>Sepet yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header2 />
      <div className="sepet-container">
        
        {/* Sepet Header */}
        <div className="sepet-header">
          <div>
            <h1>
              <ShoppingCart size={28} />
              Sepetim ({getTotalItems()} ürün)
            </h1>
            <p>
              <User size={16} />
              Hoş geldin, {currentUser.username}!
            </p>
          </div>
          
          <div className="header-buttons">
            <button 
              onClick={() => navigate('/urunler')} 
              className="header-btn continue-shopping"
            >
              <Package size={16} />
              Alışverişe Devam
            </button>
            
            <button 
              onClick={handleLogout} 
              className="header-btn logout"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Sepet boşsa */}
        {sepetItems.length === 0 ? (
          <div className="sepet-bos">
            <ShoppingCart size={64} />
            <h2>Sepetiniz boş</h2>
            <p>Alışverişe başlamak için ürünleri keşfedin!</p>
            <button 
              onClick={() => navigate('/urunler')} 
              className="alisverise-basla-btn"
            >
              <Package size={20} />
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <>
            {/* Sepet içeriği */}
            <div className="sepet-items">
              {sepetItems.map((item, index) => (
                <div key={`${item.id}-${index}`} className="sepet-item">
                  <img 
                    src={getImageUrl(item.image_url)} 
                    alt={item.name}
                    onError={handleImageError}
                  />
                  
                  <div className="item-details">
                    <div>
                      <h3>{item.name}</h3>
                      {item.category_name && (
                        <p className="item-category">
                          Kategori: {item.category_name}
                        </p>
                      )}
                      {item.selectedSize && (
                        <p className="item-variants">
                          Beden: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedColor && (
                        <p className="item-variants">
                          Renk: {item.selectedColor}
                        </p>
                      )}
                    </div>
                    
                    <div className="item-controls">
                      <div className="quantity-controls">
                        <div className="quantity-selector">
                          <button 
                            onClick={() => {
                              const currentAdet = parseInt(item.adet) || 1;
                              const newQuantity = currentAdet - 1;
                              updateQuantity(index, newQuantity);
                            }}
                            disabled={(parseInt(item.adet) || 1) <= 1}
                            className="quantity-btn decrease"
                          >
                            <Minus size={16} />
                          </button>
                          
                          <span className="quantity-display">
                            {parseInt(item.adet) || 1}
                          </span>
                          
                          <button 
                            onClick={() => {
                              const currentAdet = parseInt(item.adet) || 1;
                              const newQuantity = currentAdet + 1;
                              updateQuantity(index, newQuantity);
                            }}
                            disabled={(parseInt(item.adet) || 1) >= item.stock}
                            className="quantity-btn increase"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="stock-info">
                          Stok: {item.stock} adet
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="price-info">
                          <div className="unit-price">
                            Birim: {(parseFloat(item.price) || 0).toFixed(2)} TL
                          </div>
                          <div className="total-price">
                            Toplam: {((parseFloat(item.price) || 0) * (parseInt(item.adet) || 1)).toFixed(2)} TL
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(index)}
                          className="remove-btn"
                          title="Ürünü sepetten kaldır"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kupon Bölümü */}
            <div className="kupon-bolumu">
              <h3>
                <Tag size={24} />
                İndirim Kuponları
              </h3>

              {/* Uygulanan Kupon */}
              {appliedCoupon && (
                <div className="uygulanan-kupon">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={20} style={{ color: '#155724' }} />
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#155724' }}>
                        {appliedCoupon.title}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#155724' }}>
                        İndirim: {calculateDiscount().toFixed(2)} TL
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="kupon-kaldir-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Kupon Kodu Girişi */}
              {!appliedCoupon && (
                <div className="kupon-kod-girisi">
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Kupon kodunu giriniz (örn: KUPON50)"
                      className="kupon-input"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          applyCouponCode();
                        }
                      }}
                    />
                    <button
                      onClick={applyCouponCode}
                      className="kupon-uygula-btn"
                    >
                      Uygula
                    </button>
                  </div>

                  {couponError && (
                    <div className="kupon-hata">
                      {couponError}
                    </div>
                  )}

                  {/* Kullanılabilir kupon kodları */}
                  <div className="kupon-kodlari-bilgi">
                    <strong>Test kupon kodları:</strong> KUPON25, KUPON50, KUPON75, KUPON100, KUPON200, YUZDE10, YUZDE15, YUZDE20
                  </div>
                </div>
              )}

              {/* Çarktan Kazanılan Kuponlar */}
              {userCoupons.length > 0 && !appliedCoupon && (
                <div className="carktan-kuponlar">
                  <button
                    onClick={() => setShowCoupons(!showCoupons)}
                    className="kuponlari-goster-btn"
                  >
                    <Gift size={16} />
                    Çarktan Kazandığım Kuponlar ({userCoupons.length})
                  </button>

                  {showCoupons && (
                    <div className="kupon-listesi">
                      {userCoupons.map(coupon => (
                        <div key={coupon.id} 
                             className="kupon-karti"
                             onClick={() => applyCouponFromList(coupon)}>
                          <div className="kupon-icerik">
                            <span className="kupon-emoji">💰</span>
                            <div className="kupon-deger">
                              {coupon.prize_value} TL İndirim
                            </div>
                          </div>
                          <div className="kupon-tarih">
                            Son kullanma: {new Date(coupon.expires_at).toLocaleDateString('tr-TR')}
                          </div>
                          {coupon.doubled && (
                            <div className="kupon-katli">
                              🚀 İkiye Katlandı!
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sepet Özeti */}
            <div className="sepet-ozet">
              
              {/* Sol taraf - Sepet İşlemleri */}
              <div className="sepet-actions">
                <h3>Sepet İşlemleri</h3>
                
                <button 
                  onClick={clearCart}
                  className="action-btn clear-cart"
                >
                  <Trash2 size={16} />
                  Sepeti Temizle
                </button>
                
                <button 
                  onClick={() => navigate('/home1')}
                  className="action-btn continue"
                >
                  <ArrowLeft size={16} />
                  Alışverişe Devam Et
                </button>
              </div>

              {/* Sağ taraf - Sipariş Özeti */}
              <div className="siparis-ozeti">
                <h3>Sipariş Özeti</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <div className="ozet-satir">
                    <span>Ürün Adedi:</span>
                    <span>{getTotalItems()} adet</span>
                  </div>
                  
                  <div className="ozet-satir">
                    <span>Ara Toplam:</span>
                    <span>{calculateSubTotal().toFixed(2)} TL</span>
                  </div>

                  {appliedCoupon && (
                    <div className="ozet-satir indirim">
                      <span>İndirim ({appliedCoupon.title}):</span>
                      <span>-{calculateDiscount().toFixed(2)} TL</span>
                    </div>
                  )}
                  
                  <div className="ozet-satir kargo">
                    <span>Kargo:</span>
                    <span>{calculateTotal() >= 150 ? 'Ücretsiz' : '15.00 TL'}</span>
                  </div>
                  
                  <div className="ozet-toplam">
                    <span>Toplam:</span>
                    <span>
                      {(calculateTotal() + (calculateTotal() >= 150 ? 0 : 15)).toFixed(2)} TL
                    </span>
                  </div>
                </div>
                
                {calculateTotal() < 150 && (
                  <div className="kargo-uyari">
                    Ücretsiz kargo için {(150 - calculateTotal()).toFixed(2)} TL daha alışveriş yapın!
                  </div>
                )}

                {appliedCoupon && (
                  <div className="tasarruf-uyari">
                    🎉 {calculateDiscount().toFixed(2)} TL tasarruf ettiniz!
                  </div>
                )}
                
                <button 
                  onClick={completeOrder}
                  className="checkout-btn"
                >
                  <CreditCard size={20} />
                  Siparişi Tamamla
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Sepet;