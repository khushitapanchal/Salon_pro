import axios from "axios";

// Backend API URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://delightful-bravery-production-49cc.up.railway.app";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Add token automatically to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Unauthorized: Token may be invalid or expired.");
      }
      else if (error.response.status === 404) {
        console.error("API endpoint not found:", error.config?.url);
      }
      else {
        console.error("API error:", error.response.data);
      }
    } else {
      console.error("Network error or backend not reachable:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;