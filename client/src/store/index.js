import { configureStore } from "@reduxjs/toolkit";
import moduleSlice from "./slices/ModuleSlice";

const store = configureStore({
  reducer: {
    modules: moduleSlice,
  },
});

export default store;
