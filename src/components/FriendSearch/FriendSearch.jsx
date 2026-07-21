import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./FriendSearch.css";

function FriendSearch({ onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);

  // Focus input on mount & handle click outside to close
  useEffect(() => {
    searchRef.current?.focus();
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.closest(".friend-search-modal")) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!query.trim()) {
      setResults([]);
      setError("");
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      await searchUsers(query.trim());
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  async function searchUsers(q) {
    setLoading(true);
    setError("");

    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      const response = await axios.get("http://localhost:3000/friend/search", {
        params: { q },
        headers: { Authorization: `Bearer ${stored.token}` }
      });

      if (response.data.success) {
        setResults(response.data.users);
        if (response.data.users.length === 0) {
          setError("No users found");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function sendFriendRequest(recipientId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.post(
        "http://localhost:3000/friend/request",
        { recipientId },
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      // Update local state to show "pending"
      setResults(prev =>
        prev.map(u =>
          u.id === recipientId ? { ...u, friendStatus: "pending" } : u
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send friend request");
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case "pending":
        return <span className="fs-badge fs-badge-pending">Pending</span>;
      case "accepted":
        return <span className="fs-badge fs-badge-accepted">Friends</span>;
      default:
        return null;
    }
  }

  return (
    <div className="friend-search-overlay" onClick={onClose}>
      <div className="friend-search-modal" onClick={e => e.stopPropagation()}>
        <div className="fs-header">
          <h3>Add Friend</h3>
          <button className="fs-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="fs-input-wrapper" ref={searchRef}>
          <svg className="fs-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            className="fs-input"
            placeholder="Search by username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <div className="fs-spinner"></div>}
        </div>

        <div className="fs-results">
          {error && !loading && (
            <div className="fs-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p>{error}</p>
            </div>
          )}

          {results.map(user => (
            <div key={user.id} className="fs-user-card">
              <div className="fs-user-avatar">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="fs-user-info">
                <span className="fs-user-name">{user.displayName}</span>
                <span className="fs-user-tag">@{user.username}</span>
              </div>
              <div className="fs-user-actions">
                {getStatusBadge(user.friendStatus)}
                {user.friendStatus === "none" && (
                  <button
                    className="fs-add-btn"
                    onClick={() => sendFriendRequest(user.id)}
                    title="Send friend request"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Add Friend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendSearch;