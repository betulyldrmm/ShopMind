import React, { useState, useEffect } from 'react';

const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";

const axios = {
  get: async (url, config = {}) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined
    });
        
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Server hatası' }));
      throw {
        response: {
          status: response.status,
          data: errorData
        }
      };
    }
        
    return { data: await response.json() };
  },
    
  post: async (url, data, config = {}) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(data),
      signal: config.timeout ? AbortSignal.timeout(config.timeout) : undefined
    });
        
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Server hatası' }));
      throw {
        response: {
          status: response.status,
          data: errorData
        }
      };
    }
        
    return { data: await response.json() };
  }
};

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('Kontrol edilmedi');
    
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkServerStatus();
    checkUserLogin();
  }, []);

  const checkUserLogin = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const loginStatus = localStorage.getItem('isLoggedIn');
        
      if (userData && loginStatus === 'true') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      }
    }
  };

  const checkServerStatus = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${API_URL}/api/products`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setServerStatus('✅ Server aktif');
    } catch (error) {
      if (error.name === 'AbortError') {
        setServerStatus('❌ Timeout');
        setMessage('❌ Server yanıt vermiyor (timeout)');
      } else {
        setServerStatus('❌ Server ulaşılamıyor');
        setMessage('❌ Server bağlantı hatası');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('sepet'); // Sepeti temizle
    
    setUser(null);
    setIsLoggedIn(false);
    setIsLogin(true);
    setForm({ username: '', email: '', password: '' });
    setMessage('✅ Çıkış yapıldı, sepet temizlendi');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let response;
      
      if (isLogin) {
        if (!form.email || !form.password) {
          throw new Error('Email ve şifre gerekli');
        }
        
        const loginData = {
          email: form.email,
          password: form.password
        };
        
        response = await axios.post(`${API_BASE_URL}/api/login`, loginData, { timeout: 10000 });
        
        if (response.data.success) {
          const userData = {
            id: response.data.user.id,
            username: response.data.user.username,
            email: response.data.user.email
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
          
          setUser(userData);
          setIsLoggedIn(true);
          setMessage(`✅ Hoş geldin ${userData.username}! Sepet sayfasına yönlendiriliyorsun...`);
          
          setTimeout(() => {
            window.location.href = '/home1';
          }, 1500);
        }
        
      } else {
        if (!form.username || !form.email || !form.password) {
          throw new Error('Tüm alanlar gerekli');
        }
        
        const registerData = {
          username: form.username,
          email: form.email,
          password: form.password
        };
        
        response = await axios.post(`${API_BASE_URL}/api/register`, registerData, { timeout: 10000 });
        
        if (response.data.success) {
          setMessage(`✅ Kayıt başarılı! Şimdi ${form.email} ile giriş yapabilirsin.`);
          
          setTimeout(() => {
            setIsLogin(true);
            setForm({ 
              username: '', 
              email: form.email,
              password: form.password
            });
            setMessage('👉 Şimdi giriş yapabilirsin!');
          }, 2000);
        }
      }
      
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data.error || error.response.data.message || 'Bilinmeyen server hatası';
        setMessage(`❌ Server hatası (${error.response.status}): ${errorMsg}`);
      } else if (error.name === 'AbortError') {
        setMessage('❌ İstek zaman aşımına uğradı');
      } else if (error.message.includes('fetch')) {
        setMessage('❌ Server\'a bağlanılamıyor. Server çalışıyor mu?');
      } else {
        setMessage(`❌ Hata: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn && user) {
    return (
      <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2>🎉 Başarıyla Giriş Yaptınız!</h2>
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '15px', 
            borderRadius: '8px', 
            margin: '15px 0' 
          }}>
            <h3>👤 {user.username}</h3>
            <p>📧 {user.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            👋 Çıkış Yap
          </button>
        </div>

        {message && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            wordBreak: 'break-word'
          }}>
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{isLogin ? '🔐 Giriş Yap' : '📝 Kayıt Ol'}</h2>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>
        <h3>🔧 Server Bilgileri</h3>
        <p><strong>Server Durumu:</strong> {serverStatus}</p>
        <p><strong>API URL:</strong> {API_BASE_URL}</p>
        <p><strong>Mod:</strong> {isLogin ? 'Giriş Yapma' : 'Kayıt Olma'}</p>
        
        <button onClick={checkServerStatus} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
          🔄 Server Kontrol
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              name="username"
              placeholder="Kullanıcı Adı"
              value={form.username}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            name="password"
            placeholder="Şifre"
            value={form.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
          />
        </div>
        
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: loading ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? '⏳ İşleniyor...' : (isLogin ? '🔐 Giriş Yap' : '📝 Kayıt Ol')}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        <button 
          onClick={() => { 
            setIsLogin(!isLogin); 
            setMessage(''); 
            setForm({ username: '', email: '', password: '' });
          }}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            cursor: 'pointer', 
            textDecoration: 'underline',
            fontSize: '14px'
          }}
        >
          {isLogin ? '📝 Kayıt Olmak İstiyorum' : '🔐 Zaten Hesabım Var'}
        </button>
      </p>
      
      {message && (
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          wordBreak: 'break-word'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default AuthForm;
