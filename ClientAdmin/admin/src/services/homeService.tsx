import axios from "axios";

const API_URL_PRODUCT = "http://127.0.0.1:8000/api/products/web";
const API_URL_CATEGORY = "http://127.0.0.1:8000/api/categories/web";
const API_URL_PRODUCTWCATEGORY = "http://127.0.0.1:8000/api/products/categories";
export const getProducts = async (params?: { search?: string; category_id?: string; brand?: string; date?: string; price?: number; mix_price?: number; max_price: number; priceRange?: string }) => {
  return await axios.get(API_URL_PRODUCT, { params });
};


export const getProductById = async (id: number) => {
  return await axios.get(`${API_URL_PRODUCT}/${id}`);
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
    return await axios.get(`${API_URL_PRODUCTWCATEGORY}/${id}`, { params });
  };
  
export const getCategories = async (params?: { search?: string; parent_id?: number }) => {
    return await axios.get(API_URL_CATEGORY, { params });
};
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/login", {
      email,
      password,
    });

    return response.data; // Trả về dữ liệu từ API
  } catch (error: any) {
    throw error.response?.data || "Lỗi đăng nhập!";
  }
};
  
  export const getCategoryById = async (id: number) => {
    return await axios.get(`${API_URL_CATEGORY}/${id}`);
  };