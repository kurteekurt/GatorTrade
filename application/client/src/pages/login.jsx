import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/otherStyle.css';
import RedirectIfLoggedIn from '../components/RedirectIfLoggedIn';
function Signin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
  
      const text = await response.text(); // <-- read raw text first
      console.log('📩 Raw response:', text);
  
      let data;
      try {
        data = JSON.parse(text); // try parsing as JSON
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        return alert('Server error: invalid response');
      }
  
      if (response.ok) {
        localStorage.setItem('username', data.user.name);
        navigate('/');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert('An error occurred during login. Please try again.');
    }
  };
  

  return (
    <RedirectIfLoggedIn>
      <div className="page-container">
        <div className="page-content">
          <section className="signin-section">
            <div className="signin-card">
              <h2>Sign In</h2>
              <form onSubmit={handleSubmit} className="signin-form">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@sfsu.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button type="submit" className="signin-button">Sign In</button>

                <p className="signup-text">
                  Don't have an account? <Link to="/registration">Sign up</Link>
                </p>
              </form>
            </div>
          </section>
        </div>
        <footer>
          © 2025 Gator Trade - Group 8
        </footer>
      </div>
    </RedirectIfLoggedIn>
  );
}

export default Signin;
