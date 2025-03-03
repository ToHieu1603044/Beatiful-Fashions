import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const OrderCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const uniqueOrderId = searchParams.get("orderId");

    // Tách orderId từ uniqueOrderId (VD: "1740989375-37" → lấy "37")
    const orderId = uniqueOrderId ? uniqueOrderId.split("-").pop() : null;

    useEffect(() => {
        if (!orderId) {
            navigate("/cart");
            return;
        }
    
        axios
            .get(`http://127.0.0.1:8000/api/momo/callback?orderId=${orderId}`)
            .then((response) => {
                console.log("MoMo Callback Response:", response.data);
    
                const redirectUrl = response.data.redirect_url;
                if (redirectUrl) {
                    console.log("🔄 Chuyển hướng tới:", redirectUrl);
                    window.location.href = redirectUrl; 
                } else {
                    navigate("/order/error");
                }
            })
            .catch((error) => {
                console.error("Lỗi khi gọi API:", error);
                navigate("/order/failed");
            });
    }, [orderId, navigate]);
    

    return <div>🔄 Đang xử lý thanh toán...</div>;
};

export default OrderCallback;
