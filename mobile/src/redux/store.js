import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./reducers/authReducer";
import { themeReducer } from "./reducers/themeReducer";

const store = configureStore({
  reducer: {
    authReducer,
    themeReducer,
  },
});

export default store;