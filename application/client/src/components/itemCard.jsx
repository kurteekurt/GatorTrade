import React from "react";
import { Link } from "react-router-dom";

const ItemCard = ({ item, isOwner, onDelete, onToggleSold }) => {
  const formatPrice = (price) =>
    price != null && !isNaN(Number(price)) ? `$${Number(price).toFixed(2)}` : "Price not available";

  const getStatusLabel = (status) => {
    switch (status) {
      case "sold":
        return "Sold";
      case "approved":
        return "Approved";
      default:
        return "Pending";
    }
  };

  return (
    <div className="item-box">
      <Link to={`/item/${item.id}`} className="item-link-wrapper">
        <div className="item-title">{item.title}</div>
        <div className="item-price">{formatPrice(item.price)}</div>
        <div className={`item-status ${item.status}`}>{getStatusLabel(item.status)}</div>
      </Link>

      {isOwner && (
        <div className="item-actions">
          <button className="delete-listing-btn" onClick={() => onDelete(item.id)}>Delete</button>

          {item.status !== "pending" ? (
            <button
              className="delete-listing-btn sold-btn"
              onClick={() => onToggleSold(item.id)}
            >
              {item.status === "sold" ? "Unsell?" : "Mark as Sold"}
            </button>
          ) : (
            <button
              className="delete-listing-btn sold-btn"
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
              title="Pending approval"
            >
              Pending...
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemCard;