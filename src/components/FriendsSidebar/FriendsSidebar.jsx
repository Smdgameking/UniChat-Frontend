import { useState, useEffect } from "react";
import axios from "axios";
import "./FriendsSidebar.css";

function FriendsSidebar({ selectedServer, onSelectChannel, selectedChannelId, onSelectFriend, selectedFriendId }) {
  const [channels, setChannels] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedServer) {
      if (selectedServer.id === "friends") {
        fetchFriends();
      } else {
        fetchChannels();
      }
    } else {
      setChannels([]);
      setFriends([]);
      setLoading(false);
    }
  }, [selectedServer]);

  async function fetchChannels() {
    if (!selectedServer || selectedServer.id === "friends") return;

    try {
      setLoading(true);
      setError("");
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      const response = await axios.get(
        `http://10.119.79.91:3000/server/${selectedServer.id}/channels`,
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      if (response.data.success) {
        setChannels(response.data.channels || []);
        setFriends([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load channels");
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFriends() {
    try {
      setLoading(true);
      setError("");
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      const response = await axios.get("http://10.119.79.91:3000/friend/list", {
        headers: { Authorization: `Bearer ${stored.token}` }
      });

      if (response.data.success) {
        setFriends(response.data.friends || []);
        setChannels([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load friends");
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }

  function getChannelIcon(channel) {
    // Text channel icon
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
    // Voice channel icon
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
      </div>

      <div className="friends-list">
        {loading && (
          <div className="friends-loading">Loading...</div>
        )}

        {error && !loading && (
          <div className="friends-error">{error}</div>
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
        {!loading && !error && selectedServer.id === "friends" && friends.length === 0 && (
          <div className="friends-empty">
            <p>No friends yet</p>
            <p className="friends-empty-subtitle">Add friends to start chatting</p>
          </div>
        )}

        {!loading && !error && selectedServer.id === "friends" && friends.map(friend => (
          <button
            key={friend.id}
            className={`friend-button ${selectedFriendId === friend.id ? 'active' : ''}`}
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
        ))}
      </div>
    </div>
  );
}

export default FriendsSidebar;