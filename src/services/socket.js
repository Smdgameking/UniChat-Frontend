import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

// Get token from localStorage
const getToken = () => {
  const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
  return stored.token;
};

// Initialize socket connection
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: {
    token: getToken()
  },
  transports: ["websocket", "polling"]
});

// Socket event handlers
export const socketEvents = {
  // Connection events
  connect: () => {
    console.log("Socket connected:", socket.id);
  },

  disconnect: (reason) => {
    console.log("Socket disconnected:", reason);
  },

  connect_error: (error) => {
    console.error("Socket connection error:", error.message);
  },

  // Chat events
  message: (message) => {
    console.log("New message received:", message);
    return message;
  },

  typing: (data) => {
    console.log("User typing:", data);
    return data;
  },

  stop_typing: (data) => {
    console.log("User stopped typing:", data);
    return data;
  },

  // User events
  user_online: (userId) => {
    console.log("User online:", userId);
    return userId;
  },

  user_offline: (userId) => {
    console.log("User offline:", userId);
    return userId;
  },

  // Notification events
  notification: (notification) => {
    console.log("New notification:", notification);
    return notification;
  }
};

// Socket service functions
export const socketService = {
  // Connect to socket server
  connect: () => {
    const token = getToken();
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
  },

  // Disconnect from socket server
  disconnect: () => {
    if (socket.connected) {
      socket.disconnect();
    }
  },

  // Check if socket is connected
  isConnected: () => {
    return socket.connected;
  },

  // Reconnect with new auth token
  reconnect: () => {
    const token = getToken();
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    }
  },

  // Join a channel room
  joinChannel: (channelId) => {
    if (socket.connected) {
      socket.emit("join_channel", { channelId });
      console.log("Joined channel:", channelId);
    }
  },

  // Leave a channel room
  leaveChannel: (channelId) => {
    if (socket.connected) {
      socket.emit("leave_channel", { channelId });
      console.log("Left channel:", channelId);
    }
  },

  // Join a friend chat room
  joinFriendChat: (friendId) => {
    if (socket.connected) {
      socket.emit("join_friend_chat", { friendId });
      console.log("Joined friend chat:", friendId);
    }
  },

  // Leave a friend chat room
  leaveFriendChat: (friendId) => {
    if (socket.connected) {
      socket.emit("leave_friend_chat", { friendId });
      console.log("Left friend chat:", friendId);
    }
  },

  // Send message to channel
  sendChannelMessage: (channelId, content) => {
    if (socket.connected) {
      socket.emit("send_channel_message", {
        channelId,
        content
      });
    }
  },

  // Send message to friend
  sendFriendMessage: (friendId, content) => {
    if (socket.connected) {
      socket.emit("send_friend_message", {
        friendId,
        content
      });
    }
  },

  // Send typing indicator
  sendTyping: (targetId, type = "channel") => {
    if (socket.connected) {
      socket.emit("typing", {
        targetId,
        type
      });
    }
  },

  // Send stop typing indicator
  sendStopTyping: (targetId, type = "channel") => {
    if (socket.connected) {
      socket.emit("stop_typing", {
        targetId,
        type
      });
    }
  },

  // Mark messages as read
  markAsRead: (messageIds) => {
    if (socket.connected) {
      socket.emit("mark_as_read", { messageIds });
    }
  }
};

// Register event listeners
export const registerSocketEvents = () => {
  Object.entries(socketEvents).forEach(([event, handler]) => {
    socket.on(event, handler);
  });
};

// Remove event listeners
export const unregisterSocketEvents = () => {
  Object.keys(socketEvents).forEach((event) => {
    socket.off(event);
  });
};

export default socket;