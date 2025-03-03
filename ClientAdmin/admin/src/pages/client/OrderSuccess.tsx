import { useSearchParams } from "react-router-dom";

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("order_id");

    return (
        <div>
            <h2>🎉 Thanh toán thành công!</h2>
            <p>Cảm ơn bạn đã đặt hàng. Mã đơn hàng: {orderId}</p>
        </div>
    );
};

export default OrderSuccess;
