import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers, sendFriendRequest, fetchFriends } from "../../store/slices/friendSlice";
import "./FriendSearch.css";

function FriendSearch({ onClose }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef(null);
  const timeoutRef = useRef(null);
  const dispatch = useDispatch();
  const searchResults = useSelector((state) => state.friends.searchResults);

  // Focus input on mount & handle click outside to close
  useEffect(() => {
    searchRef.current?.focus();
    function handleClickOutside() {
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
      setError("");
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      const result = await dispatch(searchUsers(query.trim()));
      if (searchUsers.rejected.match(result)) {
        setError(result.payload || "Search failed");
      }
      setLoading(false);
    }, 400);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, dispatch]);

  async function handleSendFriendRequest(recipientId) {
    try {
      await dispatch(sendFriendRequest(recipientId)).unwrap();
      await dispatch(fetchFriends());
    } catch (err) {
      alert(err || "Failed to send friend request");
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

  const users = query.trim() ? searchResults : [];

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
          {error && !loading && query.trim() && (
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

          {users.map(user => (
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
                    onClick={() => handleSendFriendRequest(user.id)}
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
