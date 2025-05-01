import React, { useEffect, useState } from "react";
import { Table, Select, Button, Modal, Popover, message } from "antd";
import axios from "axios";
import { getOrderReturnUser } from "../../services/orderService";

const OrderReturns = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Thêm state loading

    useEffect(() => {
        fetchOrders();
    }, []);

    // Danh sách trạng thái có thể cập nhật
    const statusOptions = [
        { value: "shipping", label: "Đã gửi hàng" },

    ];

    // Hủy đơn hàng
    const cancelOrder = async (id: number) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/api/orders/${id}/cancel`);
            if (response.status === 200) {
                fetchOrders();
                message.success("Đơn hàng đã bị hủy thành công");
            }
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            message.error("Lỗi khi hủy đơn hàng");
        }
    };

    // Cập nhật trạng thái đơn hàng
    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const response = await axios.patch(`http://127.0.0.1:8000/api/order-returns/${id}/status/user`, { status: newStatus });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === id ? { ...order, status: newStatus } : order
                )
            );

            if (response.status === 200) {
                message.success("Cập nhật trạng thái thành công");
            }
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            message.error("Lỗi cập nhật trạng thái");
        }
    };

    // Lấy danh sách đơn hàng hoàn trả
    const fetchOrders = async () => {
        setLoading(true); // Đặt loading trước khi lấy dữ liệu
        try {
            const response = await getOrderReturnUser();
            setOrders(response.data.data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
            message.error("Lỗi lấy danh sách đơn hàng");
        } finally {
            setLoading(false); // Tắt loading sau khi lấy dữ liệu
        }
    };

    // Hiển thị chi tiết đơn hàng
    const showOrderDetails = (order: any) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    // Đóng modal
    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
    };

    // Cấu hình các cột của bảng
    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Tên khách hàng", dataIndex: ["order", "name"], key: "name" },
        { title: "Số điện thoại", dataIndex: ["order", "phone"], key: "phone" },
        { title: "Email", dataIndex: ["order", "email"], key: "email" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => <span>{getStatusText(status)}</span>,
        },
        {
            title: "Tiến trình",
            key: "progress",
            render: (_: any, record: any) => {
                if (record.status === "approved") {
                    return (
                        <Select
                            value={record.status}
                            onChange={(newStatus) => updateStatus(record.id, newStatus)}
                            style={{ width: 150 }}
                            options={statusOptions}
                        />
                    );
                }

                if (record.status === "refunded") {
                    return (
                        <Button
                            type="primary"
                            onClick={() => updateStatus(record.id, "completed")}
                        >
                            Đã nhận tiền
                        </Button>
                    );
                }
                return <span>{getStatusText(record.status)}</span>;
            },
        },

        {
            title: "Hành động",
            key: "action",
            render: (record: any) => (
                <>
                    <Button type="primary" onClick={() => showOrderDetails(record)}>
                        Xem chi tiết
                    </Button>

                    <Button type="default" onClick={() => cancelOrder(record.id)}>
                        Hủy
                    </Button>
                </>
            ),
        },
    ];

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Chờ xử lý";
            case "approved": return "Đã duyệt";
            case "shipping": return "Đang gửi";
            case "received": return "Đã nhận";
            case "refunded": return "Đã hoàn tiền";
            case "completed": return "Hoàn thành";
            case "cancelled": return "Đã hủy";
            case "rejected": return "Từ chối";
            default: return status;
        }
    };

    return (
        <div className="container mt-4">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a href="/">Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item">
                        <a href="/orders">Đơn hàng</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Trả hàng
                    </li>
                </ol>
            </nav>

            <h2>Danh sách đơn hàng hoàn</h2>
            <Table
                dataSource={orders}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loading} // Thêm thuộc tính loading
            />

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
                                {
                                    title: "Lí do hoàn",
                                    dataIndex: "reason",
                                    key: "reason",
                                    render: (reason: string) => {
                                        const isLong = reason.length > 50;
                                        const shortText = reason.slice(0, 50) + '...';
                                      
                                        return (
                                          <div style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                                            {isLong ? (
                                              <Popover content={reason} title="Lý do huỷ" trigger="click">
                                                <span>{shortText} <Button type="link" size="small">Xem thêm</Button></span>
                                              </Popover>
                                            ) : (
                                              <span>{reason}</span>
                                            )}
                                          </div>
                                        );
                                    }
                                }
                            ]}
                        />
                    </>
                )}
            </Modal>
        </div>
    );
};

export default OrderReturns;
