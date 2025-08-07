// components/ProductComments/ProductComments.jsx
import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import './ProductComments.css';

const ProductComments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Yorumları getir
  useEffect(() => {
    if (productId) {
      fetchComments();
    }
  }, [productId]);

  const fetchComments = async () => {
    try {
    const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app";
const response = await fetch(`${API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.error('Yorumlar alınamadı, response:', response.status);
        setComments([]);
      }
    } catch (error) {
      console.error('Yorumlar alınamadı:', error);
      setComments([]);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!userData || isLoggedIn !== 'true') {
      alert('Yorum yapmak için giriş yapmalısınız!');
      return;
    }

    if (newComment.trim().length < 10) {
      alert('Yorum en az 10 karakter olmalıdır!');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(userData);
      
      const API_URL = "https://shop-mind-6mf5-dyt5ppllk-betuls-projects-5b7c9a73.vercel.app"; {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: user.id || user.username,
          username: user.username,
          comment: newComment.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        setNewComment('');
        setShowCommentForm(false);
        fetchComments(); // Yorumları yenile
        alert(result.message || 'Yorumunuz başarıyla eklendi!');
      } else {
        const error = await response.json();
        alert(error.error || 'Yorum eklenirken bir hata oluştu!');
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderilirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tarih bilinmiyor';
    }
  };

  // productId yoksa component'i render etme
  if (!productId) {
    return null;
  }

  return (
    <div className="comments-container">
      {/* Başlık */}
      <div className="comments-header">
        <h2>Müşteri Yorumları</h2>
        
        <div className="comments-stats">
          <div className="comment-count">
            {comments.length} yorum
          </div>
          
          <button
            className="add-comment-btn"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            {showCommentForm ? 'Yorumu İptal Et' : 'Yorum Yap'}
          </button>
        </div>
      </div>

      {/* Yorum Formu */}
      {showCommentForm && (
        <div className="comment-form-container">
          <h3>Yorumunuzu Paylaşın</h3>
          
          <div className="comment-form">
            <div className="form-group">
              <label>Yorumunuz (en az 10 karakter):</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                rows={4}
                maxLength={500}
              />
              <div className="char-count">
                {newComment.length}/500 karakter
              </div>
            </div>
            
            <button
              className="submit-btn"
              onClick={submitComment}
              disabled={loading || newComment.trim().length < 10}
            >
              <Send size={16} />
              {loading ? 'Gönderiliyor...' : 'Yorumu Gönder'}
            </button>
          </div>
        </div>
      )}

      {/* Yorumlar Listesi */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <User size={48} />
            <p>Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="user-info">
                  <User size={16} />
                  <span className="username">{comment.username}</span>
                </div>
                
                <span className="comment-date">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              
              <p className="comment-text">
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductComments;