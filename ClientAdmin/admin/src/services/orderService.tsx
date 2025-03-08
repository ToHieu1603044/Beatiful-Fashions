import axios  from "axios";

const API_URL = "http://localhost:8000/api"

const getAuthHeader = () => {
    const token = localStorage.getItem("access_token");   // Gui kem token luu o storage khi dang nhap 
  
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  export const getOrders = async (params?: { search?: string; page?: number }) => {  
    try {
        return await axios.get(`${API_URL}/orders`, {
            params,  
            headers: getAuthHeader(),
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
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
