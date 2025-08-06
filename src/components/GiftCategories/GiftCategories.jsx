import React from "react";
import "./GiftCategories.css";

const categories = [
  {
    title: "Kendine Hediye",
    subtitle: "Bir sürpriz yap",
    image: "/images/giftbox.jpg",
    path: "/KendineHediye", // veya istediğiniz sayfa yolu
    
  },
  {
    title: "Spora Başla",
    subtitle: "Motivasyon kutusu",
    image: "/images/sports.png",
    path: "/SporaBasla",
  
  },
  {
    title: "Hobi Edin",
    subtitle: "Yeni ilgi alanları",
    image: "/images/hobby.jpg",
    path: "/HobiEdin",
    
  },
  {
    title: "Kendinle Kal",
    subtitle: "Rahatlama zamanı",
    image: "/images/relax.jpg",
    path: "/KendinleKal",

  },
 
];

const GiftCategories = () => {
  const handleCategoryClick = (category) => {
    console.log(`Kategori tıklandı: ${category.title}`);
    
    // Yöntem 1: Doğrudan sayfa yönlendirme
    window.location.href = category.path;
    
    // Yöntem 2: React Router kullanıyorsanız (bu satırı aktif edin ve üsttekini kapatın)
    // navigate(category.path);
    
    // Yöntem 3: Hash-based routing için
    // window.location.hash = category.id;
    
    // Yöntem 4: Query parameter ile aynı sayfada filtreleme
    // window.location.search = `?category=${category.id}`;
  };

  const handleKeyPress = (event, category) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(category);
    }
  };

  return (
    <>
   
    <div className="gift-container">
      {categories.map((cat, index) => (
        <div 
          className="gift-card clickable" 
          key={index}
          onClick={() => handleCategoryClick(cat)}
          onKeyPress={(e) => handleKeyPress(e, cat)}
          tabIndex={0}
          role="button"
          aria-label={`${cat.title} kategorisine git - ${cat.subtitle}`}
        >
          <img src={cat.image} alt={cat.title} className="gift-img" />
          <h3>{cat.title}</h3>
          <p>{cat.subtitle}</p>
          <div className="click-indicator">
           
          </div>
        </div>
      ))}
    </div>
    </>
  );
};

export default GiftCategories;