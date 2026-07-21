import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import chatSlice from "./slices/chatSlice";
import serverSlice from "./slices/serverSlice";
import friendSlice from "./slices/friendSlice";
import uiSlice from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    chat: chatSlice,
    server: serverSlice,
    friends: friendSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for socket instances
        ignoredActions: ["socket/connect", "socket/disconnect"],
      },
    }),
});

export default store;