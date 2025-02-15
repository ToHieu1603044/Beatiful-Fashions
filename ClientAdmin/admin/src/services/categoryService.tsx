import axios from "axios";

const API_URL = "http://localhost:8000/api/categories";

export const getCategories = async () => {
  return await axios.get(API_URL);
};

export const getCategory = async (id: number) => {
  return await axios.get(`${API_URL}/${id}`);
};

export const createCategory = async (data: { name: string; parent_id?: number | null }) => {
    return await axios.post("http://localhost:8000/api/categories", data);
  };
  
export const updateCategory = async (id: number, data: []) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

export const deleteCategory = async (id: number) => {
  return await axios.delete(`${API_URL}/${id}`);
};
