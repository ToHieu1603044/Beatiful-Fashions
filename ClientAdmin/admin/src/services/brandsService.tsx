import axios from "axios";

const API_URL = "http://localhost:8000/api/brands";

// Lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

export const getBrands = async (params?: { name?: string }) => {
  const token = getAuthToken();
  return await axios.get(API_URL, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getBrandsById = async (id: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

// Tạo mới Brand
export const createBrand = async (data: FormData) => {
  const token = getAuthToken();
  return await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const updateBrand = async (id: number, data: FormData) => {
  const token = getAuthToken();
  return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const deleteBrands = async (id: number) => {
  const token = getAuthToken();
  return await axios.delete(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
