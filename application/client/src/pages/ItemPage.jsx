import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../css/item.css';

function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch session to get current user ID
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/auth/session');
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user.id);
        }
      } catch (err) {
        console.warn('User not logged in');
      }
    };
    fetchSession();
  }, []);

  // Fetch item + related data
  useEffect(() => {
    setItem(null);
    setSimilarItems([]);
    setRelatedItems([]);
    setLoading(true);

    async function fetchAllData() {
      try {
        const itemRes = await fetch(`/items/${id}`);
        if (!itemRes.ok) throw new Error('Item not found');
        const itemData = await itemRes.json();
        setItem(itemData);

        const similarRes = await fetch(`/items/similar?category=${encodeURIComponent(itemData.category)}&exclude=${id}`);
        const similarData = await similarRes.json();
        setSimilarItems(similarData);

        const relatedRes = await fetch('/items/random/4');
        const relatedData = await relatedRes.json();
        setRelatedItems(relatedData.filter(i => i.id.toString() !== id));
      } catch (err) {
        console.error('Error loading item page data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [id]);

  // Navigate to message with listingId, sellerId, buyerId
  const handleContactSeller = () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }
    navigate(`/message/${item.id}/${item.user_id}/${currentUserId}`);
  };

  if (loading || !item) {
    return (
      <div className="item-body">
        <div className="loading-container">
          <p className="loading-text">Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="item-body fade-in">
      <section className="item-page">
        <div className="item-layout">
          <div className="item-main">
            {/* Left Column: Image + Seller Info */}
            <div className="item-images">
              <div className="main-image">
                <img
                  src={`/images/${item.listingImage}`}
                  alt="Main Item"
                  className="item-main-img"
                />
              </div>

              <div className="seller-section-under-image">
                <div className="seller-info">
                   <img
                    src={item.userImage  ? `/images_profiles/${item.userImage }` : `/nullPFP.jpg`}
                    alt="Profile"
                    className="header-profile-image"
                  />
                      <p>
                    <Link to={`/profile/${item.user_id}`}>
                      {item.sellerName}
                    </Link>
                  </p>

                  <div className="seller-rating">
                    ⭐ {item.rating && item.rating !== 'null' ? `${item.rating} / 5` : 'Unrated'}
                  </div>
                </div>

                <div className="item-buttons">
                  {currentUserId === item.user_id ? (
                    <button
                      className="chat-seller"
                      onClick={() => navigate(`/profile/${item.user_id}`)}
                    >
                      Delete Listing?
                    </button>
                  ) : (
                    <button
                      className="chat-seller"
                      onClick={handleContactSeller}
                      disabled={item.status === 'sold' || item.status === 'pending'}
                      style={{
                        opacity: item.status === 'sold' || item.status === 'pending' ? 0.5 : 1,
                        cursor: item.status === 'sold' || item.status === 'pending' ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Contact Seller
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Item Details */}
            <div className="item-info">
              <h2>{item.title}</h2>
              <p className="item-description">{item.description}</p>
              <p className="item-description">Category: {item.category}</p>
              <p className="item-description">
                Condition: {item.item_condition || 'N/A'}
              </p>
              <p className="item-description">
                Preferred Location: {item.preferred_location || 'N/A'}
              </p>
              <p className="item-price">${Number(item.price).toFixed(2)}</p>
              <p className="item-meta">Posted on: {new Date(item.created_at).toLocaleDateString()}</p>
              <p className="item-meta">
                Status: {item.status === "approved" ? "On Sale" : item.status === "sold" ? "Sold" : item.status}
              </p>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        <h3 className="section-title">Similar Items</h3>
        <div className="recommend-row fade-in">
          {similarItems.map(sim => (
            <div className="recommend-box" key={sim.id}>
              <Link to={`/item/${sim.id}`}>
                <img
                  src={`/images/${sim.image_url || 'Placeholder_img.png'}`}
                  alt={sim.title}
                  className="recommend-image"
                />
              </Link>
            </div>
          ))}
        </div>

        {/* Related Items */}
        <h3 className="section-title">Customers Also Buy</h3>
        <div className="recommend-row fade-in">
          {relatedItems.map(rel => (
            <div className="recommend-box" key={rel.id}>
              <Link to={`/item/${rel.id}`}>
                <img
                  src={`/images/${rel.image_url || 'Placeholder_img.png'}`}
                  alt={rel.title}
                  className="recommend-image"
                />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer-bottom">© 2025 Gator Trade - Group 8</footer>
    </div>
  );
}

export default ItemPage;