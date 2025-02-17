import axios from "axios";

const API_URL = "http://localhost:8000/api/brands";

export const getBrands = async (params?: { name?: string }) => {
  return await axios.get(API_URL, { params });
};



export const getBrandsById = async (id: number) => {
  return await axios.get(`${API_URL}/${id}`);
};


// Tạo mới Brand
export const createBrand = async (data: FormData) => {
  return await axios.post(API_URL, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export const updateBrand = async (id: number, data: FormData) => {
  return await axios.post(`${API_URL}/${id}?_method=PUT`, data, {

    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteBrands = async (id: number) => {
  return await axios.delete(`${API_URL}/${id}`);
};

