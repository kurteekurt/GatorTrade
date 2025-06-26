import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { marked } from "marked";
import "../css/message.css";

// Configure marked to render links correctly
const renderer = new marked.Renderer();

renderer.link = function (href, _title, text) {
  const safeHref = typeof href === 'string' ? href : href?.href || '#';
  const safeText = typeof text === 'string' && text.trim() !== '' ? text : href?.text || safeHref;
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
};

marked.setOptions({ renderer });

const Message = () => {
  const { listingId, sellerId, buyerId } = useParams();
  const navigate = useNavigate();

  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [otherUserName, setOtherUserName] = useState("User");
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const sessionRes = await fetch("/auth/session");
        if (!sessionRes.ok) throw new Error("Not logged in");
        const sessionData = await sessionRes.json();
        const userId = sessionData.user.id;
        setCurrentUserId(userId);

        const isBuyer = String(userId) === String(buyerId);
        const isSeller = String(userId) === String(sellerId);
        if (!isBuyer && !isSeller) {
          console.warn("Not authorized to view this conversation.");
          navigate("/");
          return;
        }

        const otherId = isBuyer ? sellerId : buyerId;
        setOtherUserId(otherId);

        const userRes = await fetch(`/auth/user/${otherId}`);
        if (!userRes.ok) throw new Error("Failed to fetch other user");
        const userData = await userRes.json();
        const fullName = `${userData.first_name} ${userData.last_name}`;
        setOtherUserName(fullName);
      } catch (err) {
        console.error("Session or name fetch error:", err);
        navigate("/login");
      }
    };

    fetchUserInfo();
  }, [navigate, buyerId, sellerId]);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      const user1 = currentUserId;
      const user2 =
        currentUserId === Number(buyerId) ? Number(sellerId) : Number(buyerId);

      try {
        const res = await fetch(`/messages/${user1}/${user2}/${listingId}`);
        if (!res.ok) throw new Error("Failed to fetch messages.");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [currentUserId, listingId, buyerId, sellerId]);

  const senderId = Number(currentUserId);
  const receiverId =
    senderId === Number(sellerId) ? Number(buyerId) : Number(sellerId);

  const sendMessage = async () => {
    if (input.trim() === "" || !senderId || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender_id: senderId,
          receiver_id: receiverId,
          content: input,
          listing_id: listingId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender_id: senderId,
            receiver_id: receiverId,
            content: input,
            timestamp: new Date().toISOString(),
          },
        ]);
        setInput("");
      } else {
        console.error("Message not sent:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setTimeout(() => setIsSending(false), 500);
    }
  };

  useEffect(() => {
    const box = document.getElementById("chat-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <>
      <div className="message-layout">
        <div className="chat-area">
          <div className="chat-header">
            Chat with{" "}
            {otherUserId ? (
              <Link to={`/profile/${otherUserId}`} className="chat-profile-link">
                {otherUserName}
              </Link>
            ) : (
              otherUserName
            )}
          </div>

          <div className="chat-box" id="chat-box">
            {loadingMessages ? (
              <div className="loading-animation">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="no-messages">No messages yet.</div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = Number(msg.sender_id) === Number(currentUserId);
                const isLast = idx === messages.length - 1;
                return (
                  <div
                    key={idx}
                    className={`message ${isMine ? "customer" : "seller"} ${isLast ? "fade-in" : ""}`}
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(String(msg.content)),
                    }}
                  />
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSending) sendMessage();
            }}
            className="input-area"
          >
            <button
              type="button"
              className="location-button"
              onClick={() =>
                navigate("/Confirmation", {
                  state: {
                    listingId,
                    sellerId,
                    buyerId,
                    senderId,
                    receiverId,
                  },
                })
              }
            >
              Set Up Location
            </button>
            <input
              type="text"
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="location-button"
              disabled={isSending}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <footer className="foot">© 2025 Gator Trade - Group 8</footer>
    </>
  );
};

export default Message;