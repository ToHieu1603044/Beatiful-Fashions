import axios from "axios";
import Swal from "sweetalert2";
// Định nghĩa base URL API
const API_BASE_URL = "http://127.0.0.1:8000/api";

const getAuthToken = () => localStorage.getItem("access_token");
const token = getAuthToken();
export const getProducts = async (params?: {
  search?: string;
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
export const getProductSales = async (params?: { search?: string; parent_id?: number }) => {
  return await axios.get(`${API_BASE_URL}/flash-sales-web`, { params });
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
export const registerUser = async (data: any) => {
  const token = localStorage.getItem("access_token"); // Lấy token từ localStorage
  return await axios.post("http://127.0.0.1:8000/api/register", data, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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

// Hàm đổi mật khẩu


export const changePassword = async (data: { old_password: string; password: string; password_confirmation: string }) => {
  const token = localStorage.getItem("access_token"); // Đồng nhất với các API khác
  return await axios.post(`${API_BASE_URL}/resetPassword`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



// Định nghĩa kiểu dữ liệu cho thông tin user
interface UserProfileUpdate {
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

export const updateUserProfile = async (updatedData: UserProfileUpdate) => {
  const token = localStorage.getItem("access_token");

  return axios.put(
    `${API_BASE_URL}/update-profile`,  
    updatedData, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
};


export const getCart = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/carts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const getDiscount = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/redeem-points`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
export const handleRedeemVoucher = async (voucherId: number) => {
  const token = getAuthToken();

  try {
    const response = await axios.post(
      `${API_BASE_URL}/redeem-points-for-voucher`,
      { discount_id: voucherId }, 
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    if (response.status === 200 || response.status === 201) {
  
      Swal.fire({
        title: "🎉 Đổi voucher thành công!",
        text: `Mã giảm giá của bạn: ${response.data.discount_code}`,
        icon: "success",
        confirmButtonText: "OK",
      });

      return response.data;
    }
  } catch (error: any) {
    console.error("Lỗi khi đổi voucher:", error.response?.data || error.message);

    Swal.fire({
      title: "❌ Lỗi!",
      text: error.response?.data?.message || "Không thể đổi voucher.",
      icon: "error",
      confirmButtonText: "Thử lại",
    });

    throw error.response?.data || error;
  }
};
export const getDiscountForUser = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/list-discount-for-user`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}
export const exportPdf = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/orders/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: "blob"  // Đảm bảo response trả về dạng blob
  });
};
export const exportPdfUser = async (id: number) => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/pdf-invoice/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: "blob"  
  });
};

export const getCartCount = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/carts/count-cart`, {
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
export const fetchNotifications = async () => {
  const token = getAuthToken();
  return await axios.get(`${API_BASE_URL}/notifications`, {
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

export const fetchDashboardData = async (startDate, endDate) => {
  const token = getAuthToken();
  const params = {};

  // Only include date parameters if both startDate and endDate are provided
  if (startDate && endDate) {
    params.start_date = startDate;
    params.end_date = endDate;
  } else {
    params.time_range = "all"; 
  }

  try {
    const { data } = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      params,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return data;
  } catch (error) {
    throw error; // Propagate error to the caller for handling in the component
  }
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
export const getMaintenanceStatus = async () => {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.get(`${API_BASE_URL}/maintenance`,{
      headers
  });
};

export const fetchDiscountOptions = async () => {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.get(`${API_BASE_URL}/discounts/usegeder`,{
      headers
  });
};

export const ratings = async (data: any) => {
  const token = getAuthToken();
  
  if (!data) {
    throw new Error("Data is required");
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const response = await axios.post(
      `${API_BASE_URL}/ratings`,
      { data }, // payload, cần đảm bảo `data` được cấu hình đúng
      { headers }
    );
    return response.data; // Trả về dữ liệu từ response
  } catch (error) {
    console.error("Error submitting rating:", error);
    throw error; // Ném lỗi ra ngoài để có thể xử lý ở nơi gọi hàm
  }
};
export const updateSystemSettings = async (data: any) => {
  try {
    // Lấy token từ localStorage hoặc cookie (tùy vào cách bạn lưu token)
    const token = getAuthToken();
    
    // Kiểm tra xem token có tồn tại không
    if (!token) {
      throw new Error('Token không hợp lệ hoặc hết hạn.');
    }

    // Thiết lập header Authorization với token
    const headers = { Authorization: `Bearer ${token}` };

    // Gửi yêu cầu PUT để cập nhật cài đặt hệ thống
    const response = await axios.put(`${API_BASE_URL}/system-settings`, data, {
      headers,
      withCredentials: true, // Đảm bảo cookie được gửi đi (nếu cần)
    });

    // Trả về dữ liệu từ response (nếu cần)
    return response.data;

  } catch (error) {
    console.error("Lỗi khi cập nhật cài đặt hệ thống:", error);

    // Xử lý lỗi chi tiết nếu có
    if (error.response) {
      // Lỗi từ phía server (ví dụ 500, 404)
      console.error("Lỗi từ server:", error.response.data);
      throw new Error(error.response.data.message || 'Lỗi từ server.');
    } else if (error.request) {
      // Lỗi không nhận được phản hồi (ví dụ mất kết nối)
      console.error("Không nhận được phản hồi từ server:", error.request);
      throw new Error('Không nhận được phản hồi từ server.');
    } else {
      // Lỗi phát sinh trong quá trình thiết lập yêu cầu
      console.error("Lỗi khi thiết lập yêu cầu:", error.message);
      throw new Error(error.message);
    }
  }
};


export const getAvgProduct = async (id: number) => {
  const token = getAuthToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.get(`${API_BASE_URL}/avg-rating/${id}`, { headers });
}


