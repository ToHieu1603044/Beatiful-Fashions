import axios  from "axios";

const API_URL = "http://localhost:8000/api"

const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");   // Gui kem token luu o storage khi dang nhap 
  
    return token ? { Authorization: `Bearer ${token}` } : {};
  };


export const getOrders = async (params: { is_paid?: boolean; tracking_status?: string }) => {
  
    console.log("Gửi request với params:", params); 
    return await axios.get(`${API_URL}/orders`, {
      params,  
      headers: getAuthHeader(),
    });
  };
  export const getSlide = async () => {
    const token = localStorage.getItem("access_token");
    return await axios.get(`${API_URL}/slides`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  };

export const getOrder = async (id:number) =>{ // lay ra mot don hang theo id
    try {
        return await axios.get(`${API_URL}/orders/${id}`,
            {headers: getAuthHeader()});
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
} 
export const updateOrderStatus = async (id: number, tracking_status: string) => {
    try {
        const response = await axios.put(
            `${API_URL}/orders/${id}/update-status`,
            { tracking_status: tracking_status }, 
            { headers: getAuthHeader() }
        );
        console.log("Response from backend:", tracking_status, id);
        return response.data;
    } catch (error: any) {
        console.error("Lỗi cập nhật trạng thái:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
};

export const confirmOrder = async (orderId: number) => {
    return await axios.put(`/orders/${orderId}/confirm-order`, {}, {
      headers: getAuthHeader(),
    });
  };

  export const updateOrder = async (orderId: number, data: any) => {
    return await axios.put(`/orders/${orderId}`, data);
  };
  export const fetchReturnDetails = async (orderId: number) => {
  
      return  await axios.get(`${API_URL}/orders/${orderId}/return-details`, {
        headers: getAuthHeader(),
      });
};
export const getOrderReturns = async ()=>{

    return await axios.get(`${API_URL}/orders/returns`, {
        headers: getAuthHeader(),
      });
}

export const getOrderReturnUser = async ()=>{

  return await axios.get(`${API_URL}/orders/returns/user`, {
      headers: getAuthHeader(),
    });
}
export const applyPoints = async (data: any) => {

  return await axios.post(`${API_URL}/orders/apply-points`, data, {
    headers: getAuthHeader(),
  });
}
  