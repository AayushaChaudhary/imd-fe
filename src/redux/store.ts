import { configureStore } from "@reduxjs/toolkit";
import recommendationsReducer from "./features/recommendationsSlice";
import authReducer from "./features/authSlice";
import { setupAuthInterceptor } from "../lib/api";

export const store = configureStore({
  reducer: {
    recommendations: recommendationsReducer,
    auth: authReducer,
  },
});

setupAuthInterceptor(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
