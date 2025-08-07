import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import './UrunListesi.css';

import { API_URL } from '../config/api';

const UrunListesi = () => {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();
    
  useEffect(() => {
    const fetchUrunler = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(`${API_URL}/api/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
                
        if (!response.ok) {
          throw new Error(`Server hatası: ${response.status} - ${response.statusText}`);
        }
                
        const data = await response.json();
        console.log('Tüm ürünler:', data);
        setUrunler(data || []);
      } catch (error) {
        console.error('Ürünler alınamadı:', error);
        if (error.name === 'AbortError') {
          setError('Bağlantı zaman aşımına uğradı');
        } else {
          setError(`Ürünler yüklenemedi: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUrunler();
  }, []);
 
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  const toggleFavorite = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify([...newFavorites]));
  };

  const handleSepeteEkle = (urun, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    
    navigate('/auth', {
      state: {
        message: `${urun.name} ürününü satın almak için giriş yapmalısınız.`,
        product: urun
      }
    });
  };

  if (loading) {
    return (
      <div className="urun-listesi-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="urun-listesi-container">
        <div className="error-state">
          <h2>Hata</h2>
          <p>Ürünler yüklenirken bir hata oluştu: {error}</p>
          <button onClick={() => window.location.reload()}>Tekrar Dene</button>
        </div>
      </div>
    );
  }

  return (
    <div className="urun-listesi-container">
      <div className="sayfa-header">
        <h1>Tüm Ürünlerimiz</h1>
        <p>Toplam {urunler.length} ürün bulundu</p>
      </div>

      <div className="urun-grid">
        {urunler.map((urun) => (
          <div key={urun.id} className="urun-kart">
            <Link to={`/urun/${urun.id}`} className="urun-link">
              <div className="urun-resim-container">
                <img
                  src={urun.image_url || 'spor.jpg'}
                  alt={urun.name}
                  className="urun-resim"
                  onError={(e) => {
                    e.target.src = 'spor.jpg';
                  }}
                />
                
              
                {urun.stock <= 0 && (
                  <div className="stok-yok-badge">Stokta Yok</div>
                )}
                
              
                {urun.discount > 0 && (
                  <div className="indirim-badge">
                    %{urun.discount} İndirim
                  </div>
                )}

              
                <button 
                  className={`favorite-btn ${favorites.has(urun.id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(urun.id, e)}
                >
                  <Heart 
                    size={18} 
                    fill={favorites.has(urun.id) ? '#ff4757' : 'none'} 
                  />
                </button>
              </div>

              <div className="urun-bilgi">
                <h3 className="urun-ad">{urun.name}</h3>
                
           
                {urun.category_name && (
                  <p className="urun-kategori">{urun.category_name}</p>
                )}
                
                
                {urun.description && (
                  <p className="urun-aciklama">
                    {urun.description.length > 100 
                      ? `${urun.description.substring(0, 100)}...` 
                      : urun.description
                    }
                  </p>
                )}

           
                <div className="rating-container">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        fill={i < 4 ? '#ffa500' : 'none'} 
                        color="#ffa500"
                      />
                    ))}
                  </div>
                  <span className="rating-text">(4.0)</span>
                </div>

                <div className="fiyat-container">
                
                  {urun.discount > 0 && (
                    <span className="eski-fiyat">
                      {(urun.price / (1 - urun.discount / 100)).toFixed(2)} TL
                    </span>
                  )}
                  <span className="guncel-fiyat">{urun.price} TL</span>
                </div>

                <div className="stok-durumu">
                  {urun.stock > 0 ? (
                    <span className="stokta-var">✓ Stokta Var ({urun.stock} adet)</span>
                  ) : (
                    <span className="stokta-yok">✗ Stokta Yok</span>
                  )}
                </div>

                <button 
                  className={`sepete-ekle-btn ${urun.stock <= 0 ? 'disabled' : ''}`}
                  onClick={(e) => handleSepeteEkle(urun, e)}
                  disabled={urun.stock <= 0}
                >
                  <ShoppingCart size={16} />
                  {urun.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
                </button>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {urunler.length === 0 && !loading && (
        <div className="bos-durum">
          <h3>Henüz ürün bulunmuyor</h3>
          <p>Yakında yeni ürünler eklenecek!</p>
        </div>
      )}
    </div>
  );
};

export default UrunListesi;