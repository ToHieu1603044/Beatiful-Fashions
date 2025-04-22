import React, { useEffect, useState } from "react";
import { Table,Select , Button, Modal } from "antd";
import { getOrderReturns } from "../../../services/orderService";
import axios from "axios";

const OrderReturn: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const statusOptions = [
      { value: "pending", label: "Chờ xử lý" },
      { value: "approved", label: "Chấp nhận" },
      { value: "rejected", label: "Từ chối" },
      { value: "received", label: "Đã nhận" },
      { value: "refunded", label: "Đã hoàn tiền" },
      { value: "completed", label: "Hoàn tất" },
  ];
  const getAvailableStatusOptions = (currentStatus: string) => {
    const statusFlow: { [key: string]: string[] } = {
        pending: ["approved", "rejected"],
        approved: ["received"],
        received: ["refunded"],
        refunded: ["completed"],
        rejected: [],
        completed: [],
    };

    const allowed = statusFlow[currentStatus] || [];
    return statusOptions.filter(option => allowed.includes(option.value));
};

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const response =  await axios.patch(`http://127.0.0.1:8000/api/order-returns/${id}/status`, { status: newStatus });
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            )
        );

        if(response.status === 200){
            console.log("Cập nhật trạng thái thanh cong");
        }
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
    }
};
  
    const fetchOrders = async () => {
        try {
            const response = await getOrderReturns();
            console.log("Danh sách đơn hàng hoàn:", response.data.data);
            setOrders(response.data.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        }
    };

    const showOrderDetails = (order: any) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Tên khách hàng", dataIndex: ["order", "name"], key: "name" },
        { title: "Số điện thoại", dataIndex: ["order", "phone"], key: "phone" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: any) => (
                <Select
                    value={status}
                    onChange={(newStatus) => updateStatus(record.id, newStatus)}
                    style={{ width: 150 }}
                    options={getAvailableStatusOptions(status)}
                />
            ),
          },
          
        {
            title: "Hành động",
            key: "action",
            render: (record: any) => (
                <Button type="primary" onClick={() => showOrderDetails(record)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="container mt-4">
            <h2>Danh sách đơn hàng hoàn</h2>
            <Table dataSource={orders} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />

            {/* Modal hiển thị chi tiết đơn hàng */}
            <Modal
                title="Chi tiết đơn hàng hoàn"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
            >
                {selectedOrder && (
                    <>
                        <h3>Thông tin khách hàng</h3>
                        <p><b>Tên:</b> {selectedOrder.order?.name}</p>
                        <p><b>Email:</b> {selectedOrder.order?.email}</p>
                        <p><b>SĐT:</b> {selectedOrder.order?.phone}</p>
                        <p><b>Địa chỉ:</b> {selectedOrder.order?.address}, {selectedOrder.order?.district}, {selectedOrder.order?.city}</p>

                        <h3>Sản phẩm trong đơn hàng</h3>
                        <Table
                            dataSource={selectedOrder.order?.order_details || []}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },
                                {
                                    title: "Biến thể",
                                    key: "variants",
                                    render: (item: any) => {
                                        const variants = item.variant_details ? JSON.parse(item.variant_details) : {};
                                        return Object.entries(variants)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(", ") || "Không có biến thể";
                                    },
                                },
                                { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                                {
                                    title: "Giá",
                                    dataIndex: "price",
                                    key: "price",
                                    render: (price: number) =>
                                        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                                },
                                {
                                    title: "Tổng cộng",
                                    key: "total",
                                    render: (item: any) =>
                                        (item.quantity * item.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                                },
                            ]}
                        />

                        <h3>Sản phẩm hoàn trả</h3>
                        <Table
                            dataSource={selectedOrder.return_items || []}
                            rowKey="id"
                            pagination={false}
                            columns={[
                                { title: "ID sản phẩm hoàn", dataIndex: "id", key: "id" },
                                {
                                    title: "Tên sản phẩm",
                                    key: "product_name",
                                    render: (_: any, record: any) => {
                                        const detail = selectedOrder.order?.order_details.find(
                                            (d: any) => d.id === record.order_detail_id
                                        );
                                        return detail?.product_name || "N/A";
                                    },
                                },
                                { title: "Số lượng hoàn", dataIndex: "quantity", key: "quantity" },
                                {
                                    title: "Tiền hoàn",
                                    dataIndex: "refund_amount",
                                    key: "refund_amount",
                                    render: (amount: number) =>
                                        Number(amount).toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
                                },
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default OrderReturn;
