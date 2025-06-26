import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/confirmationpage.css';

function Confirmation() {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const navigate = useNavigate();
  const locationHook = useLocation();

  const {
    listingId,
    sellerId,
    buyerId,
    senderId,
    receiverId,
  } = locationHook.state || {};

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
    if (e.target.value !== 'Other') {
      setCustomLocation('');
    }
  };

  const handleCustomLocationChange = (e) => {
    setCustomLocation(e.target.value);
  };

  const handleConfirm = async () => {
    const location = selectedLocation === 'Other' ? customLocation : selectedLocation;

    if (!location || !listingId || !senderId || !receiverId) {
      alert("Missing information to send location message.");
      return;
    }

    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    const message = `Would you like to meet at [${location}](${mapsUrl})?`;

    try {
      const res = await fetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiverId,
          listing_id: listingId,
          content: message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Location message sent.");
        navigate(`/message/${listingId}/${sellerId}/${buyerId}`);
      } else {
        console.error("Error sending message:", data.error);
        alert("Failed to send message.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error occurred.");
    }
  };

  return (
    <div className="confirm-body">
      <section className="confirm-container">
        <h2 className="section-title">📍 Buying Location Select</h2>

        <label htmlFor="locationList">List of Locations on Campus</label>
        <select
          id="locationList"
          className="confirm-input"
          value={selectedLocation}
          onChange={handleLocationChange}
        >
          <option value="">-- Choose a location --</option>
          <option value="SFSU Library Lobby">Library Lobby</option>
          <option value="SFSU Station Cafe">Station Cafe</option>
          <option value="SFSU Cafe Rosso">Cafe Rosso</option>
          <option value="SFSU Student Center Lobby">Student Center Lobby</option>
          <option value="SFSU University Police Department">University Police Department</option>
          <option value="Other">Other</option>
        </select>

        <div className="confirm-image">
          <img src="/SFSUMap.jpg" alt="SFSU Map" className="confirm-map" />
        </div>

        {selectedLocation === 'Other' && (
          <>
            <p className="or-text">or type in your own location:</p>
            <input
              type="text"
              placeholder="Enter a custom location"
              className="confirm-input"
              value={customLocation}
              onChange={handleCustomLocationChange}
            />
          </>
        )}

        <div className="warning-box">
          ⚠️ <strong>Warning:</strong> Please meet in a public, safe area on campus.
        </div>

        <button className="confirm-button" onClick={handleConfirm}>
          Confirm
        </button>
      </section>

      <footer className="footer-bottom">© 2025 Gator Trade - Group 8</footer>
    </div>
  );
}

export default Confirmation;