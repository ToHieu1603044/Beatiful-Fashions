import axios from "axios";

// Định nghĩa base URL API
const API_BASE_URL = "http://127.0.0.1:8000/api";

// API Sản phẩm
export const getProducts = async (params?: { 
  search?: string; 
  category_id?: string; 
  brand?: string; 
  date?: string; 
  price?: number; 
  min_price?: number; 
  max_price?: number; 
  price_range?: string 
}) => {
  return await axios.get(`${API_BASE_URL}/products/web`, { params });
};

export const getProductById = async (id: number) => {
  return await axios.get(`${API_BASE_URL}/products/web/${id}`);
};

export const getProductByCategory = async (
  id: number, 
  params?: { 
    search?: string;
    brand?: string;
    date?: string;
    price?: number;
    min_price?: number; 
    max_price?: number; 
    price_range?: string;
  }
) => {
  return await axios.get(`${API_BASE_URL}/products/categories/${id}`, { params });
};

// API Danh mục
export const getCategories = async (params?: { search?: string; parent_id?: number }) => {
  return await axios.get(`${API_BASE_URL}/categories/web`, { params });
};

export const getCategoryById = async (id: number) => {
  return await axios.get(`${API_BASE_URL}/categories/web/${id}`);
};

// API Đăng nhập
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    
    // Lưu token vào localStorage
    if (response.data.access_token) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("accessToken", response.data.access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
    }

    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Lỗi đăng nhập!";
  }
};
export const registerUser = async (name: string, email: string, password: string) => {
  return await axios.post(`${API_BASE_URL}/register`, { name, email, password });
};

