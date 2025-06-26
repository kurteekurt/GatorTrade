import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/otherStyle.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchCategory, setSearchCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/auth/session', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUsername(data.user.name);
          setUserId(data.user.id);
          setProfileImage(data.user.image_url);
        } else {
          setIsLoggedIn(false);
          setUsername('');
          setUserId(null);
          setProfileImage('');
        }
      } catch {
        setIsLoggedIn(false);
        setUsername('');
        setUserId(null);
        setProfileImage('');
      }
    };

    fetchUser();
  }, [location]);

  const submitForm = (e) => {
    e.preventDefault();
    if (searchText.length > 40) {
      alert('Search cannot exceed 40 characters.');
      return;
    }
    navigate('/listing', {
      state: {
        category: searchCategory,
        query: searchText,
      },
    });
  };

  const toggleMenu = () => {
    const menu = document.getElementById('dropdown-menu');
    if (menu) {
      menu.classList.toggle('show');
    }
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/">SF Gator Trade</Link>
      </div>

      <div className="nav-center">
        <form className="search-container" onSubmit={submitForm}>
          <select
            className="category-select"
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="electronics">Electronics</option>
            <option value="book">Books</option>
            <option value="music">Music</option>
            <option value="movies">Movies</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
          <input
            type="text"
            className="search-bar"
            placeholder="Search for items..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button type="submit" className="search-button">🔍</button>
        </form>
      </div>

      <div className="hamburger" onClick={toggleMenu}>☰</div>

      <div className="dropdown-menu" id="dropdown-menu">
        <Link to="/create">Create Post</Link>
        {isLoggedIn ? (
          <>
            {userId && <Link to={`/profile/${userId}`}>Profile</Link>}
          </>
        ) : (
          <Link to="/login">Sign In</Link>
        )}
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <>
            <Link to="/create" className="plus-button">[Create Post]</Link>
            {userId && (
              <Link to={`/profile/${userId}`} className="profile-image-link">
                <img
                  src={profileImage ? `/images_profiles/${profileImage}` : `/nullPFP.jpg`}
                  alt="Profile"
                  className="header-profile-image"
                />
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/create" className="plus-button">[Create Post]</Link>
            <Link to="/login">Sign In</Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
