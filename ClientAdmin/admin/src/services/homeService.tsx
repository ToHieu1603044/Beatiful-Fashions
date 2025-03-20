import axios from "axios";

// Định nghĩa base URL API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () => localStorage.getItem("access_token");
const token = getAuthToken();
export const getProducts = async (params?: {
  search?: string;
  category_id?: string;
  brand?: string;
  date?: string;
  price?: number;
  min_price?: number;
  max_price?: number;
  price_range?: string
}) => {
  return await axios.get(`${API_BASE_URL}/products/web`, { params });
};

export const getProductById = async (id: number) => {
  return await axios.get(`${API_BASE_URL}/products/web/${id}`);
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
  return await axios.get(`${API_BASE_URL}/products/categories/${id}`, { params });
};

// API Danh mục
export const getCategories = async (params?: { search?: string; parent_id?: number }) => {
  return await axios.get(`${API_BASE_URL}/categories/web`, { params });
};

export const getCategoryById = async (id: number) => {
  return await axios.get(`${API_BASE_URL}/categories/web/${id}`);
};

// API Đăng nhập
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

    // Lưu token vào localStorage
    if (response.data.access_token) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("accessToken", response.data.access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
    }

    return response.data;
  } catch (error: any) {
    throw error.response?.data || "Lỗi đăng nhập!";
  }
};
export const registerUser = async (name: string, email: string, password: string, password_confirmation: string, phone?: string, address?: string, city?: string, district?: string, ward?: string, zip_code?: string) => {
  const token = localStorage.getItem("access_token"); // Lấy token từ localStorage
  return await axios.post("http://127.0.0.1:8000/api/users",
    { name, email, password, password_confirmation, phone, address, city, district, ward, zip_code },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
};

// API lấy thông tin người dùng
export const getUserProfile = async () => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token không hợp lệ");
  }

  return await axios.get(`${API_BASE_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getCart = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/carts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const deleteCartItem = async (id: number) => {
  const token = getAuthToken();
  return await axios.delete(`${API_BASE_URL}/carts/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const updateCart = async (data: any, id: number) => {
  const token = getAuthToken();
  return await axios.put(`${API_BASE_URL}/carts/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const storeCart = async (data: any) => {
  const token = getAuthToken();
  return axios.post(`${API_BASE_URL}/carts`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}
export const fetchNotifications  = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/notifications`,{
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const updateNotificationStatus = async (id: number) => {
  try {
      const token = getAuthToken();
      if (!token) throw new Error("Token không tồn tại");

      const response = await axios.post(
          `${API_BASE_URL}/notifications/${id}/read`, 
          {}, // Không cần dữ liệu body
          {
              headers: { Authorization: `Bearer ${token}` }
          }
      );

      return response.data;
  } catch (error: any) {
      console.error("Lỗi cập nhật thông báo:", error.response?.data || error.message);
      throw error;
  }
};

export const deleteNotification = async (id: number) => {
  const token = getAuthToken();
  return await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
const ELASTICSEARCH_URL = "http://localhost:9200/products/_search?pretty";

export const searchProducts = async (query: string) => {
  try {
    const response = await axios.post(ELASTICSEARCH_URL, {
      query: {
        match: {
          name: query,
        },
      },
    });
    console.log(response.data.hits.hits);
    return response.data.hits.hits;
  } catch (error) {
    console.error("Lỗi tìm kiếm sản phẩm:", error);
    return [];
  }
};

export const fetchOrders = async (params: { is_paid?: boolean; tracking_status?: string }) => {
  const token = getAuthToken();

  console.log("Gửi request với params:", params); // Log để kiểm tra params

  const { data } = await axios.get(`${API_BASE_URL}/orders/list`, { 
    params,  
    headers: token ? { Authorization: `Bearer ${token}` } : {} 
  });

  console.log("Dữ liệu trả về từ API:", data); // Log dữ liệu nhận về

  return data;
};

export const fetchDashboardData = async () => {
  const token = getAuthToken();
  const { data } = await axios.get(`${API_BASE_URL}/dashboard/stats`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  return data;
};

export const fetchRevenueData = async (type = "daily") => {
  try {
    const token = getAuthToken(); // Lấy token nếu có
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get(`${API_BASE_URL}/dashboard/revenue`, {
      params: { type },
      headers, 
    });
    console.log(response.data)

    return response.data;
  } catch (error) {
    console.error("Lỗi fetchRevenueData:", error);
    return {
      error: true,
      message: error.response?.data?.message || "Lỗi khi lấy dữ liệu doanh thu",
      data: [],
    };
  }
};

export const returnOrderAPI = async (orderId: number, items: any[]) => {
  const token = getAuthToken();
  return await axios.post(
    `${API_BASE_URL}/orders/${orderId}/return`, 
    { items }, 
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
};






