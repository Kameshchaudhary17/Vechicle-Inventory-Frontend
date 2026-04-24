import axios from "axios";
import { env } from "../../config/env";
import { STORAGE_KEYS } from "../../constants";

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.accessToken);
      localStorage.removeItem(STORAGE_KEYS.user);
    }
    return Promise.reject(err);
  }
);
