import axios from "axios";

const API_URL = "http://localhost:8000/api/brands";

export const getBrands = async (params?: { search?: string; parent_id?: number }) => {
  return await axios.get(API_URL, { params });
};


export const getBrandsById = async (id: number) => {
  return await axios.get(`${API_URL}/${id}`);
};


export const createBrands = async (data: FormData) => {
  return await axios.post(API_URL, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

  
  export const updateCategory = async (id: number, data: FormData ) => {
    return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };
  
export const deleteBrands = async (id: number) => {
  return await axios.delete(`${API_URL}/${id}`);
};
