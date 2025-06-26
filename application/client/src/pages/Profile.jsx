import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../css/profile.css";
import Header from "../components/header";
import MessageHub from "../pages/Messaginghub.jsx";
import ItemCard from "../components/itemCard";

const Profile = () => {
  const { userID } = useParams();
  const [user, setUser] = useState({
    name: "",
    email: "",
    imageUrl: "",
    description: "",
    rating: null,
    createdAt: "",
  });
  const [items, setItems] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [descriptionInput, setDescriptionInput] = useState("");

  const [loading, setLoading] = useState({
    profile: false,
    items: false,
    session: false,
  });

  const navigate = useNavigate();
  const isOwner = currentUserID === userID;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await fetch(`/api/profile/${userID}`, {
          credentials: "include",
        });

        if (profileRes.status === 401) {
          navigate("/login");
          return;
        }

        const profileData = await profileRes.json();
        if (profileData?.profile) {
          setUser(profileData.profile);
          setDescriptionInput(profileData.profile.description || "");
        }

        setLoading((prev) => ({ ...prev, profile: true }));

        const itemsRes = await fetch(`/items/user/${userID}`);
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
        setLoading((prev) => ({ ...prev, items: true }));
      } catch (err) {
        console.error("Failed to fetch profile or items", err);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/auth/session", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserID(data.user.id.toString());
        }
      } catch (err) {
        console.error("Error fetching session user", err);
      } finally {
        setLoading((prev) => ({ ...prev, session: true }));
      }
    };

    loadProfile();
    fetchCurrentUser();
  }, [navigate, userID]);

  const handleDeleteListing = async (listingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/items/${listingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== listingId));
      } else {
        alert("Failed to delete the listing.");
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert("Server error occurred while deleting.");
    }
  };

  const handleToggleSoldStatus = async (listingId) => {
    try {
      const res = await fetch(`/items/${listingId}/toggle-sold`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) =>
            item.id === listingId ? { ...item, status: data.status } : item
          )
        );
      } else {
        alert("Failed to update item status.");
      }
    } catch (err) {
      console.error("Error toggling item status:", err);
      alert("Server error occurred while updating item.");
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (selectedFile) formData.append("image", selectedFile);
    formData.append("description", descriptionInput);

    try {
      const res = await fetch("/api/profile/upload-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev) => ({
          ...prev,
          imageUrl: data.imageUrl || prev.imageUrl,
          description: data.description || prev.description,
        }));
        setEditMode(false);
        setSelectedFile(null);
      } else {
        console.error("Upload failed");
      }
    } catch (err) {
      console.error("Error uploading profile info:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to log out.");
    }
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const totalListed = items.length;
  const totalSold = items.filter((item) => item.status === "sold").length;

  if (!loading.profile || !loading.items || !loading.session) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

const profileImage = selectedFile
  ? URL.createObjectURL(selectedFile)
  : user.imageUrl
    ? `/images_profiles/${user.imageUrl}`
    : `/nullPFP.jpg`;

  return (
    <>
      <div className="profile-container">
        <div className="profile-top">
          <div className="profile-left">
            <div className="profile-pic">
              <img
                src={profileImage}
                alt="Profile :)"
                className="profile-image"
              />
            </div>

            <div className="profile-name">{user.name || "No Name"}</div>
            <div className="stars">
              ★
              <span className="rating-number">
                {user.rating && user.rating !== "null" ? `${user.rating}` : "Unrated"}
              </span>
            </div>

            {isOwner && (
              <div className="message-buttons">
                <button onClick={handleLogout} className="message-hub-button">
                  Log Out
                </button>
              </div>
            )}
          </div>

          <div className="about-box">
            <div className="about-header">
              <h3>About</h3>
              <span className="badge">Trusted Seller</span>
            </div>
            <p>{user.description || "Welcome to my profile page!"}</p>
            <p><strong>Email:</strong> {user.email || "No email"}</p>
            <p><strong>Member since:</strong> {formatMemberSince(user.createdAt)}</p>
            <p><strong>Total Items Listed:</strong> {totalListed}</p>
            <p><strong>Total Items Sold:</strong> {totalSold}</p>

            {isOwner && !editMode && (
              <button className="edit-button" onClick={() => setEditMode(true)}>
                Edit
              </button>
            )}

            {isOwner && editMode && (
              <form onSubmit={handleImageUpload} className="edit-profile-form">
                <label>
                  Profile Image:
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>

                <label>
                  Description:
                  <textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    rows="3"
                    style={{ width: "100%", marginTop: "10px" }}
                  />
                </label>

                <div className="edit-buttons">
                  <button type="submit">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setSelectedFile(null);
                      setDescriptionInput(user.description || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <h3 className="section-title">Selling Items</h3>
        <div className="items-grid">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isOwner={isOwner}
              onDelete={handleDeleteListing}
              onToggleSold={handleToggleSoldStatus}
            />
          ))}
          {isOwner && (
            <Link to="/create" className="item-box add-item">+</Link>
          )}
        </div>
      </div>

      {isOwner && <MessageHub userId={currentUserID} />}
     <footer className="foot">© 2025 Gator Trade - Group 8</footer>
    </>
  );
};

export default Profile;