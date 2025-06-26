import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../css/otherStyle.css';
import RedirectIfLoggedIn from '../components/RedirectIfLoggedIn';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [validFields, setValidFields] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    const newValidFields = { ...validFields };

    if (name === 'firstName' || name === 'lastName') {
      newValidFields[name] = value.trim().length > 0;
    }

    if (name === 'email') {
      newValidFields.email = value.endsWith('@sfsu.edu') || value.endsWith('@mail.sfsu.edu');
    }

    if (name === 'password') {
      newValidFields.password = value.length >= 6;
      newValidFields.confirmPassword =
        updatedFormData.confirmPassword.length >= 6 &&
        updatedFormData.confirmPassword === value;
    }

    if (name === 'confirmPassword') {
      newValidFields.confirmPassword =
        value.length >= 6 && value === updatedFormData.password;
    }

    setValidFields(newValidFields);
  };

  const getStarColor = (field) => {
    return validFields[field] ? 'green' : 'red';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedTerms || !acceptedPrivacy) {
      alert("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: 'user'
        })
      });

      const resultText = await response.text();
      let result;
      try {
        result = JSON.parse(resultText);
      } catch {
        console.error('Non-JSON response:', resultText);
        alert('Unexpected server response.');
        return;
      }

      if (!response.ok) {
        alert(result.error || 'Registration failed');
      } else {
        alert('Registration successful!');
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration error:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <RedirectIfLoggedIn>
      <div className="page-container">
        <div className="page-content">
          <section className="signin-section">
            <div className="signin-card">
              <h2>Create an Account</h2>
              <form onSubmit={handleSubmit} className="signin-form">
                <label htmlFor="firstName">
                  First Name <span style={{ color: getStarColor('firstName') }}>*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="lastName">
                  Last Name <span style={{ color: getStarColor('lastName') }}>*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="email">
                  Email <span style={{ color: getStarColor('email') }}>*</span>{' '}
                  <span style={{ fontSize: '12px', color: '#777' }}>(school email only)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@sfsu.edu"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="password">
                  Password <span style={{ color: getStarColor('password') }}>*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="confirmPassword">
                  Confirm Password <span style={{ color: getStarColor('confirmPassword') }}>*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                {/* Checkboxes with asterisk at the end */}
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      required
                    />
                    I accept the{' '}
                    <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>{' '}
                    <span style={{ color: acceptedTerms ? 'green' : 'red' }}>*</span>
                  </label>
                </div>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={acceptedPrivacy}
                      onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                      required
                    />
                    I accept the{' '}
                    <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>{' '}
                    <span style={{ color: acceptedPrivacy ? 'green' : 'red' }}>*</span>
                  </label>
                </div>

                <button type="submit" className="signin-button">Sign Up</button>

                <p className="signup-text">
                  Already have an account? <Link to="/login">Sign in</Link>
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

export default Registration;
