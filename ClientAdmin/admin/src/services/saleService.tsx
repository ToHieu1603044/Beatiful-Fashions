import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};


export const getSales = async (params?: { search?: string; parent_id?: number }) => {
    return await axios.get(`${API_BASE_URL}/flash-sales-web`, {
      params,
      headers: getAuthHeader(),
    });
  };

  export const getProductSales = async (params?: { search?: string; parent_id?: number }) => {
    return await axios.get(`${API_BASE_URL}/flash-sales-web`, { params });
  };
  

