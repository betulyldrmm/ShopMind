import React from 'react';
import { MapPin, Phone, Clock } from 'lucide-react';
import './About.css';

function Stores() {
  const stores = [
    {
      id: 1,
      name: "İstanbul Mağaza",
      address: "Bağdat Caddesi No: 120, Kadıköy / İstanbul",
      phone: "(0216) 123 45 67",
      hours: "Her gün: 10:00 - 22:00",
      icon: "🛍️"
    },
    {
      id: 2,
      name: "Ankara Mağaza",
      address: "Tunalı Hilmi Caddesi No: 45, Çankaya / Ankara",
      phone: "(0312) 234 56 78",
      hours: "Her gün: 09:30 - 21:30",
      icon: "🏬"
    },
    {
      id: 3,
      name: "İzmir Mağaza",
      address: "Alsancak Mahallesi, Kıbrıs Şehitleri Caddesi No: 78, İzmir",
      phone: "(0232) 345 67 89",
      hours: "Her gün: 10:00 - 21:00",
      icon: "🎁"
    },
  ];

  return (
    <div className="page-container">
      <div className="content-wrapper">

        {/* Başlık */}
        <div className="page-header">
          <h1 className="page-title">Türkiye Genelinde Mağazalarımız</h1>
          <p className="page-subtitle">
            E-ticaret sitemizden aldığınız ürünleri mağazalarımızdan teslim alabilirsiniz.
          </p>
        </div>

        {/* Bilgilendirme */}
        <div className="content-section">
          <h2 className="section-title">E-Ticaret ile Entegre Mağazacılık</h2>
          <p className="section-text">
            Türkiye genelinde 3 büyük şehirde bulunan fiziksel mağazalarımız sayesinde online alışveriş deneyiminizi kolaylaştırıyoruz.
            Sitemizden verdiğiniz siparişleri ister kargo ile, ister mağazadan teslim al seçeneğiyle hızlıca edinebilirsiniz.
          </p>
          <p className="section-text">
            Mağazalarımızda ürünleri canlı inceleyebilir, değişim veya iade işlemlerinizi gerçekleştirebilirsiniz.
            Uzman ekiplerimiz her zaman hizmetinizde.
          </p>
        </div>

        {/* Mağaza Kartları */}
        <div className="content-section">
          <h2 className="section-title">Mağaza Konumlarımız</h2>
          <div className="stores-grid">
            {stores.map((store) => (
              <div key={store.id} className="store-card">
                <div className="store-image">
                  <span style={{ fontSize: '4rem' }}>{store.icon}</span>
                </div>
                <div className="store-info">
                  <h3 className="store-name">{store.name}</h3>
                  <div className="store-address">
                    <MapPin size={18} style={{ marginRight: '8px' }} />
                    {store.address}
                  </div>
                  <div className="store-phone">
                    <Phone size={18} style={{ marginRight: '8px' }} />
                    {store.phone}
                  </div>
                  <div className="store-hours">
                    <Clock size={18} style={{ marginRight: '8px' }} />
                    {store.hours}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-section">
          <h2 className="cta-title">Hemen Sipariş Verin, Mağazadan Teslim Alın</h2>
          <p className="cta-text">
            Online alışverişinizin konforunu mağazalarımızla birleştirin. Siparişlerinizi güvenle teslim alın!
          </p>
          <a href="tel:08501234567" className="cta-button">
            <Phone size={20} />
            Bize Ulaşın
          </a>
        </div>

      </div>
    </div>
  );
}

export default Stores;
