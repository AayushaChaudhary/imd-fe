import axios, { type InternalAxiosRequestConfig } from "axios";
import type { EnhancedStore } from "@reduxjs/toolkit";
import type { RootState } from "../redux/store"; // Import only the type

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const setupAuthInterceptor = (store: EnhancedStore<RootState>) => {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

export default api;
