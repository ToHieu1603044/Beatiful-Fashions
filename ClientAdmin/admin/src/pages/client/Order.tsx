import React, { useEffect, useState } from "react";
import { Tabs, Table, Select, Checkbox, Tag, Spin, Button, Modal, Input } from "antd";
import { fetchOrders, returnOrderAPI } from "../../services/homeService";
import { updateOrderStatus, fetchReturnDetails } from "../../services/orderService";
import { useNavigate } from "react-router-dom";
import { render } from "react-dom";
import Swal from 'sweetalert2';
import axios from "axios";
const Orders: React.FC = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("pending");
    const [activeTab, setActiveTab] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedOrderItem, setSelectedOrderItem] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [selectedReturnItems, setSelectedReturnItems] = useState<Record<number, number>>({});
    const [selectedProducts, setselectedProducts] = useState<Record<number, number>>({});
    const [returnDetailsVisible, setReturnDetailsVisible] = useState(false);
    const [returnDetails, setReturnDetails] = useState<Record<number, number>>({});
    const [loadingReturnDetails, setLoadingReturnDetails] = useState(false);
    const navigate = useNavigate();
    const [reasonModalVisible, setReasonModalVisible] = useState(false);
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === "refunded") {
            navigate("/orders/return");
        }
    };
    const showReturnModal = (order: any) => {
        setSelectedOrder(order);
        setSelectedReturnItems([]);
        setReturnModalVisible(true);
    };
    const handleRebuy = async (order: any) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/orders/rebuy-item/${order.id}`);
            if (response.status === 200) {
                await Swal.fire({
                    title: 'Mua hàng thành công',
                    text: 'Vui long kiểm tra đơn hàng',
                    icon: 'success',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Không thể mua lại đơn hàng',
                icon: 'error',
            });
        }
    };
    
    const handleSelectReturnItem = (detail: any, quantity: number) => {
        setSelectedReturnItems(prevItems => {
            const updatedItems = { ...prevItems };
            if (quantity > 0) {
                updatedItems[detail.id] = quantity;
            } else {
                delete updatedItems[detail.id];
            }
            return updatedItems;
        });
    };
    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        try {
            await updateOrderStatus(selectedOrder.id, "processing");
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === selectedOrder.id ? { ...order, shipping_status: "processing" } : order
                )
            );
            setModalVisible(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        }
    };

    const handleReturnOrder = async () => {
        const itemsToRefund = Object.entries(selectedReturnItems).map(([id, quantity]) => ({
            order_detail_id: Number(id),

            quantity: quantity
        }));

        console.log("Dữ liệu gửi lên API:", JSON.stringify({ items: itemsToRefund }, null, 2));

        try {
            const response = await returnOrderAPI(selectedOrder.id, { items: itemsToRefund });

            if (response.status === 200) {
                console.log("Hoàn trả sản phẩm thành công", response.data);
                setReturnModalVisible(false);
            }

        } catch (error) {
            console.error("Lỗi khi hoàn trả sản phẩm:", error.response?.data || error);
        }
    };
    const handleShowModal = (order: Order) => {
        setSelectedOrder(order);
        setStatus(order.shipping_status);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedOrder(null);
    };
    const handleCheckboxChange = (detail: any, checked: boolean) => {
        if (detail.return_status) return;

        setSelectedReturnItems(prevItems => {
            const updatedItems = { ...prevItems };
            if (checked) {
                updatedItems[detail.id] = 1;
            } else {
                delete updatedItems[detail.id];
            }
            return updatedItems;
        });
    };


    const handleSelectChange = (id: number, quantity: number) => {
        setSelectedReturnItems(prevItems => ({
            ...prevItems,
            [id]: quantity
        }));
    };

    useEffect(() => {
        const loadOrders = async () => {
            setLoading(true);
            try {
                const params = activeTab !== "all" ? { tracking_status: activeTab } : {};
                const response = await fetchOrders(params);
                setOrders(response.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy đơn hàng:", error);
            }
            setLoading(false);
        };

        loadOrders();
    }, [activeTab]);


    const showModal = (order: any) => {
        setSelectedOrderItem(order);
        setModalVisible(true);
    };

    const handleCancelOrder = async (orderId: number) => {
        try {
            const confirmResult = await Swal.fire({
                title: 'Bạn có chắc muốn hủy đơn hàng?',
                text: 'Hành động này không thể hoàn tác!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Hủy đơn hàng',
                cancelButtonText: 'Không'
            });

            if (confirmResult.isConfirmed) {
                const response = await updateOrderStatus(orderId, "cancelled");

                if (response.status === 200) {
                    setOrders(prevOrders =>
                        prevOrders.map(order =>
                            order.id === orderId ? { ...order, shipping_status: "cancelled" } : order
                        )
                    );

                    await Swal.fire({
                        title: 'Đã hủy!',
                        text: 'Đơn hàng đã được hủy thành công.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                }
            }

        } catch (error) {
            await Swal.fire({
                title: 'Thất bại!',
                text: 'Có lỗi xảy ra khi hủy đơn hàng.',
                icon: 'error',
                confirmButtonText: 'OK'
            });

            console.error("Lỗi khi hủy đơn hàng:", error);
        }
    };


    const trackingStatusMap: Record<string, string> = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        shipped: "Đã vận chuyển",
        delivered: "Đã giao hàng",
        cancelled: "Đã hủy",
        completed: "Hoàn thành"
    };

    const handleConfirmReceived = async (orderId: number) => {
        try {
            await updateOrderStatus(orderId, "completed");
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, tracking_status: "completed" } : order
                )
            );
        } catch (error) {
            console.error("Lỗi khi xác nhận đơn hàng đã nhận:", error);
        }
    };
    const handleClose = () => {
        setModalVisible(false);
        setSelectedOrder(null);
    };
    const transformedOrders = orders.map(order => ({
        ...order,
        product_name: order.orderdetails.map(detail => detail.product_name).join(", ")
    }));

    const columns = [
        { title: "ID", dataIndex: "id", key: "id" },
        { title: "Tên ", dataIndex: "name", key: "name" },
        {
            title: "Tổng tiền",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount: number) =>
                amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
        },
        {
            title: "Trạng thái giao hàng",
            dataIndex: "tracking_status",
            key: "tracking_status",
            render: (status: string) => trackingStatusMap[status] || "Không xác định",
        },

        {
            title: "Tên sản phẩm",
            dataIndex: "product_name",
            key: "product_name",

        },
        {
            title: "Địa chỉ ",
            key: "address",
            render: (record: any) =>
                `${record.city}-${record.district}-${record.ward}-${record.address}`.slice(0, 30) + "...",
        },

        {
            title: "Hành động", key: "action",
            render: (_: any, record: any) => (
                <div>
                    <Button type="primary" onClick={() => handleShowModal(record)}>View</Button>
                    {record.tracking_status === "pending" && (
                        <Button type="primary" danger onClick={() => handleCancelOrder(record.id)}>
                            Hủy đơn
                        </Button>
                    )}
                    {record.tracking_status === "completed" && (
                        <Button type="primary" danger onClick={() => showReturnModal(record)}>
                            Hoàn trả
                        </Button>
                    )}
                    {(record.tracking_status === "cancelled" || record.status === "cancelled") && (
                        <Button type="primary" danger onClick={() => handleRebuy(record)}>
                            Mua lại
                        </Button>
                    )}

                    {record.tracking_status === "delivered" && (
                        <Button type="primary" onClick={() => handleConfirmReceived(record.id)}>
                            Đã nhận
                        </Button>
                    )}

                </div>
            )
        }

    ];

    return (
        <div className="container mt-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a href="/">Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Đơn hàng
                    </li>
                </ol>
            </nav>

            <div>
                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                    <Tabs.TabPane tab="Tất cả" key="all" />
                    <Tabs.TabPane tab="Chờ xác nhận" key="pending" />
                    <Tabs.TabPane tab="Đang xử lý" key="processing" />
                    <Tabs.TabPane tab="Đang giao" key="shipped" />
                    <Tabs.TabPane tab="Đã giao" key="delivered" />
                    <Tabs.TabPane tab="Hoàn tất" key="completed" />
                    <Tabs.TabPane tab="Đã hủy" key="cancelled" />
                    <Tabs.TabPane tab="Trả hàng" key="refunded" />
                </Tabs>

                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table columns={columns} dataSource={transformedOrders} rowKey="id" pagination={{ pageSize: 10 }} />
                )}

                <Modal title="Chi tiết đơn hàng" open={modalVisible} onCancel={handleClose} footer={null}>
                    {selectedOrder && (
                        <div>
                            <h6>Chi tiết đơn hàng:</h6>
                            <p><strong>Người đặt:</strong> {selectedOrder.name}</p>
                            <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                            <p><strong>Email:</strong> {selectedOrder.email}</p>
                            <p><strong>Địa chỉ:</strong> {`${selectedOrder.address}, ${selectedOrder.ward}, ${selectedOrder.city}`}</p>
                            <p><strong>Tổng tiền:</strong> {selectedOrder.total_amount.toLocaleString()} VND</p>
                            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.payment_method.toUpperCase()}</p>

                            <h6>Danh sách sản phẩm:</h6>
                            <Table
                                dataSource={selectedOrder.orderdetails}
                                rowKey="id"
                                pagination={false}
                                columns={[
                                    { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },

                                    {
                                        title: "Biến thể",
                                        key: "variants",
                                        render: (item: any) =>
                                            item.variant_details
                                                ? Object.entries(item.variant_details)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(", ")
                                                : "Không có biến thể",
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
                                    {
                                        title: "Lý do hoàn hàng",
                                        key: "reason",
                                        render: (item: any) =>
                                            selectedProducts.hasOwnProperty(item.id) ? (
                                                <Input
                                                    placeholder="Nhập lý do hoàn hàng..."
                                                    value={selectedProducts[item.id]}
                                                    onChange={e => handleReasonChange(item.id, e.target.value)}
                                                />
                                            ) : (
                                                "—"
                                            ),
                                    },

                                ]}
                            />
                        </div>
                    )}
                </Modal>
                <Modal
                    title="Hoàn trả sản phẩm"
                    open={returnModalVisible}
                    onCancel={() => setReturnModalVisible(false)}
                    onOk={() => handleReturnOrder()}
                    okText="Xác nhận hoàn"
                    width={800}
                >

                    {selectedOrder && (
                        <div>
                            <h4>Chọn sản phẩm muốn hoàn:</h4>
                            <Table
                                columns={[
                                    {
                                        title: "Chọn",
                                        key: "select",
                                        render: (_: any, detail: any) => (
                                            <Checkbox
                                                disabled={!!detail.return_status}
                                                onChange={(e) => handleCheckboxChange(detail, e.target.checked)}
                                            />
                                        )
                                    },

                                    {
                                        title: "Sản phẩm", dataIndex: "product_name", key: "product_name"
                                    },
                                    {
                                        title: "Biến thể",
                                        key: "variants",
                                        render: (item: any) =>
                                            item.variant_details
                                                ? Object.entries(item.variant_details)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(", ")
                                                : "Không có biến thể",
                                    },
                                    {
                                        title: "Số lượng", dataIndex: "quantity", key: "quantity"
                                    },
                                    {
                                        title: "Giá", dataIndex: "price", key: "price",
                                    },
                                    {
                                        title: "Hoàn trả", dataIndex: "return_status", key: "return_status",
                                    },
                                    {
                                        title: "Hoàn trả",
                                        key: "return",
                                        render: (_: any, detail: any) => (
                                            <Select
                                                style={{ width: 100 }}
                                                defaultValue={0}
                                                disabled={!selectedReturnItems[detail.id]}
                                                onChange={(value) => handleSelectChange(detail.id, value)}
                                            >
                                                {[...Array(detail.quantity + 1).keys()].map(num => (
                                                    <Select.Option key={num} value={num}>{num}</Select.Option>
                                                ))}
                                            </Select>
                                        )
                                    },
                                    {
                                        title: "Hành động", key: "action",
                                        render: (_, record) => (
                                            <div>
                                                {record.shipping_status === "completed" && (
                                                    <Button type="primary" danger onClick={() => showReturnModal(record)}>
                                                        Hoàn trả
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    }
                                ]}
                                dataSource={selectedOrder.orderdetails}
                                rowKey="id"
                            />
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
};

export default Orders;
