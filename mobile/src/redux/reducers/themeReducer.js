import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: "system", // hoặc "light", "dark"
  },
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { setThemeMode } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
export const themeSelector = (state) => state.themeReducer;