
import React, { useState, useEffect } from 'react';
import { Star, User, LogOut, AlertTriangle, Clock, RotateCw, ShoppingCart } from 'lucide-react';

const WheelComponent = () => {
  // Test için farklı kullanıcılar
  const testUsers = [
    { id: 1, username: 'TestUser1', name: 'Test Kullanıcı 1' },
    { id: 2, username: 'TestUser2', name: 'Test Kullanıcı 2' },
    { id: 3, username: 'TestUser3', name: 'Test Kullanıcı 3' }
  ];
  
  const [currentUser, setCurrentUser] = useState(testUsers[0]);
  
  const [wheelStatus, setWheelStatus] = useState({
    canSpin: true,
    streak: 0,
    longestStreak: 0,
    activePrizes: { count: 0, totalValue: 0 },
    wheelMode: 'normal',
    nextSpinDate: null,
    lastSpinDate: null,
    loading: false
  });

  const [userCoupons, setUserCoupons] = useState([]);
  const [error, setError] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showDoubleGame, setShowDoubleGame] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [isDoubleGameActive, setIsDoubleGameActive] = useState(false);
  const [currentSpinId, setCurrentSpinId] = useState(null);

  // Yüksek indirimli ödüller - daha yüksek yüzdeler
  const prizes = [
    { id: 1, text: '50 TL İndirim', icon: '💰', color: '#e74c3c', textColor: '#fff', chance: 25, type: 'discount', value: 50 },
    { id: 2, text: '100 TL İndirim', icon: '💎', color: '#9b59b6', textColor: '#fff', chance: 20, type: 'discount', value: 100 },
    { id: 3, text: '75 TL İndirim', icon: '🎁', color: '#3498db', textColor: '#fff', chance: 20, type: 'discount', value: 75 },
    { id: 4, text: '25 TL İndirim', icon: '🎯', color: '#27ae60', textColor: '#fff', chance: 15, type: 'discount', value: 25 },
    { id: 5, text: '200 TL İndirim', icon: '⭐', color: '#f1c40f', textColor: '#333', chance: 10, type: 'discount', value: 200 },
    { id: 6, text: 'Tekrar Çevir', icon: '🔄', color: '#f39c12', textColor: '#fff', chance: 10, type: 'try_again', value: 0 }
  ];

  // Haftada bir kez kontrolü - KULLANICI BAZLI
  const checkWeeklyLimit = (userId) => {
    const lastSpin = localStorage.getItem(`lastSpin_user_${userId}`);
    if (!lastSpin) return true;
    
    const lastSpinDate = new Date(lastSpin);
    const now = new Date();
    const diffTime = Math.abs(now - lastSpinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 7; // 7 gün geçmiş mi?
  };

  // Kullanıcı kuponlarını yükle - KULLANICI BAZLI
  const loadUserCoupons = (userId) => {
    const storedCoupons = localStorage.getItem(`userCoupons_user_${userId}`);
    if (storedCoupons) {
      setUserCoupons(JSON.parse(storedCoupons));
    } else {
      setUserCoupons([]);
    }
  };

  // Kupon kaydet - KULLANICI BAZLI
  const saveCoupon = (prize, userId) => {
    const newCoupon = {
      id: Date.now(),
      userId: userId,
      prize_type: 'money',
      prize_value: prize.value,
      title: prize.text,
      description: `${prize.value} TL indirim kuponu`,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 gün
      used: false,
      doubled: prize.doubled || false
    };

    const currentCoupons = JSON.parse(localStorage.getItem(`userCoupons_user_${userId}`) || '[]');
    const updatedCoupons = [...currentCoupons, newCoupon];
    setUserCoupons(updatedCoupons);
    localStorage.setItem(`userCoupons_user_${userId}`, JSON.stringify(updatedCoupons));
  };

  // Kullanıcı değiştiğinde verileri yükle
  useEffect(() => {
    loadUserCoupons(currentUser.id);
    const canSpin = checkWeeklyLimit(currentUser.id);
    setWheelStatus(prev => ({ 
      ...prev, 
      canSpin,
      lastSpinDate: localStorage.getItem(`lastSpin_user_${currentUser.id}`)
    }));
    
    // Rotation'ı sıfırla (opsiyonel)
    setRotation(0);
    setShowResult(false);
    setShowDoubleGame(false);
    setWonPrize(null);
    setError(null);
  }, [currentUser.id]);

  const handleUserChange = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('Çıkış yapılıyor...');
  };

  const spinWheel = () => {
    if (!checkWeeklyLimit(currentUser.id) || spinning) {
      setError('Bu kullanıcı haftada sadece bir kez çark çevirebilir!');
      return;
    }
    
    setError(null);
    setSpinning(true);
    const randomRotation = Math.floor(Math.random() * 360) + 1440;
    setRotation(prev => prev + randomRotation);
    
    setTimeout(() => {
      setSpinning(false);
      
      // Ödül seçimi - gerçekçi olasılıklar
      const random = Math.random() * 100;
      let cumulativeChance = 0;
      let selectedPrize = null;
      
      for (const prize of prizes) {
        cumulativeChance += prize.chance;
        if (random <= cumulativeChance) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = prizes[prizes.length - 1]; // Fallback
      }
      
      setWonPrize(selectedPrize);
      
      // Son çevirme tarihini KULLANICI BAZLI kaydet
      localStorage.setItem(`lastSpin_user_${currentUser.id}`, new Date().toISOString());
      setWheelStatus(prev => ({ 
        ...prev, 
        canSpin: false,
        lastSpinDate: new Date().toISOString()
      }));
      
      // Tekrar çevir dışındaki ödüller için çift-tek oyunu sun
      if (selectedPrize.type !== 'try_again') {
        setShowDoubleGame(true);
      } else {
        // Tekrar çevir ise direkt sonuç göster ve çevirme hakkını geri ver
        setWheelStatus(prev => ({ ...prev, canSpin: true }));
        setShowResult(true);
      }
    }, 4000);
  };

  const resetForTest = () => {
    // Test için MEVCUT KULLANICININ son çevirme tarihini sıfırla
    localStorage.removeItem(`lastSpin_user_${currentUser.id}`);
    setWheelStatus(prev => ({ ...prev, canSpin: true }));
    setError(null);
  };

  const playDoubleGame = (choice) => {
    setIsDoubleGameActive(true);
    
    setTimeout(() => {
      const randomNumber = Math.floor(Math.random() * 10) + 1;
      const isEven = randomNumber % 2 === 0;
      const won = (choice === 'even' && isEven) || (choice === 'odd' && !isEven);
      
      if (won) {
        const doubledPrize = {
          ...wonPrize,
          doubled: true,
          value: wonPrize.value * 2,
          text: `${wonPrize.value * 2} TL İndirim`,
          doubleGameResult: `Sayı: ${randomNumber} (${isEven ? 'Çift' : 'Tek'}) - Kazandın! İndirim 2 katına çıktı! 🎉`
        };
        setWonPrize(doubledPrize);
        saveCoupon(doubledPrize, currentUser.id);
      } else {
        const regularPrize = {
          ...wonPrize,
          doubled: false,
          doubleGameResult: `Sayı: ${randomNumber} (${isEven ? 'Çift' : 'Tek'}) - Kaybettin ama ödülün korundu!`
        };
        setWonPrize(regularPrize);
        saveCoupon(regularPrize, currentUser.id);
      }
      
      setIsDoubleGameActive(false);
      setShowDoubleGame(false);
      setShowResult(true);
    }, 3000);
  };

  const closeResult = () => {
    setShowResult(false);
    setWonPrize(null);
  };

  const goToCart = () => {
    closeResult();
    // Sepete gitmeden önce kuponları göster
    alert(`🎉 Tebrikler! ${userCoupons.length} adet kuponun var!\n\nKuponların:\n${userCoupons.map(c => `• ${c.title} (${c.prize_value} TL)`).join('\n')}\n\nSepet sayfasında kuponlarını kullanabilirsin!`);
  };

  const getNextSpinDate = () => {
    const lastSpin = localStorage.getItem(`lastSpin_user_${currentUser.id}`);
    if (!lastSpin) return null;
    
    const lastSpinDate = new Date(lastSpin);
    const nextSpin = new Date(lastSpinDate);
    nextSpin.setDate(nextSpin.getDate() + 7);
    return nextSpin;
  };


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #364db5ff 0%, #2b56a4ff 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h1 style={{
              fontSize: '3rem',
              margin: '0 0 10px 0',
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '15px'
            }}>
              <Star size={48} color="#f1c40f" />
              Şans Çarkı
              <Star size={48} color="#f1c40f" />
            </h1>
            <p style={{
              fontSize: '1.3rem',
              margin: '0',
              opacity: '0.9',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Haftada bir kez çevir, büyük indirimler kazan!
            </p>
          </div>

          {currentUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              background: 'rgba(255,255,255,0.1)',
              padding: '10px 20px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 
                  
               
                  
                  
                </div>
                {wheelStatus && (
                  <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>
                    Streak: {wheelStatus.streak} 🔥
                  </div>
                )}
              </div>
             
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(231, 76, 60, 0.9)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '1rem'
          }}>
            <AlertTriangle size={20} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                marginLeft: 'auto',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Kullanıcı Durumu */}
        {wheelStatus && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                {wheelStatus.canSpin ? '✅' : '⏰'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Çark Durumu</div>
              <div style={{ fontWeight: 'bold', color: wheelStatus.canSpin ? '#27ae60' : '#e74c3c' }}>
                {wheelStatus.canSpin ? 'Çevirebilirsin!' : 'Haftada 1 kez'}
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🎫</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Aktif Kuponlar</div>
              <div style={{ fontWeight: 'bold', color: '#9b59b6' }}>
                {userCoupons.length} adet ({userCoupons.reduce((sum, c) => sum + c.prize_value, 0)} TL)
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔥</div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Ardışık Hafta</div>
              <div style={{ fontWeight: 'bold', color: '#f39c12' }}>
                {wheelStatus.streak} / {wheelStatus.longestStreak} (En yüksek)
              </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                {wheelStatus.wheelMode === 'birthday' ? '🎂' : 
                 wheelStatus.wheelMode === 'friday' ? '🎉' :
                 wheelStatus.wheelMode === 'streak' ? '⭐' : '🎯'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>Çark Modu</div>
              <div style={{ fontWeight: 'bold', color: '#3498db' }}>
                Yüksek İndirim Modu
              </div>
            </div>
          </div>
        )}

        {/* Ana İçerik */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px'
        }}>
          {/* Çark Container */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Pointer */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              zIndex: 10,
              fontSize: '2rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}>
              🔻
            </div>

            {/* Çark SVG */}
            <div style={{
              position: 'relative',
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}>
              <svg width="400" height="400" viewBox="0 0 400 400">
                <defs>
                  <radialGradient id="centerGradient">
                    <stop offset="0%" stopColor="#f1c40f" />
                    <stop offset="100%" stopColor="#f39c12" />
                  </radialGradient>
                  {prizes.map((prize, index) => (
                    <linearGradient key={index} id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={prize.color} />
                      <stop offset="100%" stopColor={prize.color} stopOpacity="0.8" />
                    </linearGradient>
                  ))}
                </defs>
                
                {/* Outer ring */}
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="none"
                  stroke="#2c3e50"
                  strokeWidth="8"
                />
                
                {/* Inner circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="20"
                  fill="#2c3e50"
                />
                
                {/* Segments */}
                {prizes.map((prize, index) => {
                  const segmentAngle = 360 / prizes.length;
                  const startAngle = (index * segmentAngle) - (segmentAngle / 2);
                  const endAngle = startAngle + segmentAngle;
                  
                  const startAngleRad = (startAngle * Math.PI) / 180;
                  const endAngleRad = (endAngle * Math.PI) / 180;
                  
                  const x1 = 200 + 180 * Math.cos(startAngleRad);
                  const y1 = 200 + 180 * Math.sin(startAngleRad);
                  const x2 = 200 + 180 * Math.cos(endAngleRad);
                  const y2 = 200 + 180 * Math.sin(endAngleRad);
                  
                  const pathData = [
                    `M 200 200`,
                    `L ${x1} ${y1}`,
                    `A 180 180 0 0 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');

                  // Text position
                  const textAngle = startAngle + (segmentAngle / 2);
                  const textAngleRad = (textAngle * Math.PI) / 180;
                  const textX = 200 + 120 * Math.cos(textAngleRad);
                  const textY = 200 + 120 * Math.sin(textAngleRad);

                  return (
                    <g key={prize.id}>
                      {/* Segment background */}
                      <path
                        d={pathData}
                        fill={`url(#gradient-${index})`}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      
                      {/* Icon */}
                      <text
                        x={textX}
                        y={textY - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="24"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY - 10})`}
                      >
                        {prize.icon}
                      </text>
                      
                      {/* Text */}
                      <text
                        x={textX}
                        y={textY + 15}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={prize.textColor}
                        fontSize="11"
                        fontWeight="bold"
                        textShadow="1px 1px 2px rgba(0,0,0,0.5)"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY + 15})`}
                      >
                        {prize.text}
                      </text>
                    </g>
                  );
                })}
                
                {/* Center decorative circle */}
                <circle
                  cx="200"
                  cy="200"
                  r="15"
                  fill="url(#centerGradient)"
                />
              </svg>
            </div>

            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={!wheelStatus?.canSpin || spinning || prizes.length === 0}
              style={{
                marginTop: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: (wheelStatus?.canSpin && !spinning && prizes.length > 0)
                  ? 'linear-gradient(45deg, #f1c40f, #f39c12)' 
                  : '#bdc3c7',
                color: 'white',
                border: 'none',
                padding: '18px 40px',
                borderRadius: '50px',
                fontSize: '1.4rem',
                fontWeight: '700',
                cursor: (wheelStatus?.canSpin && !spinning && prizes.length > 0) ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: (wheelStatus?.canSpin && !spinning && prizes.length > 0)
                  ? '0 8px 25px rgba(241, 196, 15, 0.4)' 
                  : 'none',
                transform: 'translateY(0)',
              }}
            >
              <RotateCw 
                size={24} 
                style={{
                  animation: spinning ? 'spin 1s linear infinite' : 'none'
                }}
              />
              {spinning ? 'Çark Dönüyor...' : 
               wheelStatus?.canSpin ? 'Çarkı Çevir!' : 
               'Haftada Bir Kez'}
            </button>

            {/* Çark Bilgileri */}
            {wheelStatus && !wheelStatus.canSpin && getNextSpinDate() && (
              <div style={{
                marginTop: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.9)',
                color: '#0066cc',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                <Clock size={16} />
                <span>Sonraki çark: {getNextSpinDate().toLocaleDateString('tr-TR')}</span>
              </div>
            )}
          </div>

          {/* Test Butonu */}
          <button
            onClick={resetForTest}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            🔄 Test: Haftada 1 kez sınırını kaldır
          </button>

          {/* Kuponlar Listesi */}
          {userCoupons.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: '800px'
            }}>
              <h3 style={{
                textAlign: 'center',
                color: '#333',
                marginBottom: '25px',
                fontSize: '1.6rem'
              }}>
                🎫 Kuponlarım ({userCoupons.length} adet)
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {userCoupons.map(coupon => (
                  <div key={coupon.id} style={{
                    background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                      {coupon.prize_value} TL İndirim
                    </div>
                    <div style={{ fontSize: '0.8rem', opacity: '0.9' }}>
                      {coupon.doubled && '🚀 İkiye Katlandı!'}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: '0.8', marginTop: '10px' }}>
                      Son: {new Date(coupon.expires_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={goToCart}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '12px 30px',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <ShoppingCart size={20} />
            <a href='/sepet'>sepete git ve kullan</a>    
                </button>
              </div>
            </div>
          )}

          {/* Ödüller Listesi */}
          {prizes.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              width: '100%',
              maxWidth: '800px'
            }}>
              <h3 style={{
                textAlign: 'center',
                color: '#333',
                marginBottom: '25px',
                fontSize: '1.6rem'
              }}>
                💰 Yüksek İndirimli Ödüller
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                {prizes.map(prize => (
                  <div key={prize.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '15px',
                    background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{prize.icon}</span>
                    <span style={{ 
                      flex: 1, 
                      fontWeight: '600', 
                      color: '#333' 
                    }}>
                      {prize.text}
                    </span>
                    <span style={{
                      background: prize.color,
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      %{prize.chance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          from, to { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}} />

      {/* Çift ya da Tek Oyunu */}
      {showDoubleGame && wonPrize && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '500px',
            width: '90%',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: '0', fontSize: '1.8rem' }}>🎰 ÇİFT YA DA TEK!</h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '1rem', opacity: '0.9' }}>
                İndirimini 2 katına çıkarma şansın!
              </p>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '3rem', marginBottom: '10px' }}>{wonPrize.icon}</span>
                <h3 style={{ color: '#333', margin: '0', fontSize: '1.3rem' }}>
                  Mevcut Ödülün: {wonPrize.text}
                </h3>
                <p style={{ color: '#e74c3c', fontWeight: 'bold', margin: '10px 0' }}>
                  💡 Doğru tahmin edersen: {wonPrize.value * 2} TL İndirim!
                </p>
              </div>
              
              {!isDoubleGameActive ? (
                <>
                  <div style={{
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '8px',
                    padding: '15px',
                    margin: '20px 0'
                  }}>
                    <p style={{ margin: '8px 0', fontSize: '0.95rem', color: '#856404' }}>
                      🎲 1-10 arası rastgele sayı seçilecek
                    </p>
                    <p style={{ margin: '8px 0', fontSize: '0.95rem', color: '#856404' }}>
                      ✅ Doğru tahmin: İndirim 2 katına çıkar!
                    </p>
                    <p style={{ margin: '8px 0', fontSize: '0.95rem', color: '#856404' }}>
                      ❌ Yanlış tahmin: Mevcut indirim korunur
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', margin: '20px 0' }}>
                    <button 
                      onClick={() => playDoubleGame('even')}
                      style={{
                        flex: 1,
                        padding: '20px 15px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #2ecc71, #27ae60)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      ⚪ ÇİFT
                      <span style={{ fontSize: '0.8rem', opacity: '0.9' }}>(2,4,6,8,10)</span>
                    </button>
                    <button 
                      onClick={() => playDoubleGame('odd')}
                      style={{
                        flex: 1,
                        padding: '20px 15px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      ⚫ TEK
                      <span style={{ fontSize: '0.8rem', opacity: '0.9' }}>(1,3,5,7,9)</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowDoubleGame(false);
                      saveCoupon(wonPrize);
                      setShowResult(true);
                    }}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '12px 25px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginTop: '15px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Geç, Mevcut İndirimimi Al
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{
                    fontSize: '4rem',
                    animation: 'bounce 0.5s infinite alternate',
                    marginBottom: '20px'
                  }}>
                    🎲
                  </div>
                  <p style={{ fontSize: '1.2rem', color: '#666', fontWeight: '500' }}>
                    Sayı seçiliyor...
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                    3 saniye sonra sonuç açıklanacak!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sonuç Modal */}
      {showResult && wonPrize && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '500px',
            width: '90%',
            overflow: 'hidden',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{
              background: wonPrize?.doubled 
                ? 'linear-gradient(45deg, #e74c3c, #c0392b)'
                : 'linear-gradient(45deg, #27ae60, #2ecc71)',
              color: 'white',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 style={{ margin: '0', fontSize: '1.8rem' }}>
                {wonPrize?.doubled ? '🚀 SÜPER TEBRİKLER!' : '🎉 Tebrikler!'}
              </h2>
              <p style={{ margin: '5px 0 0 0', fontSize: '1rem', opacity: '0.9' }}>
                {wonPrize.type === 'try_again' ? 'Tekrar çevirme hakkı kazandın!' : 'İndirim kuponu kazandın!'}
              </p>
            </div>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '4rem', display: 'block', marginBottom: '15px' }}>
                  {wonPrize.icon}
                </span>
                <h3 style={{ fontSize: '2rem', color: '#333', margin: '0 0 10px 0' }}>
                  {wonPrize.doubled ? `${wonPrize.value} TL İndirim` : wonPrize.text}
                </h3>
                {wonPrize?.doubled && (
                  <p style={{
                    color: '#e74c3c',
                    fontWeight: 'bold',
                    fontSize: '1.3rem',
                    margin: '10px 0'
                  }}>
                    🔥 İNDİRİM 2 KATINA ÇIKTI!
                  </p>
                )}
                {wonPrize?.doubleGameResult && (
                  <div style={{
                    background: wonPrize.doubled ? '#e8f5e8' : '#fff3cd',
                    border: `2px solid ${wonPrize.doubled ? '#28a745' : '#ffc107'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    margin: '15px 0'
                  }}>
                    <p style={{
                      margin: '0',
                      color: wonPrize.doubled ? '#155724' : '#856404',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}>
                      {wonPrize.doubleGameResult}
                    </p>
                  </div>
                )}
                <p style={{ fontSize: '1.1rem', color: '#666', margin: '0' }}>
                  {wonPrize.type === 'try_again' 
                    ? 'Şimdi tekrar çevirebilirsin!'
                    : 'Kuponun hesabına eklendi!'}
                </p>
              </div>
              
              {wonPrize.type !== 'try_again' && (
                <div style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '15px',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#555'
                }}>
                  <p style={{ margin: '5px 0', fontWeight: 'bold' }}>📋 Kupon Bilgileri:</p>
                  <p style={{ margin: '5px 0' }}>• 30 gün içinde kullanılmalı</p>
                  <p style={{ margin: '5px 0' }}>• Sepetten "Kuponlarım" bölümünde görünür</p>
                  <p style={{ margin: '5px 0' }}>• Minimum sepet tutarı uygulanabilir</p>
                  <p style={{ margin: '5px 0' }}>• Otomatik olarak hesaplanır ve uygulanır</p>
                </div>
              )}
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '20px',
              borderTop: '1px solid #eee'
            }}>
              {wonPrize.type === 'try_again' ? (
                <button 
                  onClick={() => {
                    closeResult();
                    // Tekrar çevirme hakkı ver
                    setWheelStatus(prev => ({ ...prev, canSpin: true }));
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: '#28a745',
                    color: 'white',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🎰 Tekrar Çevir!
                </button>
              ) : (
                <>
                  <button 
                    onClick={closeResult}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: '#6c757d',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Tamam
                  </button>
                  <button 
                    onClick={goToCart}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      background: '#007bff',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingCart size={16} />
                <a href='/sepet'>sepete git</a>    
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WheelComponent;