import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://10.119.79.91:3000/auth/login",
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://10.119.79.91:3000/auth/register",
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

export const completeProfile = createAsyncThunk(
  "auth/completeProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = JSON.parse(localStorage.getItem("unichat_user") || "{}").token;
      const response = await axios.post(
        "http://10.119.79.91:3000/user/complete-profile",
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Profile update failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("unichat_user") 
      ? JSON.parse(localStorage.getItem("unichat_user")).user 
      : null,
    isAuthenticated: !!localStorage.getItem("unichat_user"),
    profileIncomplete: localStorage.getItem("unichat_user")
      ? JSON.parse(localStorage.getItem("unichat_user")).profileIncomplete
      : false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.profileIncomplete = false;
      localStorage.removeItem("unichat_user");
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.profileIncomplete = action.payload.profileIncomplete || false;
        
        localStorage.setItem("unichat_user", JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          profileIncomplete: action.payload.profileIncomplete || false,
        }));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.profileIncomplete = action.payload.profileIncomplete || false;
        
        localStorage.setItem("unichat_user", JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          profileIncomplete: action.payload.profileIncomplete || false,
        }));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Profile
      .addCase(completeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload.user };
        state.profileIncomplete = false;
        
        const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
        localStorage.setItem("unichat_user", JSON.stringify({
          ...stored,
          user: state.user,
          profileIncomplete: false,
        }));
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;