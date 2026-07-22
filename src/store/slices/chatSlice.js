import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchChannelMessages = createAsyncThunk(
  "chat/fetchChannelMessages",
  async (channelId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.get(
        `http://localhost:3000/chat/channel/${channelId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);

export const fetchFriendMessages = createAsyncThunk(
  "chat/fetchFriendMessages",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.get(
        `http://localhost:3000/chat/friend/${friendId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.messages;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch messages");
    }
  }
);

export const sendChannelMessage = createAsyncThunk(
  "chat/sendChannelMessage",
  async ({ channelId, content }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        `http://localhost:3000/chat/channel/${channelId}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

export const sendFriendMessage = createAsyncThunk(
  "chat/sendFriendMessage",
  async ({ friendId, content }, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        `http://localhost:3000/chat/friend/${friendId}/messages`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    currentChannel: null,
    currentFriend: null,
    typingUsers: {}, // { userId: { userName, timestamp } }
    loading: false,
    error: null,
    isConnected: false,
  },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
      state.currentFriend = null;
      state.messages = [];
      state.typingUsers = {};
    },
    setCurrentFriend: (state, action) => {
      state.currentFriend = action.payload;
      state.currentChannel = null;
      state.messages = [];
      state.typingUsers = {};
    },
    clearChat: (state) => {
      state.currentChannel = null;
      state.currentFriend = null;
      state.messages = [];
      state.typingUsers = {};
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setTypingUser: (state, action) => {
      const { userId, userName } = action.payload;
      state.typingUsers[userId] = {
        userName,
        timestamp: Date.now(),
      };
    },
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      delete state.typingUsers[userId];
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Channel Messages
      .addCase(fetchChannelMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChannelMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChannelMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Friend Messages
      .addCase(fetchFriendMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriendMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchFriendMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Channel Message
      .addCase(sendChannelMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      // Send Friend Message
      .addCase(sendFriendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const {
  setCurrentChannel,
  setCurrentFriend,
  clearChat,
  addMessage,
  setMessages,
  setTypingUser,
  removeTypingUser,
  setConnectionStatus,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;