import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    notificationsOpen: false,
    friendSearchOpen: false,
    serverModalOpen: false,
    settingsModalOpen: false,
    theme: "dark",
    socketConnected: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleNotifications: (state) => {
      state.notificationsOpen = !state.notificationsOpen;
    },
    setNotificationsOpen: (state, action) => {
      state.notificationsOpen = action.payload;
    },
    toggleFriendSearch: (state) => {
      state.friendSearchOpen = !state.friendSearchOpen;
    },
    setFriendSearchOpen: (state, action) => {
      state.friendSearchOpen = action.payload;
    },
    toggleServerModal: (state) => {
      state.serverModalOpen = !state.serverModalOpen;
    },
    setServerModalOpen: (state, action) => {
      state.serverModalOpen = action.payload;
    },
    toggleSettingsModal: (state) => {
      state.settingsModalOpen = !state.settingsModalOpen;
    },
    setSettingsModalOpen: (state, action) => {
      state.settingsModalOpen = action.payload;
    },
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleNotifications,
  setNotificationsOpen,
  toggleFriendSearch,
  setFriendSearchOpen,
  toggleServerModal,
  setServerModalOpen,
  toggleSettingsModal,
  setSettingsModalOpen,
  setSocketConnected,
} = uiSlice.actions;

export default uiSlice.reducer;