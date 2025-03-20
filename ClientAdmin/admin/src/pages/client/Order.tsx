import React, { useEffect, useState } from "react";
import { Tabs, Table, Select, Checkbox, Tag, Spin, Button, Modal } from "antd";
import { fetchOrders, returnOrderAPI } from "../../services/homeService";
import { updateOrderStatus, fetchReturnDetails } from "../../services/orderService";

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
    const [returnDetailsVisible, setReturnDetailsVisible] = useState(false);
    const [returnDetails, setReturnDetails] = useState<Record<number, number>>({});
    const [loadingReturnDetails, setLoadingReturnDetails] = useState(false);
    const showReturnModal = (order: any) => {
        setSelectedOrder(order);
        setSelectedReturnItems([]);
        setReturnModalVisible(true);
    };

    const showReturnDetailsModal = async (orderId: number) => {
        setLoadingReturnDetails(true);
        setReturnDetailsVisible(true);

        try {
            const response = await fetchReturnDetails(orderId);
            console.log("Chi tiết hoàn trả:", response.data);
            const formattedData = response.data.return_details.map((detail: any) => ({
                id: detail.id,
                product_name: response.data.product_name,
                variant: JSON.parse(response.data.variant_details)?.Size || '-',
                quantity: detail.quantity,
                refund_amount: detail.refund_amount,
                return_date: new Date(detail.created_at).toLocaleDateString('vi-VN'),
                return_status: response.data.return_status
            }));

            setReturnDetails(formattedData);
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hoàn trả:", error);
        }
        setLoadingReturnDetails(false);
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
        if (detail.return_status) return; // Nếu sản phẩm đã yêu cầu hoàn trả, không cho chọn

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
            await updateOrderStatus(orderId, "cancelled");
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, shipping_status: "cancelled" } : order
                )
            );


        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
        }
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
        { title: "User", dataIndex: "name", key: "name" },
        {
            title: "Total Amount",
            dataIndex: "total_amount",
            key: "total_amount",
            render: (amount: number) =>
                amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
        },
        { title: "Shipping Status", dataIndex: "shipping_status", key: "shipping_status" },
        {
            title: "Tên sản phẩm",
            dataIndex: "product_name",
            key: "product_name",

        },
        {
            title: "Address",
            key: "address",
            render: (record: any) =>
                `${record.city}-${record.district}-${record.ward}-${record.address}`.slice(0, 30) + "...",
        },

        {
            title: "Hành động", key: "action",
            render: (_: any, record: any) => (
                <div>
                    <Button type="primary" onClick={() => handleShowModal(record)}>View</Button>
                    {record.shipping_status === "pending" && (
                        <Button type="primary" danger onClick={() => handleCancelOrder(record.id)}>
                            Hủy đơn
                        </Button>
                    )}
                    {record.shipping_status === "completed" && (
                        <Button type="primary" danger onClick={() => showReturnModal(record)}>
                            Hoàn trả
                        </Button>
                    )}

                    {record.shipping_status === "delivered" && (
                        <Button type="primary" onClick={() => handleConfirmReceived(record.id)}>
                            Đã nhận
                        </Button>
                    )}

                </div>
            )
        }

    ];


    return (
        <div>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
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
                                            <Button type="default" onClick={() => showReturnDetailsModal(record.id)}>
                                                Xem chi tiết hoàn trả
                                            </Button>
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

            {/* Modal chi tiết đơn hoàn */}
            <Modal
                title="Chi tiết hoàn trả"
                open={returnDetailsVisible}
                onCancel={() => setReturnDetailsVisible(false)}
                footer={null}
                width={800}
            >
                {loadingReturnDetails ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        columns={[
                            {
                                title: "Sản phẩm",
                                dataIndex: "product_name",
                                key: "product_name"
                            },
                            {
                                title: "Biến thể",
                                dataIndex: "variant",
                                key: "variant"
                            },
                            {
                                title: "Số lượng hoàn",
                                dataIndex: "quantity",
                                key: "quantity"
                            },
                            {
                                title: "Hoàn tiền",
                                dataIndex: "refund_amount",
                                key: "refund_amount",
                                render: (amount: string) => parseFloat(amount).toLocaleString("vi-VN", {
                                    style: "currency",
                                    currency: "VND"
                                })
                            },
                            {
                                title: "Ngày hoàn trả",
                                dataIndex: "return_date",
                                key: "return_date"
                            },
                            {
                                title: "Trạng thái",
                                dataIndex: "return_status",
                                key: "return_status",
                                render: (status: string) => (
                                    <Tag color={status === 'pending' ? 'gold' : 'green'}>
                                        {status === 'pending' ? 'Đang xử lý' : 'Đã hoàn trả'}
                                    </Tag>
                                )
                            }
                        ]}
                        dataSource={returnDetails}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default Orders;
