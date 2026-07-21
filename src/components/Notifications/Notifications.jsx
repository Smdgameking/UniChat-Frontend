import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Notifications.css";

function Notifications({ onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.closest(".notifications-panel")) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function fetchNotifications() {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      const response = await axios.get("http://10.119.79.91:3000/notification", {
        headers: { Authorization: `Bearer ${stored.token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        const count = response.data.unreadCount;
        setUnreadCount(count);
        if (onUnreadCountChange) onUnreadCountChange(count);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.patch(
        `http://10.119.79.91:3000/notification/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.delete(
        `http://10.119.79.91:3000/notification/${notificationId}`,
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      const notif = notifications.find(n => n._id === notificationId);
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  }

  async function acceptFriendRequest(notificationId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.post(
        `http://10.119.79.91:3000/notification/friend/${notificationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      // Remove the notification from the list
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept friend request");
    }
  }

  async function rejectFriendRequest(notificationId) {
    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      await axios.post(
        `http://localhost:3000/notification/friend/${notificationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${stored.token}` } }
      );

      // Remove the notification from the list
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject friend request");
    }
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "friend_request":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        );
      case "friend_accepted":
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
    }
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="notifications-panel" ref={notifRef}>
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="notifications-unread-badge">{unreadCount}</span>
        )}
      </div>

      <div className="notifications-list">
        {loading && (
          <div className="notifications-loading">Loading...</div>
        )}

        {error && !loading && (
          <div className="notifications-error">{error}</div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notifications-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <p>No notifications yet</p>
          </div>
        )}

        {notifications.map(notif => (
          <div
            key={notif._id}
            className={`notification-item ${!notif.read ? "unread" : ""}`}
            onClick={() => !notif.read && markAsRead(notif._id)}
          >
            <div className="notification-icon">
              {getNotificationIcon(notif.type)}
            </div>

            <div className="notification-content">
              <p className="notification-message">{notif.message}</p>
              <span className="notification-time">{formatTime(notif.createdAt)}</span>

              {notif.type === "friend_request" && (
                <div className="notification-actions">
                  <button
                    className="notif-btn notif-accept"
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptFriendRequest(notif._id);
                    }}
                  >
                    Accept
                  </button>
                  <button
                    className="notif-btn notif-reject"
                    onClick={(e) => {
                      e.stopPropagation();
                      rejectFriendRequest(notif._id);
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

            <button
              className="notification-delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notif._id);
              }}
              title="Delete notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notifications;