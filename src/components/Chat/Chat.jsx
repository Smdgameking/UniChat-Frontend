import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { socket, socketService } from "../../services/socket";
import { setTypingUser, removeTypingUser, addMessage, setConnectionStatus } from "../../store/slices/chatSlice";
import "./Chat.css";

function Chat({ selectedServer, selectedChannel, selectedFriend }) {
  const dispatch = useDispatch();
  const { messages: reduxMessages, typingUsers, isConnected } = useSelector((state) => state.chat);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [localTyping, setLocalTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Connect socket on mount
  useEffect(() => {
    socketService.connect();
    dispatch(setConnectionStatus(socket.connected));

    const handleConnect = () => dispatch(setConnectionStatus(true));
    const handleDisconnect = () => dispatch(setConnectionStatus(false));

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socketService.disconnect();
    };
  }, [dispatch]);

  // Listen for incoming messages
  useEffect(() => {
    const handleNewMessage = (message) => {
      // Only add message if it's for current chat
      if (selectedFriend && message.friendId === selectedFriend.id) {
        dispatch(addMessage(message));
      } else if (selectedChannel && message.channelId === selectedChannel.id) {
        dispatch(addMessage(message));
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [dispatch, selectedFriend, selectedChannel]);

  // Listen for typing indicators
  useEffect(() => {
    const handleTyping = (data) => {
      const { userId, userName, type } = data;
      if (type === "friend" && selectedFriend && userId === selectedFriend.id) {
        dispatch(setTypingUser({ userId, userName }));
      } else if (type === "channel" && selectedChannel && data.channelId === selectedChannel.id) {
        dispatch(setTypingUser({ userId, userName }));
      }
    };

    const handleStopTyping = (data) => {
      const { userId } = data;
      dispatch(removeTypingUser(userId));
    };

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [dispatch, selectedFriend, selectedChannel]);

  // Join/leave rooms when selection changes
  useEffect(() => {
    if (selectedChannel) {
      socketService.joinChannel(selectedChannel.id);
      return () => socketService.leaveChannel(selectedChannel.id);
    } else if (selectedFriend) {
      socketService.joinFriendChat(selectedFriend.id);
      return () => socketService.leaveFriendChat(selectedFriend.id);
    }
  }, [selectedChannel, selectedFriend]);

  useEffect(() => {
    if (selectedChannel || selectedFriend) {
      fetchMessages();
    } else {
      // Clear messages when no selection
      dispatch(setMessages([]));
    }
  }, [selectedChannel, selectedFriend, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function fetchMessages() {
    if (!selectedChannel && !selectedFriend) return;

    try {
      setLoading(true);
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      let endpoint = "";

      if (selectedFriend) {
        endpoint = `http://10.119.79.91:3000/chat/friend/${selectedFriend.id}/messages`;
      } else if (selectedChannel) {
        endpoint = `http://10.119.79.91:3000/chat/channel/${selectedChannel.id}/messages`;
      }

      // Placeholder: Uncomment when API is ready
      // const response = await axios.get(endpoint, {
      //   headers: { Authorization: `Bearer ${stored.token}` }
      // });
      // dispatch(setMessages(response.data.messages));

      // Mock messages for demonstration
      const mockMessages = selectedFriend ? [
        {
          id: 1,
          senderId: selectedFriend.id,
          senderName: selectedFriend.displayName,
          content: "Hey! How are you?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: 2,
          senderId: "me",
          senderName: "You",
          content: "I'm doing great! Thanks for asking.",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: true
        }
      ] : [
        {
          id: 1,
          senderId: "user1",
          senderName: "User 1",
          content: `Welcome to #${selectedChannel.name}!`,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true
        },
        {
          id: 2,
          senderId: "user2",
          senderName: "User 2",
          content: "This is a great channel!",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        }
      ];
      
      dispatch(setMessages(mockMessages));
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedChannel && !selectedFriend) || sending) return;

    try {
      setSending(true);
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      let endpoint = "";

      if (selectedFriend) {
        endpoint = `http://10.119.79.91:3000/chat/friend/${selectedFriend.id}/messages`;
      } else if (selectedChannel) {
        endpoint = `http://10.119.79.91:3000/chat/channel/${selectedChannel.id}/messages`;
      }

      // Prepare message object
      const messageData = {
        content: newMessage.trim()
      };

      // Send via HTTP to store in database
      let savedMessage = null;
      try {
        const response = await axios.post(
          endpoint,
          messageData,
          { headers: { Authorization: `Bearer ${stored.token}` } }
        );
        
        if (response.data.success) {
          savedMessage = response.data.message;
        }
      } catch (err) {
        console.error("Failed to save message to server:", err);
        // Continue with socket even if HTTP fails
      }

      // Try to send via socket for real-time delivery
      if (isConnected) {
        if (selectedFriend) {
          socketService.sendFriendMessage(selectedFriend.id, newMessage.trim());
        } else if (selectedChannel) {
          socketService.sendChannelMessage(selectedChannel.id, newMessage.trim());
        }
      }

      // Use saved message from server or create local message
      const message = savedMessage || {
        id: Date.now(),
        senderId: "me",
        senderName: "You",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };

      dispatch(addMessage(message));
      setNewMessage("");
      
      // Stop typing indicator
      if (selectedFriend) {
        socketService.sendStopTyping(selectedFriend.id, "friend");
      } else if (selectedChannel) {
        socketService.sendStopTyping(selectedChannel.id, "channel");
      }
      setLocalTyping(false);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(err.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  // Handle typing indicator
  function handleTyping() {
    if (!localTyping && (selectedChannel || selectedFriend)) {
      setLocalTyping(true);
      
      if (selectedFriend) {
        socketService.sendTyping(selectedFriend.id, "friend");
      } else if (selectedChannel) {
        socketService.sendTyping(selectedChannel.id, "channel");
      }
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setLocalTyping(false);
        if (selectedFriend) {
          socketService.sendStopTyping(selectedFriend.id, "friend");
        } else if (selectedChannel) {
          socketService.sendStopTyping(selectedChannel.id, "channel");
        }
      }, 3000);
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  }

  if (!selectedChannel && !selectedFriend) {
    return (
      <div className="chat-container">
        <div className="chat-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>Welcome to UniChat</h3>
          <p>Select a channel or friend to start chatting</p>
          {!isConnected && (
            <p className="connection-status">Connecting to server...</p>
          )}
        </div>
      </div>
    );
  }

  const messages = reduxMessages;

  const chatTarget = selectedFriend || selectedChannel;
  const chatTitle = selectedFriend 
    ? selectedFriend.displayName 
    : `#${selectedChannel.name}`;
  const chatSubtitle = selectedFriend
    ? `@${selectedFriend.username}`
    : selectedServer?.name;

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-header-avatar">
            {selectedFriend 
              ? selectedFriend.displayName?.charAt(0).toUpperCase() || '?'
              : '#'}
          </div>
          <div className="chat-header-details">
            <h3>{chatTitle}</h3>
            <span className="chat-header-status">
              {chatSubtitle}
              {isConnected && <span className="online-indicator">● Connected</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="chat-no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`chat-message ${msg.senderId === "me" ? "own-message" : "friend-message"}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.senderName}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                  {msg.senderId === "me" && msg.read && (
                    <span className="read-receipt">✓✓</span>
                  )}
                </div>
                <p className="message-text">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="typing-text">
            {Object.values(typingUsers).map(u => u.userName).join(", ")} {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
          </span>
        </div>
      )}

      {/* Message Input */}
      <form className="chat-input-area" onSubmit={sendMessage}>
        <input
          type="text"
          className="chat-input"
          placeholder={
            selectedFriend 
              ? `Message @${selectedFriend.username}...`
              : `Message #${selectedChannel?.name}...`
          }
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          disabled={sending}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={!newMessage.trim() || sending}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chat;
