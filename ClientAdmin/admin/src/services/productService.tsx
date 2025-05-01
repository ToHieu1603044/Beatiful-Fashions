import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/products";

// Lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");
export const getProducts = async (params?: { 
  search?: string; 
  category_id?: number; 
  brand?: string; 
  active?: boolean; 
  date?: string; 
  price?: string; 
  min_price?: number; 
  max_price?: number; 
  price_range?: string; 
  start_date?: string;
  end_date?: string;
  from_date?: string;
  to_date?: string;
  per_page?: number; 
}) => {
  const token = getAuthToken();
  return await axios.get(API_URL, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};


export const getProductById = async (id: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const getsku = async () => { // gọi api get sku 
  const token = getAuthToken();
  return await axios.get(`${API_URL}/sku`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const updateProductStatus = async (id: number, active: number) => {
  const token = getAuthToken();
  return await axios.put(`${API_URL}/${id}/update-status`, { active }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

export const createProduct = async (data: FormData) => {
  const token = getAuthToken();
  return await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const updateProduct = async (id: number, data: FormData) => {
  const token = getAuthToken();
  return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const deleteProduct = async (id: number) => {
  const token = getAuthToken();
  return await axios.delete(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const getProductTrash = async (params?: { page?: number }) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/trash`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const restoreProduct = async (id: number) => {
  const token = getAuthToken();
  return await axios.patch(`${API_URL}/${id}/restore`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};