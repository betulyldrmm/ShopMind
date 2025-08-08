// 1. server.js - CORS ayarlarını genişletin
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ✅ CORS ayarlarını düzeltilmiş hali
const allowedOrigins = [
  'https://deluxe-biscochitos-c1be48.netlify.app',
  'https://backendd1234512.vercel.app',
  'https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app', // ✅ Bu eklenmeliydi!
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: "ShopMind API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});
// Database test
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({
      message: 'Database bağlantısı başarılı!',
      timestamp: new Date().toISOString(),
      db_time: result.rows[0].current_time,
      status: 'success'
    });
  } catch (error) {
    console.error('Database bağlantı hatası:', error);
    res.json({
      message: 'API çalışıyor ama database bağlantısı yok',
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'api_only'
    });
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username, email ve password gerekli!'
    });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const result = await pool.query(
      'INSERT INTO users (id, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [userId, username.trim(), email.toLowerCase().trim(), hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı!',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
});

// Login endpoint  
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
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
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı!'
      });
    }
    
    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Email veya şifre hatalı!'
      });
    }
    
    res.json({
      success: true,
      message: 'Giriş başarılı!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Sunucu hatası'
    });
  }
});

// Comments router'ı import et
try {
  const commentsRouter = require('./routes/comments');
  app.use('/api/comments', commentsRouter);
  console.log('✅ Comments router yüklendi');
} catch (error) {
  console.log('⚠️ Comments router yüklenemedi:', error.message);
}

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route bulunamadı:', req.originalUrl);
  res.status(404).json({
    success: false,
    error: 'Endpoint bulunamadı',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health', 
      'GET /api/test',
      'POST /api/register',
      'POST /api/login',
      'GET /api/comments (eğer routes/comments.js varsa)'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('💥 Server hatası:', error);
  res.status(500).json({
    success: false,
    error: 'Sunucu hatası'
  });
});

// ⚠️ ÖNEMLİ: Vercel için export
module.exports = app;