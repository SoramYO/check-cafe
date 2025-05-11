import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    addAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    removeAuth: (state, action) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { addAuth, removeAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const authSelector = (state) => state.authReducer;