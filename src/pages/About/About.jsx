import React from 'react';
import { Heart, Award, Users, ShoppingBag, Gift, Star } from 'lucide-react';
import './About.css';

function About() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        {/* Header Bölümü */}
        <div className="page-header">
          <h1 className="page-title">Hakkımızda</h1>
          <p className="page-subtitle">
            Hediye vermenin sanatını keşfedin
          </p>
        </div>

        {/* Ana İçerik */}
        <div className="page-content">
          {/* Biz Kimiz Bölümü */}
          <div className="content-section">
            <h2 className="section-title">Biz Kimiz?</h2>
            <p className="section-text">
              2015 yılından bu yana hediye sektöründe faaliyet gösteren firmamız, 
              sevdiklerinize en özel anları yaşatmak için tasarlanmış benzersiz 
              hediyeler sunmaktadır. Kalite, özgünlük ve müşteri memnuniyeti 
              prensiplerimizle hareket ederek, her yaştan ve her zevkten insana 
              hitap eden geniş ürün yelpazemizle hizmet vermekteyiz.
            </p>
            <p className="section-text">
              Deneyimli kadromuz ve yenilikçi yaklaşımımızla, geleneksel hediye 
              anlayışını modern dokunuşlarla birleştirerek, unutulmaz hediye 
              deneyimleri yaratıyoruz. Her müşterimizin ihtiyaçlarına özel 
              çözümler üreterek, hediye vermenin sadece bir alışveriş değil, 
              bir sanat olduğunu kanıtlıyoruz.
            </p>
          </div>

          {/* Özelliklerimiz */}
          <div className="content-section">
            <h2 className="section-title">Neden Bizi Tercih Etmelisiniz?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <Heart className="feature-icon" size={48} color="#e11d48" />
                <h3 className="feature-title">Kaliteli Ürünler</h3>
                <p className="feature-description">
                  Sadece en kaliteli malzemelerden üretilmiş, 
                  dayanıklı ve estetik ürünler sunuyoruz.
                </p>
              </div>
              
              <div className="feature-card">
                <Award className="feature-icon" size={48} color="#f59e0b" />
                <h3 className="feature-title">Özgün Tasarımlar</h3>
                <p className="feature-description">
                  Kendi tasarım ekibimizle ürettiğimiz özgün 
                  ve çarpıcı ürünlerle fark yaratıyoruz.
                </p>
              </div>
              
              <div className="feature-card">
                <Users className="feature-icon" size={48} color="#059669" />
                <h3 className="feature-title">Uzman Ekip</h3>
                <p className="feature-description">
                  Alanında uzman, deneyimli ve güler yüzlü 
                  personelimizle size en iyi hizmeti veriyoruz.
                </p>
              </div>
              
              <div className="feature-card">
                <ShoppingBag className="feature-icon" size={48} color="#7c3aed" />
                <h3 className="feature-title">Hızlı Teslimat</h3>
                <p className="feature-description">
                  Türkiye geneline hızlı ve güvenli teslimat 
                  seçenekleriyle ürünlerinizi kapınıza getiriyoruz.
                </p>
              </div>
              
              <div className="feature-card">
                <Gift className="feature-icon" size={48} color="#dc2626" />
                <h3 className="feature-title">Özel Paketleme</h3>
                <p className="feature-description">
                  Her hediyeyi özenle paketleyerek, 
                  açma anının da büyüsünü yaşatıyoruz.
                </p>
              </div>
              
              <div className="feature-card">
                <Star className="feature-icon" size={48} color="#f59e0b" />
                <h3 className="feature-title">Müşteri Memnuniyeti</h3>
                <p className="feature-description">
                  %98 müşteri memnuniyeti oranımızla 
                  sektörde öncü konumdayız.
                </p>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="content-section">
            <h2 className="section-title">Rakamlarla Biz</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">50,000+</span>
                <span className="stat-label">Mutlu Müşteri</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">15</span>
                <span className="stat-label">Mağaza</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">5,000+</span>
                <span className="stat-label">Ürün Çeşidi</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">8</span>
                <span className="stat-label">Yıllık Tecrübe</span>
              </div>
            </div>
          </div>

          {/* Misyonumuz */}
          <div className="content-section">
            <h2 className="section-title">Misyonumuz</h2>
            <p className="section-text">
              İnsanların sevdikleriyle olan bağlarını güçlendiren, anlamlı ve 
              değerli hediyeler sunarak, her özel anı unutulmaz kılmak. 
              Kaliteden ödün vermeden, sürekli yenilik peşinde koşarak, 
              hediye kültürünü geliştirmek ve yaygınlaştırmak.
            </p>
          </div>

          {/* Vizyonumuz */}
          <div className="content-section">
            <h2 className="section-title">Vizyonumuz</h2>
            <p className="section-text">
              Türkiye'nin en güvenilir ve tercih edilen hediye markası olmak. 
              İnovasyonu ve müşteri odaklılığı benimseyen, sürdürülebilir 
              büyümeyle sektöre yön veren, global ölçekte tanınan bir marka 
              haline gelmek.
            </p>
          </div>
        </div>

        {/* CTA Bölümü */}
        <div className="cta-section">
          <h2 className="cta-title">Hediye Arayışınıza Başlayın</h2>
          <p className="cta-text">
            Sevdikleriniz için mükemmel hediyeyi bulmak artık çok kolay!
          </p>
          <a href="/products" className="cta-button">
            <ShoppingBag size={20} />
            Ürünleri Keşfet
          </a>
        </div>
      </div>
    </div>
  );
}

export default About;