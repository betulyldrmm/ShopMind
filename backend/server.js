const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL bağlantısı - TEK POOL TANIMLA
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:bet2516@localhost:5432/shopmind_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// CORS ayarları - GENİŞLETİLMİŞ
const allowedOrigins = [
  'https://famous-zabaione-e408c8.netlify.app',
  'https://deluxe-biscochitos-c1be48.netlify.app', 
  'https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Origin yoksa (Postman, mobile app vb.) veya izin verilen listede ise kabul et
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS engellenen origin:', origin);
      callback(new Error('CORS hatası: Bu origin engellenmiş.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // IE11 için
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/images', express.static('public/images'));

// Database initialization
async function initDatabase() {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL bağlantısı başarılı');
    
    // Users tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        phone VARCHAR(20),
        birth_date DATE,
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        stock INTEGER DEFAULT 0,
        discount DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Popular products tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS popular_products (
        product_id INTEGER PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
        rank INTEGER DEFAULT 0
      )
    `);
    
    // Varsayılan kategoriler ekle
    const categoryCheck = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(categoryCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO categories (name, slug, description) VALUES 
        ('Spor', 'spor', 'Spor ürünleri ve ekipmanları'),
        ('Teknoloji', 'teknoloji', 'Bilgisayar, telefon ve teknoloji ürünleri'),
        ('Kitap', 'kitap', 'Kitaplar ve eğitim materyalleri'),
        ('Otomobil', 'otomobil', 'Araç ve otomobil ürünleri')
      `);
      console.log('✅ Varsayılan kategoriler eklendi');
    }
    
    console.log('✅ Veritabanı tabloları hazır');
    client.release();
    
  } catch (error) {
    console.error('❌ PostgreSQL bağlantı hatası:', error.message);
    process.exit(1);
  }
}

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'ShopMind API Server',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      discounted: '/api/discounted-products',
      popular: '/api/popular-products',
      health: '/api/health',
      users: '/api/users',
      register: 'POST /api/register',
      login: 'POST /api/login'
    }
  });
});

// =============================================
// AUTH ENDPOINTS
// =============================================

app.post('/api/register', async (req, res) => {
  console.log('📝 Kayıt isteği geldi:', req.body);
  
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    console.log('❌ Boş alanlar var');
    return res.status(400).json({
      success: false,
      error: 'Username, email ve password gerekli!'
    });
  }
  
  if (!email.includes('@')) {
    console.log('❌ Geçersiz email format');
    return res.status(400).json({
      success: false,
      error: 'Geçerli bir email adresi girin!'
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase().trim(), username.trim()]
    );
    
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      console.log('❌ Email veya username zaten kayıtlı');
      return res.status(409).json({
        success: false,
        error: 'Bu email adresi veya kullanıcı adı zaten kayıtlı!'
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const result = await client.query(
      'INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email, created_at',
      [userId, username.trim(), email.toLowerCase().trim(), hashedPassword]
    );
    
    await client.query('COMMIT');
    
    const newUser = result.rows[0];
    
    console.log('✅ Yeni kullanıcı PostgreSQL\'e kaydedildi:', {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    });
    
    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Kayıt hatası:', error);
    
    if (error.code === '23505') {
      res.status(409).json({
        success: false,
        error: 'Bu email adresi veya kullanıcı adı zaten kayıtlı!'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Sunucu hatası oluştu'
      });
    }
  } finally {
    client.release();
  }
});

app.post('/api/login', async (req, res) => {
  console.log('🔐 Giriş isteği geldi:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log('❌ Email veya password boş');
    return res.status(400).json({
      success: false,
      error: 'Email ve şifre gerekli!'
    });
  }
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı:', email);
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı!'
      });
    }
    
    const user = result.rows[0];
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış:', email);
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı!'
      });
    }
    
    console.log('✅ Başarılı giriş:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
    
    res.json({
      success: true,
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Giriş hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası oluştu'
    });
  }
});

// =============================================
// CATEGORIES API ENDPOINTS
// =============================================

app.get('/api/categories', async (req, res) => {
  console.log('📂 Kategori listesi istendi');
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    console.log(`✅ ${result.rows.length} kategori döndürüldü`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Kategoriler alınırken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Kategoriler alınamadı',
      details: error.message 
    });
  }
});

// =============================================
// PRODUCTS API ENDPOINTS
// =============================================

app.get('/api/products', async (req, res) => {
  console.log('📦 Ürün listesi istendi');
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.stock > 0 
      ORDER BY p.created_at DESC
    `);
    
    console.log(`✅ ${result.rows.length} ürün döndürüldü`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Ürünler alınırken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Ürünler alınamadı',
      details: error.message 
    });
  }
});

app.get('/api/discounted-products', async (req, res) => {
  console.log('🔥 İndirimli ürünler istendi');
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.discount > 0 AND p.stock > 0 
      ORDER BY p.discount DESC, p.created_at DESC
      LIMIT 20
    `);
    
    console.log(`✅ ${result.rows.length} indirimli ürün döndürüldü`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ İndirimli ürünler alınırken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'İndirimli ürünler alınamadı',
      details: error.message 
    });
  }
});

app.get('/api/popular-products', async (req, res) => {
  console.log('⭐ Popüler ürünler istendi');
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, pp.rank 
      FROM popular_products pp
      JOIN products p ON pp.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.stock > 0
      ORDER BY pp.rank ASC, p.created_at DESC
    `);
    
    console.log(`✅ ${result.rows.length} popüler ürün döndürüldü`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Popüler ürünler alınırken hata:', error);
    res.status(500).json({ 
      success: false,
      error: 'Popüler ürünler alınamadı',
      details: error.message 
    });
  }
});

// =============================================
// PROFILE API ENDPOINTS
// =============================================

app.get('/api/users/:id/profile', async (req, res) => {
  console.log('👤 Profil bilgileri istendi, ID:', req.params.id);
  
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, phone, birth_date, profile_image, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Kullanıcı bulunamadı:', id);
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }
    
    const user = result.rows[0];
    console.log('✅ Profil bilgileri getirildi:', user.username);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        birthDate: user.birth_date,
        profileImage: user.profile_image,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });
    
  } catch (error) {
    console.error('❌ Profil bilgileri alınırken hata:', error);
    res.status(500).json({
      success: false,
      error: 'Profil bilgileri alınamadı'
    });
  }
});

// =============================================
// UTILITY ENDPOINTS
// =============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server çalışıyor', timestamp: new Date().toISOString() });
});

app.get('/api/test', async (req, res) => {
  try {
    const userResult = await pool.query('SELECT COUNT(*) as total FROM users');
    const productResult = await pool.query('SELECT COUNT(*) as total FROM products');
    console.log('✅ Test endpoint çalışıyor');
    res.json({
      message: 'Server çalışıyor!',
      timestamp: new Date().toISOString(),
      port: PORT,
      totalUsers: parseInt(userResult.rows[0].total),
      totalProducts: parseInt(productResult.rows[0].total),
      database: 'PostgreSQL'
    });
  } catch (error) {
    console.error('❌ Test endpoint hatası:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Veritabanı bağlantı hatası' 
    });
  }
});

// =============================================
// ERROR HANDLING
// =============================================

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route bulunamadı:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    requestedPath: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('💥 Server hatası:', error);
  res.status(500).json({
    success: false,
    error: 'Sunucu hatası'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server kapatılıyor...');
  await pool.end();
  console.log('✅ PostgreSQL bağlantıları kapatıldı');
  process.exit(0);
});

// Database'i başlat ve server'ı çalıştır
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor...`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
});

module.exports = app;