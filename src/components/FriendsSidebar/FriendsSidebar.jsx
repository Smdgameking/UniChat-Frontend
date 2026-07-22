import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { getErrorMessage } from "../../utils/errorHandler";
import { fetchFriends, fetchFriendRequests } from "../../store/slices/friendSlice";
import FriendSearch from "../FriendSearch/FriendSearch.jsx";
import "./FriendsSidebar.css";

function FriendsSidebar({ selectedServer, onSelectChannel, selectedChannelId, onSelectFriend, selectedFriendId }) {
  const dispatch = useDispatch();
  const { friends: reduxFriends, friendRequests } = useSelector((state) => state.friends);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFriendSearch, setShowFriendSearch] = useState(false);

  useEffect(() => {
    if (selectedServer) {
      if (selectedServer.id === "friends") {
        dispatch(fetchFriends());
        dispatch(fetchFriendRequests());
      } else {
        fetchChannels();
      }
    } else {
      setChannels([]);
      setLoading(false);
    }
  }, [selectedServer, dispatch]);

  async function fetchChannels() {
    if (!selectedServer || selectedServer.id === "friends") return;

    try {
      setLoading(true);
      setError("");
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      const response = await axios.get(
        `http://localhost:3000/server/${selectedServer.id}/channels`,
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      if (response.data.success) {
        setChannels(response.data.channels || []);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load channels"));
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }

  async function acceptRequest(requestId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.post(
        `http://localhost:3000/friend/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );
      dispatch(fetchFriendRequests());
      dispatch(fetchFriends());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request");
    }
  }

  async function rejectRequest(requestId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.post(
        `http://localhost:3000/friend/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );
      dispatch(fetchFriendRequests());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
    }
  }

  async function removeFriend(friendId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.delete(
        `http://localhost:3000/friend/${friendId}`,
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );
      dispatch(fetchFriends());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove friend");
    }
  }

  function getChannelIcon(channel) {
    if (channel.type === "text" || !channel.type) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9h16"/>
          <path d="M4 15h16"/>
          <path d="M10 3L8 21"/>
          <path d="M16 3l-2 18"/>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    );
  }

  function getStatusColor(status) {
    switch (status) {
      case "online":
        return "#23a559";
      case "away":
        return "#f0b232";
      case "dnd":
        return "#f23f43";
      default:
        return "#80848e";
    }
  }

  if (!selectedServer) {
    return (
      <div className="friends-sidebar">
        <div className="friends-sidebar-header">
          <span className="friends-sidebar-title">Select a Server</span>
        </div>
        <div className="friends-list">
          <div className="friends-empty">
            <p>Select a server from the left sidebar</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-sidebar">
      <div className="friends-sidebar-header">
        <span className="friends-sidebar-title">
          {selectedServer.id === "friends" ? "Friends" : selectedServer.name}
        </span>
        {selectedServer.id === "friends" && (
          <button
            className="friends-add-btn"
            onClick={() => setShowFriendSearch(true)}
            title="Add Friend"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </button>
        )}
      </div>

      <div className="friends-list">
        {loading && (
          <div className="friends-loading">Loading...</div>
        )}

        {error && !loading && (
          <div className="friends-error">{error}</div>
        )}

        {/* Pending friend requests */}
        {!loading && !error && selectedServer.id === "friends" && friendRequests.length > 0 && (
          <div className="friend-requests-section">
            <div className="friend-requests-header">
              <span>Friend Requests</span>
              <span className="requests-count">{friendRequests.length}</span>
            </div>
            {friendRequests.map(request => (
              <div key={request.id} className="friend-request-card">
                <div className="friend-avatar">
                  {request.requester.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="friend-info">
                  <span className="friend-name">{request.requester.displayName}</span>
                  <span className="friend-username">@{request.requester.username}</span>
                </div>
                <div className="friend-request-actions">
                  <button
                    className="request-btn accept"
                    onClick={() => acceptRequest(request.id)}
                    title="Accept"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </button>
                  <button
                    className="request-btn reject"
                    onClick={() => rejectRequest(request.id)}
                    title="Reject"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show channels for non-friends servers */}
        {!loading && !error && selectedServer.id !== "friends" && channels.length === 0 && (
          <div className="friends-empty">
            <p>No channels yet</p>
          </div>
        )}

        {!loading && !error && selectedServer.id !== "friends" && channels.map(channel => (
          <button
            key={channel.id}
            className={`friend-button channel-button ${selectedChannelId === channel.id ? 'active' : ''}`}
            onClick={() => onSelectChannel(channel)}
            title={channel.name}
          >
            <span className="channel-icon">
              {getChannelIcon(channel)}
            </span>
            <span className="friend-name">{channel.name}</span>
          </button>
        ))}

        {/* Show friends for Friends server */}
        {!loading && !error && selectedServer.id === "friends" && reduxFriends.length === 0 && (
          <div className="friends-empty">
            <p>No friends yet</p>
            <p className="friends-empty-subtitle">Add friends to start chatting</p>
          </div>
        )}

        {!loading && !error && selectedServer.id === "friends" && reduxFriends.map(friend => (
          <div
            key={friend.id}
            className={`friend-button ${selectedFriendId === friend.id ? 'active' : ''}`}
          >
            <button
              className="friend-button-inner"
              onClick={() => onSelectFriend(friend)}
              title={friend.displayName}
            >
              <div className="friend-avatar">
                {friend.displayName?.charAt(0).toUpperCase() || '?'}
                <span 
                  className="friend-status-dot" 
                  style={{ backgroundColor: getStatusColor(friend.status) }}
                />
              </div>
              <div className="friend-info">
                <span className="friend-name">{friend.displayName}</span>
                <span className="friend-username">@{friend.username}</span>
              </div>
            </button>
            <button
              className="friend-remove-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Remove ${friend.displayName} from friends?`)) {
                  removeFriend(friend.id);
                }
              }}
              title="Remove friend"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {showFriendSearch && (
        <FriendSearch onClose={() => setShowFriendSearch(false)} />
      )}
    </div>
  );
}

export default FriendsSidebar;
