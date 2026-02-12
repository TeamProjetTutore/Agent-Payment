import axios from "axios";

const API_URL = "http://localhost:5000"; // Backend FastAPI

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour le token - VERSION CORRIGÉE
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("=== INTERCEPTEUR REQUÊTE ===");
    console.log("URL:", config.url);
    console.log("Token brut:", token);
    console.log("Token type:", typeof token);
    
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Header Authorization ajouté:", `Bearer ${token.substring(0, 30)}...`);
    } else {
      console.log("❌ AUCUN TOKEN - Header NON ajouté");
    }
    
    console.log("Headers finaux:", config.headers);
    return config;
  },
  (error) => {
    console.error("❌ Erreur intercepteur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;