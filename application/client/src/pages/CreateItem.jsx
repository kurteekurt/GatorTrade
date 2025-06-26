import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/createitem.css';
import Header from '../components/header';

function UploadItem() {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    condition: '',
    price: '',
    location: '',
    description: '',
    images: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isValid, setIsValid] = useState({
    itemName: false,
    category: false,
    condition: false,
    price: false,
    location: false,
    description: false,
    images: false,
  });

  const navigate = useNavigate();

  const validateField = (name, value) => {
    if (name === 'price') {
      const num = parseFloat(value);
      setIsValid(prev => ({
        ...prev,
        price: value !== '' && !isNaN(num) && num <= 99999999999,
      }));
    } else {
      setIsValid(prev => ({
        ...prev,
        [name]: value !== '',
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, images: file }));
    setImagePreview(URL.createObjectURL(file));
    validateField('images', file);
  };

  const handleImagesChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 🔒 Session check before upload
    try {
      const sessionRes = await fetch('/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!sessionRes.ok) {
        navigate('/login');
        return;
      }

      const sessionData = await sessionRes.json();
      if (!sessionData.user) {
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setUploadError('');

    if (!formData.images) {
      setUploadError('An image is required!');
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('image', formData.images);
    data.append('title', formData.itemName);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('location', formData.location);
    data.append('condition', formData.condition);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: data,
        credentials: 'include', 
      });

      if (!response.ok) {
        const errorData = await response.json();
        setUploadError(errorData.error || `Upload failed. Status: ${response.status}`);
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();
      console.log('Upload success:', result);

      if (result.id) {
        navigate(`/item/${result.id}`);
      } else {
        navigate(`/`);
        console.error('Upload succeeded but no item ID was returned.');
      }
    } catch (error) {
      setUploadError('Upload failed. Make sure all fields are filled and the image is under 5MB.');
      console.error('Fetch error caught:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="upload-body">
      <h2 className="upload-section-title">📦 Upload Selling Item</h2>

      <section className="upload-container">
        <div className="upload-image-upload-section">
          <div
            className={`upload-main-image-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label htmlFor="imageInput" className="image-upload-label">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="main-image-preview" />
              ) : (
                <div className="upload-placeholder">+</div>
              )}
            </label>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              className="hidden-input"
              onChange={handleImagesChange}
            />
          </div>
          <p className="upload-note">Upload 1 image</p>
        </div>

        <div className="upload-form-section">
          <form onSubmit={handleSubmit}>
            <label>
              Item Name <span className={`required ${isValid.itemName ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <input type="text" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleInputChange} required />

            <label>
              Category <span className={`required ${isValid.category ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <select name="category" value={formData.category} onChange={handleInputChange} required>
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="book">Books</option>
              <option value="music">Music</option>
              <option value="movies">Movies</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>

            <label>
              Preferred Location <span className={`required ${isValid.location ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <select name="location" value={formData.location} onChange={handleInputChange} required>
              <option value="">Choose A Location</option>
              <option value="SFSU">SFSU</option>
              <option value="Library Lobby">Library Lobby</option>
              <option value="Cafe Rosso">Cafe Rosso</option>
              <option value="Station Cafe">Station Cafe</option>
              <option value="Student Center Lobby">Student Center Lobby</option>
              <option value="University Police Department">University Police Department</option>
            </select>

            <label>
              Price ($) <span className={`required ${isValid.price ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <input type="number" name="price" placeholder="$0.00" value={formData.price} onChange={handleInputChange} required />

            <label>
              Product Condition <span className={`required ${isValid.condition ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <select name="condition" value={formData.condition} onChange={handleInputChange} required>
              <option value="">Select Condition</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>

            <label>
              Description <span className={`required ${isValid.description ? 'valid' : 'invalid'}`}>*</span>
            </label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} required />

            <button
              type="submit"
              className="upload-publish-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>

            {uploadError && (
              <div className="upload-error-message">
                {uploadError}
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="upload-footer">© 2025 Gator Trade - Group 8</footer>
    </div>
  );
}

export default UploadItem;