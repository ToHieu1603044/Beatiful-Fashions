import axios from "axios";

const API_URL = "http://localhost:8000/api/categories";

// Lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

export const getCategories = async (params?: { search?: string; parent_id?: number }) => {
  const token = getAuthToken();
  return await axios.get(API_URL, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getCategoriesTrash = async (params?: { search?: string; parent_id?: number }) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/trash`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getCategoryById = async (id: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_URL}/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const createCategory = async (data: FormData) => {
  const token = getAuthToken();
  return await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
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
export const updateCategoryStatus = (id: number, status: boolean) => {
  const token = getAuthToken();
  return axios.put(`${API_URL}/update-status-category/${id}`, { status },{
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
