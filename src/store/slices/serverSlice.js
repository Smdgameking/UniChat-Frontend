import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const fetchServers = createAsyncThunk(
  "server/fetchServers",
  async (_, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.get(
        "http://10.119.79.91:3000/server/list",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.servers;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch servers");
    }
  }
);

export const fetchChannels = createAsyncThunk(
  "server/fetchChannels",
  async (serverId, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.get(
        `http://10.119.79.91:3000/server/${serverId}/channels`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { serverId, channels: response.data.channels };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch channels");
    }
  }
);

export const createServer = createAsyncThunk(
  "server/createServer",
  async (serverData, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        "http://10.119.79.91:3000/server/create",
        serverData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create server");
    }
  }
);

export const joinServer = createAsyncThunk(
  "server/joinServer",
  async (inviteCode, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        "http://10.119.79.91:3000/server/join",
        { inviteCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.server;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to join server");
    }
  }
);

const serverSlice = createSlice({
  name: "server",
  initialState: {
    servers: [],
    currentServer: null,
    channels: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentServer: (state, action) => {
      state.currentServer = action.payload;
    },
    clearCurrentServer: (state) => {
      state.currentServer = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Servers
      .addCase(fetchServers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.loading = false;
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Channels
      .addCase(fetchChannels.fulfilled, (state, action) => {
        const { serverId, channels } = action.payload;
        state.channels[serverId] = channels;
      })
      // Create Server
      .addCase(createServer.fulfilled, (state, action) => {
        state.servers.push(action.payload);
      })
      // Join Server
      .addCase(joinServer.fulfilled, (state, action) => {
        const server = action.payload;
        if (!state.servers.find(s => s.id === server.id)) {
          state.servers.push(server);
        }
      });
  },
});

export const { setCurrentServer, clearCurrentServer, clearError } = serverSlice.actions;
export default serverSlice.reducer;