import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/otherStyle.css';
import Header from '../components/header';

const SeeMoreLink = () => (
  <a href="/listing" className="see-more-link">See more</a>
);

function Index() {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [newestItems, setNewestItems] = useState([]);
  const [oldestData, setOldestItems] = useState([]);
  const [loading, setLoading] = useState(true);

const createCards = (items) => {
  return items.map((item, index) => (
    <Link to={`/item/${item.id}`} key={item.id || index} className="product-box">
    <img
      src={`/images/${item.image_url || 'Placeholder_img.png'}`}
      alt={item.title}
      className="clickable-image"
    />
    <p className="product-name">{item.title}</p>
    <p className="product-price">${Number(item.price).toFixed(2)}</p>
  </Link>
  ));
};

  const scrollButtons = [
    { label: 'Deals', category: '', query: '' },
    { label: 'Popular Picks', category: '', query: '' },
    { label: 'Books', category: 'book', query: '' },
    { label: 'Electronics', category: 'electronics', query: '' },
    { label: 'Clothing', category: 'clothing', query: '' },
    { label: 'Dorm Setup', category: 'furniture', query: '' },
    { label: 'School Supplies', category: 'supplies', query: '' }
  ];

  useEffect(() => {
    Promise.all([
      fetch('/items/random/8').then(res => res.json()),
      fetch('/items/recent/4').then(res => res.json()),
      fetch('/items/oldest/4').then(res => res.json())
    ])
    .then(([randomData, recentData, oldestData]) => {
      setFeaturedItems(randomData);
      setNewestItems(recentData);
      setOldestItems(oldestData);
    })
    .catch((err) => {
      console.error('Failed to load items:', err);
    })
    .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (category, query) => {
    navigate('/listing', {
      state: {
        category,
        query
      }
    });
  };

  return (
    <>

      <div className="scroll-menu">
        {scrollButtons.map(({ label, category, query }, index) => (
          <button
            key={index}
            className="scroll-button"
            onClick={() => handleCategoryClick(category, query)}>
            {label}
          </button>
        ))}
      </div>

      <section className="hero">
        <h3 id="welcome-text">Welcome to Gator Trade</h3>
        <div style={{ fontSize: '15px', fontWeight: 'normal' }}>
          SFSU Software Engineering Project CSC 648-848, Spring 2025. For Demonstration Only
        </div>

        <div className="hero-buttons">
          <button className="hero-button" onClick={() => navigate('/create')}>Sell An Item!</button>
        </div>
      </section>

      <main className="category-container">
        {loading ? (
          <div className="loading-container">
            <p className="loading-text">Loading items...</p>
          </div>
        ) : (
          <>
            <div className="category-row">
              <div className="category-section">
                <h3 className="category-title">🔥 Featured Items</h3>
                <div className="item-grid">
                  {createCards(featuredItems.slice(0, 4))}
                </div>
                <SeeMoreLink />
              </div>

              <div className="category-section">
                <h3 className="category-title">🆕 Newest Postings</h3>
                <div className="item-grid">
                  {createCards(newestItems)}
                </div>
                <SeeMoreLink />
              </div>
            </div>

            <div className="category-row">
              <div className="category-section">
                <h3 className="category-title">📦 Early Bird Finds</h3>
                <div className="item-grid">
                  {createCards(oldestData)}
                </div>
                <SeeMoreLink />
              </div>

              <div className="category-section">
                <h3 className="category-title">🎓 Recommend to Freshmen</h3>
                <div className="item-grid">
                  {createCards(featuredItems.sort(() => 0.5 - Math.random()).slice(0, 4))}
                </div>
                <SeeMoreLink />
              </div>
            </div>
          </>
        )}
      </main>

        <footer>
        <Link to="/TeamPage" className="footer-link">
          © 2025 Gator Trade – Meet Group 8
        </Link>
        </footer>
    </>
  );
}

export default Index;