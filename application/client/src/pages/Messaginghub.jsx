import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/messagehub.css";

const MessageHub = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const loadMessages = async () => {
    try {
      const res = await fetch("/messages/threads", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch threads");
      const data = await res.json();
      setMessages(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadMessages(); 

    const interval = setInterval(() => {
      loadMessages();
    }, 5000); 

    return () => clearInterval(interval); 
  }, []);

  const deleteMessage = async (id, e, msg) => {
    e.preventDefault();

    const other_user_id =
      userId !== msg.seller_id ? msg.seller_id
      : userId !== msg.buyer_id ? msg.buyer_id
      : null;

    if (!other_user_id) {
      console.warn("Cannot delete a thread with yourself. Skipping.");
      return;
    }

    const listing_id = msg.listing_id;

    try {
      const res = await fetch("/messages/thread", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ listing_id, other_user_id })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete");

      setMessages((prev) => prev.filter((m) => m.message_id !== id));
    } catch (err) {
      console.error("Failed to delete thread:", err);
    }
  };

  const visibleMessages = expanded ? messages : messages.slice(0, 2);

  return (
    <div className="hub-container">
      <h3 className="section-title">Messages</h3>
      <div className="message-list">
        {messages.length === 0 ? (
          <p className="no-messages-text">You currently have no messages.</p>
        ) : (
          visibleMessages.map((msg) => (
            <Link
              to={`/message/${msg.listing_id}/${msg.seller_id}/${msg.buyer_id}`}
              key={msg.message_id}
              className="message-item-link"
            >
              <div className="message-item read">
                <div className="profile-pic">
                 <img
                    src={msg.image_url ? `/images_profiles/${msg.image_url}` : `/nullPFP.jpg`}
                    alt="user profile"
                  />
                </div>
                <div className="message-info">
                  <strong>{`${msg.first_name} ${msg.last_name}`}</strong>
                  For {msg.listing_title}
                  <p>{msg.content?.slice(0, 100) || "No message content"}</p>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => deleteMessage(msg.message_id, e, msg)}
                >
                  Delete
                </button>
              </div>
            </Link>
          ))
        )}
      </div>

      {messages.length > 2 && (
        <button className="toggle-expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};

export default MessageHub;