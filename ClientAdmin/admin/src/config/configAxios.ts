import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; 

export const instance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    }
});

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn("⚠️ Không tìm thấy token trong localStorage");
        }
        return config;
    },
    (error) => Promise.reject(error)
);
