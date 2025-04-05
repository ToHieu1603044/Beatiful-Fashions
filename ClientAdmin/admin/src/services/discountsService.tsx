import axios from "axios";

const API_URL = "http://localhost:8000/api/discounts";

// Lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

export const getDiscounts = async (page: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}?page=${page}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};


export const getCategoryById = async (id: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const createDiscount = async (data: any) => {
  const token = getAuthToken();
  return await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "application/json", 
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};


export const updateCategory = async (id: number, data: FormData) => {
  const token = getAuthToken();
  return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export const deleteCategory = async (id: number) => {
  const token = getAuthToken();
  return await axios.delete(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
