import React, { useState, useEffect } from 'react';
import './CommentSystem.css';
import { API_URL } from '../config/api';

const CommentSystem = ({ productId }) => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: null,
    positiveComments: [],
    negativeComments: [],
    trends: [],
    sentimentDistribution: [],
    wordCloud: null,
    productFeatures: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  const validateProductId = (id) => {
    if (typeof id === 'string' && id.trim() !== '') {
      const numId = parseInt(id.trim());
      if (!isNaN(numId) && numId > 0) return numId;
    }
    if (typeof id === 'number' && id > 0) return id;

    const urlParams = new URLSearchParams(window.location.search);
    const urlProductId = urlParams.get('productId') || urlParams.get('id');
    if (urlProductId) {
      const numUrlId = parseInt(urlProductId);
      if (!isNaN(numUrlId) && numUrlId > 0) return numUrlId;
    }

    const pathMatch = window.location.pathname.match(/\/product\/(\d+)|\/(\d+)$/);
    if (pathMatch) {
      const pathId = parseInt(pathMatch[1] || pathMatch[2]);
      if (!isNaN(pathId) && pathId > 0) return pathId;
    }

    return null;
  };

  const API_BASE_URL = API_URL;

  const fetchProductAnalyticsData = async (validatedProductId = null) => {
    const targetProductId = validatedProductId || validateProductId(productId);
    if (!targetProductId) {
      setError(`Geçersiz ürün ID: ${productId}`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const overviewUrl = `${API_BASE_URL}/comments/analytics/overview/${targetProductId}`;
      const overviewResponse = await fetch(overviewUrl);

      if (!overviewResponse.ok) {
        const errorText = await overviewResponse.text();
        throw new Error(`Overview API hatası: ${overviewResponse.status} - ${errorText}`);
      }

      const overviewData = await overviewResponse.json();

      const [
        positiveRes,
        negativeRes,
        trendsRes,
        distributionRes,
        wordCloudRes,
        productFeaturesRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/comments/analytics/most-positive/${targetProductId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/comments/analytics/most-negative/${targetProductId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/comments/analytics/trends/${targetProductId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/comments/analytics/sentiment-distribution/${targetProductId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/comments/analytics/word-cloud/${targetProductId}`).catch(() => ({ ok: false })),
        fetch(`${API_BASE_URL}/comments/analytics/product-features/${targetProductId}`).catch(() => ({ ok: false }))
      ]);

      const [
        positiveComments,
        negativeComments,
        trends,
        sentimentDistribution,
        wordCloud,
        productFeatures
      ] = await Promise.all([
        positiveRes.ok ? positiveRes.json().catch(() => []) : [],
        negativeRes.ok ? negativeRes.json().catch(() => []) : [],
        trendsRes.ok ? trendsRes.json().catch(() => []) : [],
        distributionRes.ok ? distributionRes.json().catch(() => []) : [],
        wordCloudRes.ok ? wordCloudRes.json().catch(() => null) : null,
        productFeaturesRes.ok ? productFeaturesRes.json().catch(() => null) : null
      ]);

      setAnalyticsData({
        overview: overviewData,
        positiveComments,
        negativeComments,
        trends,
        sentimentDistribution,
        wordCloud,
        productFeatures
      });

      setIsLoading(false);
    } catch (error) {
      setError(`Analiz verileri yüklenemedi: ${error.message}`);
      setAnalyticsData({
        overview: null,
        positiveComments: [],
        negativeComments: [],
        trends: [],
        sentimentDistribution: [],
        wordCloud: null,
        productFeatures: null
      });
      setIsLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const reanalyzeProductComments = async () => {
    const validatedProductId = validateProductId(productId);
    if (!validatedProductId) {
      alert('Geçersiz ürün ID! Sayfa yenilenerek tekrar deneyin.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/comments/analytics/reanalyze/${validatedProductId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Yeniden analiz hatası: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      await fetchProductAnalyticsData(validatedProductId);
      alert(`✅ ${result.updatedCount} yorum yeniden analiz edildi!`);
    } catch (error) {
      alert(`❌ Yeniden analiz sırasında hata oluştu: ${error.message}`);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const apiConnected = await testApiConnection();
      if (!apiConnected) {
        setError('API sunucusuna bağlanılamıyor. Sunucunun çalıştığından emin olun.');
        setIsLoading(false);
        return;
      }

      const validatedProductId = validateProductId(productId);
      await fetchProductAnalyticsData(validatedProductId);
    };

    initializeData();
  }, [productId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategoriler alınamadı:", error);
      }
    };

    fetchCategories();
  }, []);

  



  const validatedProductId = validateProductId(productId);

  // Loading durumu
  if (isLoading) {
    return (
      <div className="page-container loading-page">
        <div className="max-width-container">
          <div className="main-card">
            <div className="loading-content">
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <div className="loading-backdrop"></div>
              </div>
              <div className="loading-title">
                📊 Analiz Verileri Yükleniyor
              </div>
              <div className="loading-info">
                Ürün ID: <span className="code-text">{productId} → {validatedProductId}</span>
              </div>
              <div className="loading-url">
                {window.location.href}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="page-container error-page">
        <div className="max-width-container-small">
          <div className="main-card error-card">
            <div className="error-content">
              <div className="error-icon">
                <span>❌</span>
              </div>
              <div className="error-title">Hata Oluştu</div>
              <div className="error-message">
                {error}
              </div>
              <div className="debug-info">
                <strong>Debug Bilgileri:</strong><br/>
                Original ProductId: {String(productId)}<br/>
                Validated ProductId: {String(validatedProductId)}<br/>
                URL: {window.location.href}
              </div>
              <button 
                onClick={() => fetchProductAnalyticsData()}
                className="retry-button"
              >
                🔄 Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Veri yok durumu
  if (!analyticsData.overview) {
    return (
      <div className="page-container no-data-page">
        <div className="max-width-container-small">
          <div className="main-card no-data-card">
            <div className="no-data-content">
              <div className="no-data-icon">
                <span>⚠️</span>
              </div>
              <div className="no-data-title">Analiz Verisi Bulunamadı</div>
              <div className="no-data-message">
                Bu ürün için henüz yorum analizi bulunmuyor.
              </div>
              <div className="product-id-info">
                Ürün ID: <span className="code-text-bordered">{productId} → {validatedProductId}</span>
              </div>
              <button 
                onClick={reanalyzeProductComments}
                className="analyze-button"
              >
                🔄 Analiz Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analiz sonuçlarını göster
  const { overview, productFeatures } = analyticsData;

  return (
    <div className="page-container main-page">
      <div className="max-width-container-large">
        <div className="main-card main-content-card">
          
          {/* Header */}
          <div className="header-section">
            <div className="header-content">
              <div>
                <h1 className="main-title">
                  📊 Yorum Analiz Paneli
                </h1>
                <p className="main-subtitle">
                  {overview.product_name || `Ürün ${validatedProductId}`}
                </p>
              </div>
              <button 
                onClick={reanalyzeProductComments}
                className="header-button"
              >
                🔄 Yeniden Analiz Et
              </button>
            </div>
          </div>

          <div className="content-section">
            {/* Genel İstatistikler */}
            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-content">
                  <span className="stat-emoji">💬</span>
                  <div className="stat-info">
                    <div className="stat-number">{overview.total_comments || 0}</div>
                    <div className="stat-label">Toplam Yorum</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card stat-green">
                <div className="stat-content">
                  <span className="stat-emoji">✅</span>
                  <div className="stat-info">
                    <div className="stat-number">{overview.approved_comments || 0}</div>
                    <div className="stat-label">Onaylı Yorum</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card stat-purple">
                <div className="stat-content">
                  <span className="stat-emoji">🎯</span>
                  <div className="stat-info">
                    <div className="stat-number">{overview.avg_sentiment_score || 0}</div>
                    <div className="stat-label">Ortalama Duygu</div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card stat-orange">
                <div className="stat-content">
                  <span className="stat-emoji">📈</span>
                  <div className="stat-info">
                    <div className="stat-number">
                      {overview.approved_comments > 0 ? 
                        ((parseInt(overview.very_positive || 0) + parseInt(overview.positive || 0)) / parseInt(overview.approved_comments) * 100).toFixed(1) 
                        : 0}%
                    </div>
                    <div className="stat-label">Pozitif Oran</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Duygu Dağılımı */}
            <div className="sentiment-section">
              <h2 className="section-title">
                <span className="section-emoji">🎯</span>
                Duygu Dağılımı
              </h2>
              <div className="sentiment-grid">
                <div className="sentiment-card sentiment-very-positive">
                  <div className="sentiment-content">
                    <div className="sentiment-info">
                      <span className="sentiment-dot sentiment-dot-green"></span>
                      <span className="sentiment-label">Çok Pozitif</span>
                    </div>
                    <span className="sentiment-count">{overview.very_positive || 0}</span>
                  </div>
                </div>
                
                <div className="sentiment-card sentiment-positive">
                  <div className="sentiment-content">
                    <div className="sentiment-info">
                      <span className="sentiment-dot sentiment-dot-blue"></span>
                      <span className="sentiment-label">Pozitif</span>
                    </div>
                    <span className="sentiment-count">{overview.positive || 0}</span>
                  </div>
                </div>
                
                <div className="sentiment-card sentiment-neutral">
                  <div className="sentiment-content">
                    <div className="sentiment-info">
                      <span className="sentiment-dot sentiment-dot-gray"></span>
                      <span className="sentiment-label">Nötr</span>
                    </div>
                    <span className="sentiment-count">{overview.neutral || 0}</span>
                  </div>
                </div>
                
                <div className="sentiment-card sentiment-negative">
                  <div className="sentiment-content">
                    <div className="sentiment-info">
                      <span className="sentiment-dot sentiment-dot-orange"></span>
                      <span className="sentiment-label">Negatif</span>
                    </div>
                    <span className="sentiment-count">{overview.negative || 0}</span>
                  </div>
                </div>
                
                <div className="sentiment-card sentiment-very-negative">
                  <div className="sentiment-content">
                    <div className="sentiment-info">
                      <span className="sentiment-dot sentiment-dot-red"></span>
                      <span className="sentiment-label">Çok Negatif</span>
                    </div>
                    <span className="sentiment-count">{overview.very_negative || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* YENİ BÖLÜM: Ürün Özellikleri Analizi */}
            {productFeatures && (
              <div className="features-analysis-section">
                <h2 className="section-title">
                  <span className="section-emoji">🔍</span>
                  Ürün Özellik Analizi
                </h2>

                <div className="features-grid">
                  {/* En Beğenilen Yönler */}
                  {productFeatures.positiveFeatures && productFeatures.positiveFeatures.length > 0 && (
                    <div className="features-column positive-features">
                      <h3 className="features-title positive-title">
                        <span className="features-emoji">👍</span>
                        En Beğenilen Yönler
                      </h3>
                      <div className="features-list">
                        {productFeatures.positiveFeatures.map((feature, index) => (
                          <div key={feature.category} className="feature-card positive-feature">
                            <div className="feature-header">
                              <div className="feature-info">
                                <span className="feature-rank">#{index + 1}</span>
                                <span className="feature-label">{feature.label}</span>
                              </div>
                              <span className="feature-count positive-count">
                                {feature.count} yorum
                              </span>
                            </div>
                            
                            {feature.uniqueKeywords && feature.uniqueKeywords.length > 0 && (
                              <div className="feature-keywords">
                                <span className="keywords-label">Anahtar kelimeler:</span>
                                <div className="keywords-list">
                                  {feature.uniqueKeywords.slice(0, 3).map((keyword, idx) => (
                                    <span key={idx} className="keyword-tag positive-keyword">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {feature.comments && feature.comments.length > 0 && (
                              <div className="feature-comments">
                                <span className="comments-label">Örnek yorumlar:</span>
                                {feature.comments.slice(0, 2).map((comment, idx) => (
                                  <div key={comment.id} className="sample-comment positive-sample">
                                    <span className="comment-username">{comment.username}:</span>
                                    <span className="comment-text">
                                      "{comment.comment.length > 80 ? 
                                        comment.comment.substring(0, 80) + '...' : 
                                        comment.comment}"
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* En Eleştirilen Yönler */}
                  {productFeatures.negativeFeatures && productFeatures.negativeFeatures.length > 0 && (
                    <div className="features-column negative-features">
                      <h3 className="features-title negative-title">
                        <span className="features-emoji">👎</span>
                        En Eleştirilen Yönler
                      </h3>
                      <div className="features-list">
                        {productFeatures.negativeFeatures.map((feature, index) => (
                          <div key={feature.category} className="feature-card negative-feature">
                            <div className="feature-header">
                              <div className="feature-info">
                                <span className="feature-rank">#{index + 1}</span>
                                <span className="feature-label">{feature.label}</span>
                              </div>
                              <span className="feature-count negative-count">
                                {feature.count} yorum
                              </span>
                            </div>
                            
                            {feature.uniqueKeywords && feature.uniqueKeywords.length > 0 && (
                              <div className="feature-keywords">
                                <span className="keywords-label">Anahtar kelimeler:</span>
                                <div className="keywords-list">
                                  {feature.uniqueKeywords.slice(0, 3).map((keyword, idx) => (
                                    <span key={idx} className="keyword-tag negative-keyword">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {feature.comments && feature.comments.length > 0 && (
                              <div className="feature-comments">
                                <span className="comments-label">Örnek yorumlar:</span>
                                {feature.comments.slice(0, 2).map((comment, idx) => (
                                  <div key={comment.id} className="sample-comment negative-sample">
                                    <span className="comment-username">{comment.username}:</span>
                                    <span className="comment-text">
                                      "{comment.comment.length > 80 ? 
                                        comment.comment.substring(0, 80) + '...' : 
                                        comment.comment}"
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Özellik Özeti */}
                {productFeatures && (
                  <div className="features-summary">
                    <div className="summary-stats">
                      <div className="summary-stat positive-stat">
                        <span className="summary-emoji">👍</span>
                        <span className="summary-text">
                          {productFeatures.positiveFeatures.length} beğenilen özellik
                        </span>
                      </div>
                      <div className="summary-stat negative-stat">
                        <span className="summary-emoji">👎</span>
                        <span className="summary-text">
                          {productFeatures.negativeFeatures.length} eleştirilen özellik
                        </span>
                      </div>
                      <div className="summary-stat total-stat">
                        <span className="summary-emoji">📊</span>
                        <span className="summary-text">
                          {productFeatures.totalComments} yorum analiz edildi
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Yorumlar Grid */}
            <div className="comments-grid">
              {/* En Pozitif Yorumlar */}
              {analyticsData.positiveComments.length > 0 && (
                <div className="comments-section">
                  <h3 className="comments-title positive-title">
                    <span className="comments-emoji">😊</span>
                    En Pozitif Yorumlar
                  </h3>
                  <div className="comments-list">
                    {analyticsData.positiveComments.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="comment-card positive-comment">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-score positive-score">
                            +{comment.sentiment_score}
                          </span>
                        </div>
                        <p className="comment-text">{comment.comment}</p>
                        <div className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('tr-TR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* En Negatif Yorumlar */}
              {analyticsData.negativeComments.length > 0 && (
                <div className="comments-section">
                  <h3 className="comments-title negative-title">
                    <span className="comments-emoji">😞</span>
                    En Negatif Yorumlar
                  </h3>
                  <div className="comments-list">
                    {analyticsData.negativeComments.slice(0, 5).map((comment) => (
                      <div key={comment.id} className="comment-card negative-comment">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-score negative-score">
                            {comment.sentiment_score}
                          </span>
                        </div>
                        <p className="comment-text">{comment.comment}</p>
                        <div className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('tr-TR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Debug Bilgileri */}
            <div className="debug-section">
              <details className="debug-details">
                <summary className="debug-summary">
                  🔧 Debug Bilgileri
                </summary>
                <div className="debug-content">
                  <div><strong>Original ProductId:</strong> {String(productId)} ({typeof productId})</div>
                  <div><strong>Validated ProductId:</strong> {String(validatedProductId)}</div>
                  <div><strong>Total Comments:</strong> {overview.total_comments}</div>
                  <div><strong>Features Loaded:</strong> {productFeatures ? 'Yes' : 'No'}</div>
                  <div><strong>Positive Features:</strong> {productFeatures ? productFeatures.positiveFeatures.length : 0}</div>
                  <div><strong>Negative Features:</strong> {productFeatures ? productFeatures.negativeFeatures.length : 0}</div>
                  <div><strong>Current URL:</strong> {window.location.pathname}</div>
                  <div><strong>API Base:</strong> {API_BASE_URL}</div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSystem;