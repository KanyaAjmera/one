import axios from "axios";
import { NODE_API_URL } from "@/config";

const api = axios.create({
  baseURL: `${NODE_API_URL}/api/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // The middleware expects Bearer token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
