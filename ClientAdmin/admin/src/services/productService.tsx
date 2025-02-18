import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/products";

export const getProducts = async (params?: { search?: string; category_id?: number }) => {
  return await axios.get(API_URL, { params });
};

export const getProductById = async (id: number) => {
  return await axios.get(`${API_URL}/${id}`);
};

export const createProduct = async (data: FormData) => {
  return await axios.post(API_URL, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateProduct = async (id: number, data: FormData ) => {
  return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteProduct = async (id: number) => {
  return await axios.delete(`${API_URL}/${id}`);
};
