import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* Attach token automatically */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token from localStorage:", token ? "Present" : "Missing");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Authorization header set");
  }
  return config;
});

export default api;

