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
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { addAuth, removeAuth, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;

export const authSelector = (state) => state.authReducer;