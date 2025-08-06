import React, { useState, useEffect } from 'react';
import { User, Edit2, Lock, Trash2, Save, X, Eye, EyeOff, MapPin, Plus, Mail, Phone, Calendar, UserCheck } from 'lucide-react';
import './ProfilePage.css'
const ProfilePage = () => {
  const currentUserId = 'user_1234567890_abc123def';
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(null);
  
  // Form state'leri
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    email: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [usernameForm, setUsernameForm] = useState({
    newUsername: ''
  });

  const [addressForm, setAddressForm] = useState({
    title: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    isDefault: false
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [message, setMessage] = useState({ type: '', text: '' });

  // Kullanıcı verilerini getir
  useEffect(() => {
    fetchUserData();
    fetchUserStats();
    fetchUserAddresses();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/profile`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setProfileForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
          birthDate: data.user.birthDate ? data.user.birthDate.split('T')[0] : '',
          email: data.user.email || ''
        });
        setUsernameForm({
          newUsername: data.user.username
        });
      }
    } catch (error) {
      console.error('Profil verileri alınamadı:', error);
      showMessage('error', 'Profil verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/addresses`);
      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Adresler alınamadı:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Profil güncelleme
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setEditMode(false);
        showMessage('success', 'Profil başarıyla güncellendi');
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Profil güncellenemedi');
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Yeni şifre en az 6 karakter olmalı');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMessage('success', 'Şifre başarıyla değiştirildi');
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Şifre değiştirilemedi');
    }
  };

  // Kullanıcı adı değiştirme
  const handleUsernameChange = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/username`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: usernameForm.newUsername })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(prev => ({ ...prev, username: data.newUsername }));
        showMessage('success', 'Kullanıcı adı başarıyla güncellendi');
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Kullanıcı adı güncellenemedi');
    }
  };

  // Adres ekleme/güncelleme
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = addressEditMode && addressEditMode !== 'new'
        ? `http://localhost:5001/api/users/${currentUserId}/addresses/${addressEditMode}`
        : `http://localhost:5001/api/users/${currentUserId}/addresses`;
      
      const method = addressEditMode && addressEditMode !== 'new' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUserAddresses();
        setAddressForm({
          title: '', firstName: '', lastName: '', phone: '',
          address: '', district: '', city: '', postalCode: '', isDefault: false
        });
        setAddressEditMode(null);
        showMessage('success', addressEditMode && addressEditMode !== 'new' ? 'Adres güncellendi' : 'Adres eklendi');
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Adres işlemi başarısız');
    }
  };

  // Adres silme
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    
    try {
      const response = await fetch(`http://localhost:5001/api/users/${currentUserId}/addresses/${addressId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUserAddresses();
        showMessage('success', 'Adres silindi');
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Adres silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Profil bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
 <div className="profile-page">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="profile-avatar">
            {user ? (
              <span> Hoş geldin, <strong>{user.username}</strong>!</span>
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="profile-info">
            {user && <span> Hoş geldin, <strong>{user.username}</strong>!</span>}
             {user && <span> Hoş geldin, <strong>{user.username}</strong>!</span>}
            <p className="profile-username">@{user?.username}</p>
            <div className="profile-details">
              <span className="profile-email">
                <Mail size={14} />
                {user?.email}
              </span>
              {stats && (
                <span className="profile-membership">
                  <Calendar size={14} />
                  {stats.membershipDays} gündür üye
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="profile-container">
        <div className="profile-layout">
          {/* Sidebar Navigation */}
          <nav className="profile-nav">
            <div className="nav-container">
              <button
                onClick={() => setActiveTab('profile')}
                className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={20} />
                <span>Profil Bilgileri</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`nav-button ${activeTab === 'addresses' ? 'active' : ''}`}
              >
                <MapPin size={20} />
                <span>Adreslerim</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`nav-button ${activeTab === 'security' ? 'active' : ''}`}
              >
                <Lock size={20} />
                <span>Güvenlik</span>
              </button>
            </div>
          </nav>
          

          {/* Content */}
          <main className="profile-content">
            {/* Profil Bilgileri Sekmesi */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Profil Bilgileri</h2>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn btn-primary"
                    >
                      <Edit2 size={16} />
                      Düzenle
                    </button>
                  )}
                </div>

                {!editMode ? (
                  <div className="profile-view">
                    <div className="info-grid">
                      <div className="info-item">
                        <label>Ad</label>
                        <p>{user?.firstName || '-'}</p>
                      </div>
                      <div className="info-item">
                        <label>Soyad</label>
                        <p>{user?.lastName || '-'}</p>
                      </div>
                      <div className="info-item">
                        <label>E-posta</label>
                        <p>{user?.email || '-'}</p>
                      </div>
                      <div className="info-item">
                        <label>Telefon</label>
                        <p>{user?.phone || '-'}</p>
                      </div>
                      <div className="info-item">
                        <label>Doğum Tarihi</label>
                        <p>{user?.birthDate ? user.birthDate.split('T')[0] : '-'}</p>
                      </div>
                      <div className="info-item">
                        <label>Üyelik Tarihi</label>
                        <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="profile-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Ad</label>
                        <input
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Soyad</label>
                        <input
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>E-posta</label>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Telefon</label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Doğum Tarihi</label>
                        <input
                          type="date"
                          value={profileForm.birthDate}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, birthDate: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        <Save size={16} />
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setProfileForm({
                            firstName: user?.firstName || '',
                            lastName: user?.lastName || '',
                            phone: user?.phone || '',
                            birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
                            email: user?.email || ''
                          });
                        }}
                        className="btn btn-secondary"
                      >
                        <X size={16} />
                        İptal
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Adreslerim Sekmesi */}
            {activeTab === 'addresses' && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Adreslerim</h2>
                  {!addressEditMode && (
                    <button
                      onClick={() => {
                        setAddressEditMode('new');
                        setAddressForm({
                          title: '',
                          firstName: '',
                          lastName: '',
                          phone: '',
                          address: '',
                          district: '',
                          city: '',
                          postalCode: '',
                          isDefault: false
                        });
                      }}
                      className="btn btn-primary"
                    >
                      <Plus size={16} />
                      Yeni Adres Ekle
                    </button>
                  )}
                </div>

                {addressEditMode && (
                  <form onSubmit={handleAddressSubmit} className="address-form">
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Adres Başlığı</label>
                        <input
                          type="text"
                          required
                          placeholder="Ev, İş, vb."
                          value={addressForm.title}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Ad</label>
                        <input
                          type="text"
                          required
                          value={addressForm.firstName}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, firstName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Soyad</label>
                        <input
                          type="text"
                          required
                          value={addressForm.lastName}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, lastName: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Telefon</label>
                        <input
                          type="tel"
                          required
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group form-group-full">
                        <label>Adres</label>
                        <textarea
                          required
                          rows={3}
                          value={addressForm.address}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, address: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>İlçe</label>
                        <input
                          type="text"
                          required
                          value={addressForm.district}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, district: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Şehir</label>
                        <input
                          type="text"
                          required
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Posta Kodu</label>
                        <input
                          type="text"
                          required
                          value={addressForm.postalCode}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, postalCode: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) =>
                            setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                          }
                        />
                        <span>Varsayılan Adres Olarak Ayarla</span>
                      </label>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-success">
                        <Save size={16} />
                        {addressEditMode === 'new' ? 'Adres Ekle' : 'Güncelle'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressEditMode(null)}
                        className="btn btn-secondary"
                      >
                        <X size={16} />
                        İptal
                      </button>
                    </div>
                  </form>
                )}

                <div className="addresses-list">
                  {addresses.length === 0 ? (
                    <div className="empty-state">
                      <MapPin size={48} />
                      <p>Henüz kayıtlı adresiniz yok.</p>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <div key={addr.id} className="address-card">
                        <div className="address-header">
                          <h3>
                            {addr.title}
                            {addr.isDefault && <span className="default-badge">Varsayılan</span>}
                          </h3>
                          <div className="address-actions">
                            <button
                              onClick={() => {
                                setAddressEditMode(addr.id);
                                setAddressForm({
                                  title: addr.title || '',
                                  firstName: addr.firstName || '',
                                  lastName: addr.lastName || '',
                                  phone: addr.phone || '',
                                  address: addr.address || '',
                                  district: addr.district || '',
                                  city: addr.city || '',
                                  postalCode: addr.postalCode || '',
                                  isDefault: addr.isDefault || false
                                });
                              }}
                              className="btn-icon"
                              title="Düzenle"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="btn-icon btn-danger"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="address-content">
                          <p className="address-name">{addr.firstName} {addr.lastName}</p>
                          <p className="address-phone">{addr.phone}</p>
                          <p className="address-text">{addr.address}</p>
                          <p className="address-location">
                            {addr.district}, {addr.city} - {addr.postalCode}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Güvenlik Sekmesi */}
            {activeTab === 'security' && (
              <div className="tab-content">
                <h2>Güvenlik Ayarları</h2>
                
                {/* Kullanıcı Adı Değişikliği */}
                <div className="security-section">
                  <h3>Kullanıcı Adı</h3>
                  <form onSubmit={handleUsernameChange} className="username-form">
                    <div className="form-group">
                      <label>Yeni Kullanıcı Adı</label>
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={usernameForm.newUsername}
                        onChange={(e) =>
                          setUsernameForm({ newUsername: e.target.value })
                        }
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <UserCheck size={16} />
                      Kullanıcı Adını Güncelle
                    </button>
                  </form>
                </div>

                {/* Şifre Değişikliği */}
                <div className="security-section">
                  <h3>Şifre Değiştir</h3>
                  <form onSubmit={handlePasswordChange} className="password-form">
                    <div className="form-group">
                      <label>Mevcut Şifre</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({ ...prev, current: !prev.current }))
                          }
                          className="password-toggle"
                        >
                          {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Yeni Şifre</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                          }
                          className="password-toggle"
                        >
                          {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Yeni Şifre (Tekrar)</label>
                      <div className="password-input">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                          }
                          className="password-toggle"
                        >
                          {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-danger">
                      <Lock size={16} />
                      Şifre Değiştir
                    </button>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

    
    </div>
  );
};

export default ProfilePage;
         