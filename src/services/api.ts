import axios from "axios";


const api = axios.create({
  baseURL: "https://recanto-backend-production.up.railway.app",
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor para adicionar o token JWT do localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
