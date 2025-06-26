import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import { useLocation, Link } from 'react-router-dom';
import '../css/listing.css';

function Listing() {
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minPrice, setMinPrice] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const {
    category = '',
    query = '',
  } = location.state || {};

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        minPrice,
        maxPrice,
        category,
        query,
        sortBy,
      });

      const response = await fetch(`/items/search?${params.toString()}`);
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error('❌ Filter error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleApplyFilters();
  }, [category, query]);

  return (
    <>
      <div className='flex'>
      <section className="introduction">
        <h3>Results:</h3>
        <div className="filter-bar">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Listings</option>
          </select>

          <div className="price-filter">
            <label>Max Price</label>
            <div className="price-slider">
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
            <div className="price-value">${maxPrice}</div>
          </div>

          <button className="filter-button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </section>

      {loading ? (
        <div className="loading-container">
          <p className="loading-text">Loading search results...</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <p className="description">
            {items.length} result{items.length !== 1 ? 's' : ''} found
          </p>
          <section className="grid-section">
            {items.map((item) => (
              <div className="image-box" key={item.id}>
                <Link to={`/item/${item.id}`} className="clickable-overlay" />
                <img
                  src={`images/${item.image_url || 'Placeholder_img.png'}`}
                  alt={item.title}
                />
                <div className="description">
                  <strong>{item.title}</strong><br />
                  ${!isNaN(Number(item.price)) ? Number(item.price).toFixed(2) : 'N/A'}<br />
                </div>
              </div>
            ))}
          </section>
        </>
      ) : (
        <p className="description">No results found.</p>
      )}
      </div>
    </>
  );
}

export default Listing;