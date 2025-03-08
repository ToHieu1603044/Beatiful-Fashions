import axios from "axios";

// Base URL API
const API_BASE_URL = "http://127.0.0.1:8000/api";


export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      window.location.href = "/403"; // Chuyển hướng đến trang 403
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;
