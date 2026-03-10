import axios from "axios";

// Backend API URL (must be HTTPS)
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://delightful-bravery-production-49cc.up.railway.app";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor (attach token automatically)
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
  (error) => Promise.reject(error)
);

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {

      if (error.response.status === 401) {
        console.error("Unauthorized: Token invalid or expired");
      }

      else if (error.response.status === 404) {
        console.error("API endpoint not found:", error.config?.url);
      }

      else if (error.response.status === 500) {
        console.error("Server error:", error.response.data);
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