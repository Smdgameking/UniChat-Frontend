import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.get(
        "http://localhost:3000/friend/list",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.friends;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch friends");
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  "friends/sendFriendRequest",
  async (recipientId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        `http://localhost:3000/friend/request/${recipientId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data, recipientId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send friend request");
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  "friends/acceptFriendRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        `http://localhost:3000/friend/accept/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data, requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept friend request");
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  "friends/rejectFriendRequest",
  async (requestId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        `http://localhost:3000/friend/reject/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data, requestId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject friend request");
    }
  }
);

export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (friendId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.delete(
        `http://localhost:3000/friend/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { ...response.data, friendId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove friend");
    }
  }
);

const friendSlice = createSlice({
  name: "friends",
  initialState: {
    friends: [],
    friendRequests: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Friend Request
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        const { recipientId } = action.payload;
        const friend = state.friends.find(f => f.id === recipientId);
        if (friend) {
          friend.friendStatus = "pending";
        }
      })
      // Accept Friend Request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        state.friendRequests = state.friendRequests.filter(r => r.id !== requestId);
      })
      // Reject Friend Request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        const { requestId } = action.payload;
        state.friendRequests = state.friendRequests.filter(r => r.id !== requestId);
      })
      // Remove Friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        const { friendId } = action.payload;
        state.friends = state.friends.filter(f => f.id !== friendId);
      });
  },
});

export const { clearError } = friendSlice.actions;
export default friendSlice.reducer;