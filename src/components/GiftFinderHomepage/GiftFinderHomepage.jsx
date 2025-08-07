import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './GiftFinderHomePage.css';
import Header2 from '../Header2/Header2';

const recipients = [
  {
    id: 'anne',
    name: 'Anne',
    icon: '👩',
    categories: [
      {
        id: 'yemek-yapmak',
        name: 'Yemek Yapmak',
        subcategories: [
          { id: 'pasta-tatli', name: 'TÜM MUTFAK ÜRÜNLERİ ', path: '/anne/yemek-yapmak/pasta-tatli' },
      
        ]
      },
     
     {
        id: 'dikis',
        name: 'Dikiş',
        subcategories: [
          { id: 'dikis', name: 'DİKİŞ ÜRÜNLERİ', path: '/anne/dikis/dikis' },
         
        ]
      }
    ]
  },
  {
    id: 'baba',
    name: 'Baba',
    icon: '👨',
    categories: [
      {
        id: 'otomobil-esyalari',
        name: 'Otomobil Eşyaları',
        subcategories: [
          { id: 'arac-ici', name: 'TÜM ARAÇ EŞYALARI', path: '/baba/otomobil/Arac' },
          
        ]
      }
    ]
  },
   {
    id: 'büyükbaba',
    name: 'BüyükBaba',
    icon: '👨',
    categories: [
      {
        id: 'otomobil-esyalari',
        name: 'Nostaljik Ürünler',
        subcategories: [
          { id: 'arac-ici', name: 'TÜM ÜRÜNLER', path: '/buyukbaba/nostalji/nostalji' },
          
        ]
      }
    ]
  }
];

const GiftFinderHomePage = () => {
  const navigate = useNavigate();
  const [openRecipient, setOpenRecipient] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const recipientRef = useRef();
  const categoryRef = useRef();
  const subRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (recipientRef.current && !recipientRef.current.contains(e.target)) setOpenRecipient(false);
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setOpenCategory(false);
      if (subRef.current && !subRef.current.contains(e.target)) setOpenSub(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setOpenCategory(false);
    setOpenSub(false);
  }, [selectedRecipient]);

  useEffect(() => {
    setSelectedSubcategory(null);
    setOpenSub(false);
  }, [selectedCategory]);

  const handleSearch = () => {
    if (selectedRecipient && selectedCategory && selectedSubcategory) {
      navigate(selectedSubcategory.path);
    }
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setOpenSub(false);
  };

  return (
    <>
   <Header2></Header2>
    <div className="gift-finder-wrapper">
      <h1 className="title">🎁 Hediye Öneri Sistemi</h1>

      <div className="dropdown-row">
        {/* Kime */}
        <div className="dropdown" ref={recipientRef}>
          <button
            className="trigger"
            onClick={() => {
              setOpenRecipient(o => !o);
              setOpenCategory(false);
              setOpenSub(false);
            }}
          >
            <span>{selectedRecipient ? selectedRecipient.name : 'Kime alacaksınız?'}</span>
            <ChevronDown className="icon" />
          </button>
          {openRecipient && (
            <div className="menu">
              {recipients.map(r => (
                <div
                  key={r.id}
                  className={`item ${selectedRecipient?.id === r.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedRecipient(r);
                    setOpenRecipient(false);
                  }}
                >
                  <span className="emoji">{r.icon}</span> {r.name}
                  <ChevronRight className="small-icon" />
                </div>
              ))}
            </div>
          )}
        </div>

       
        <div className={`dropdown ${!selectedRecipient ? 'disabled' : ''}`} ref={categoryRef}>
          <button
            className="trigger"
            onClick={() => {
              if (!selectedRecipient) return;
              setOpenCategory(o => !o);
              setOpenSub(false);
            }}
            disabled={!selectedRecipient}
          >
            <span>{selectedCategory ? selectedCategory.name : 'Kategori seçin'}</span>
            <ChevronDown className="icon" />
          </button>
          {openCategory && selectedRecipient && (
            <div className="menu">
              {selectedRecipient.categories.map(c => (
                <div
                  key={c.id}
                  className={`item ${selectedCategory?.id === c.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(c);
                    setOpenCategory(false);
                  }}
                >
                  {c.name}
                  <ChevronRight className="small-icon" />
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className={`dropdown ${!selectedCategory ? 'disabled' : ''}`} ref={subRef}>
          <button
            className="trigger"
            onClick={() => {
              if (!selectedCategory) return;
              setOpenSub(o => !o);
            }}
            disabled={!selectedCategory}
          >
            <span>{selectedSubcategory ? selectedSubcategory.name : 'Alt kategori seçin'}</span>
            <ChevronDown className="icon" />
          </button>
          {openSub && selectedCategory && (
            <div className="menu">
              {selectedCategory.subcategories?.map(s => (
                <div
                  key={s.id}
                  className={`item ${selectedSubcategory?.id === s.id ? 'selected' : ''}`}
                  onClick={() => handleSubcategorySelect(s)}
                >
                  {s.name}
                  <ChevronRight className="small-icon" />
                </div>
              ))}
              {!selectedCategory.subcategories && (
                <div className="item disabled-text">Alt kategori yok</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="selection-summary">
        <div>
          <strong>Seçimler:</strong>{' '}
          {selectedRecipient ? selectedRecipient.name : '—'} {'>'}{' '}
          {selectedCategory ? selectedCategory.name : '—'} {'>'}{' '}
          {selectedSubcategory ? selectedSubcategory.name : '—'}
        </div>
        <button
          className="confirm-btn"
          onClick={handleSearch}
          disabled={!(selectedRecipient && selectedCategory && selectedSubcategory)}
        >
          Ara
        </button>
      </div>

    
      
      </div>
  
     </>
  );
};

export default GiftFinderHomePage;