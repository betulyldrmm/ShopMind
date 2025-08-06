import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, User, FileText } from 'lucide-react';
import './About.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form gönderildi:', formData);
    alert('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

   const contactInfo = [
  {
    icon: <Phone size={24} />,
    title: "Telefon",
    info: "(0212) 123 45 67",
    subInfo: "Pazartesi - Cumartesi: 09:00 - 18:00",
    color: "#059669"
  },
  {
    icon: <Mail size={24} />,
    title: "E-posta",
    info: "info@shopmind.com",
    subInfo: "7/24 destek",
    color: "#dc2626"
  },
  {
    icon: <MapPin size={24} />,
    title: "Adres",
    info: "İstiklal Caddesi No: 125, Beyoğlu",
    subInfo: "İstanbul / Türkiye",
    color: "#7c3aed"
  },
  {
    icon: <MessageSquare size={24} />,
    title: "WhatsApp",
    info: "(0532) 123 45 67",
    subInfo: "Hızlı destek için",
    color: "#16a34a"
  }
];

  

  return (
    <div className="page-container">
      <div className="content-wrapper">
           <div className="page-header">
          <h1 className="page-title">İletişim</h1>
          <p className="page-subtitle">
            Sizinle iletişim kurmak için buradayız
          </p>
        </div>

    
        <div className="page-content">
         
          <div className="content-section">
            <h2 className="section-title">Bize Ulaşın</h2>
            <p className="section-text">
              Herhangi bir sorunuz, öneriniz veya görüşünüz var mı? Size yardımcı olmaktan 
              mutluluk duyarız. Aşağıdaki iletişim kanallarından bize ulaşabilir veya 
              iletişim formumuzu kullanabilirsiniz. Uzman ekibimiz en kısa sürede 
              size dönüş yapacaktır.
            </p>
            <p className="section-text">
              Müşteri memnuniyeti bizim için öncelikli hedefimizdir. Her türlü soru, 
              öneri ve şikayetlerinizi değerlendirip, hizmet kalitemizi sürekli 
              iyileştirmek için çalışmaktayız.
            </p>
          </div>

       
          <div className="content-section">
            <h2 className="section-title">İletişim Bilgileri</h2>
            <div className="features-grid">
              {contactInfo.map((contact, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon" style={{ color: contact.color }}>
                    {contact.icon}
                  </div>
                  <h3 className="feature-title">{contact.title}</h3>
                  <p className="feature-description" style={{ marginBottom: '10px', fontWeight: '600', color: '#1e3a8a' }}>
                    {contact.info}
                  </p>
                  <p className="feature-description" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {contact.subInfo}
                  </p>
                </div>
              ))}
            </div>
          </div>

  
          <div className="content-section">
            <h2 className="section-title">Mesaj Gönderin</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '40px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      <User size={18} style={{ display: 'inline', marginRight: '8px' }} />
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      <Mail size={18} style={{ display: 'inline', marginRight: '8px' }} />
                      E-posta *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      <Phone size={18} style={{ display: 'inline', marginRight: '8px' }} />
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                      <FileText size={18} style={{ display: 'inline', marginRight: '8px' }} />
                      Konu *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        transition: 'border-color 0.3s ease',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    >
                      <option value="">Konu Seçiniz</option>
                      <option value="genel">Genel Bilgi</option>
                      <option value="siparis">Sipariş Durumu</option>
                      <option value="iade">İade/Değişim</option>
                      <option value="oneri">Öneri/Şikayet</option>
                      <option value="toptan">Toptan Satış</option>
                      <option value="diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    <MessageSquare size={18} style={{ display: 'inline', marginRight: '8px' }} />
                    Mesajınız *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Mesajınızı buraya yazınız..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Send size={20} />
                  Mesaj Gönder
                </button>
              </form>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="content-section">
            <h2 className="section-title">Çalışma Saatlerimiz</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <Clock className="stat-number" size={48} style={{ color: 'white' }} />
                <span className="stat-label">Pazartesi - Cuma<br/>09:00 - 18:00</span>
              </div>
              <div className="stat-card">
                <Clock className="stat-number" size={48} style={{ color: 'white' }} />
                <span className="stat-label">Cumartesi<br/>09:00 - 17:00</span>
              </div>
              <div className="stat-card">
                <Clock className="stat-number" size={48} style={{ color: 'white' }} />
                <span className="stat-label">Pazar<br/>Kapalı</span>
              </div>
              <div className="stat-card">
                <Mail className="stat-number" size={48} style={{ color: 'white' }} />
                <span className="stat-label">E-posta Desteği<br/>7/24</span>
              </div>
            </div>
          </div>

          {/* SSS */}
          <div className="content-section">
            <h2 className="section-title">Sıkça Sorulan Sorular</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3 className="feature-title">Ne kadar sürede dönüş yaparsınız?</h3>
                <p className="feature-description">
                  E-posta ve form mesajlarına 24 saat içinde, telefon aramaları 
                  için çalışma saatleri içinde anında yanıt vermeye çalışırız.
                </p>
              </div>
              
              <div className="feature-card">
                <h3 className="feature-title">Şikayet nasıl iletebilirim?</h3>
                <p className="feature-description">
                  Şikayetlerinizi form üzerinden "Öneri/Şikayet" konusu seçerek 
                  veya doğrudan telefon ile iletebilirsiniz.
                </p>
              </div>
              
              <div className="feature-card">
                <h3 className="feature-title">Toptan satış yapıyor musunuz?</h3>
                <p className="feature-description">
                  Evet, toptan satış konusunda özel tekliflerimiz vardır. 
                  "Toptan Satış" konusu ile bize ulaşınız.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Bölümü */}
        <div className="cta-section">
          <h2 className="cta-title">Hemen Bize Ulaşın</h2>
          <p className="cta-text">
            Sorularınız için telefon veya WhatsApp ile anında destek alın!
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:03521234567" className="cta-button">
              <Phone size={20} />
              Telefon Et
            </a>
            <a href="https://wa.me/905321234567" className="cta-button" style={{ background: '#16a34a' }}>
              <MessageSquare size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;