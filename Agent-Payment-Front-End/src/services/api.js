import axios from "axios";

const API_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("🔍 REQUEST to:", config.url);
  console.log("   Token present:", !!token);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // console.log("✅ Authorization header set");
    
    // Debug: Show token expiry
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = now > expiry;
      
      console.log("   Token expires:", expiry.toLocaleTimeString());
      console.log("   Current time:", now.toLocaleTimeString());
      console.log("   Is expired?", isExpired);
      
      if (isExpired) {
        console.warn("⚠️ Token is expired!");
      }
    } catch (e) {
      console.error("❌ Invalid token format");
    }
  } else {
    console.warn("⚠️ No token found!");
  }
  
  return config;
});

// ADD RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.url}: ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      headersSent: error.config?.headers
    });
    
    // Handle 401
    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - Clearing token");
      localStorage.removeItem("token");
      
      // Redirect to login
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;