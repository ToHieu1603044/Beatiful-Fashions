import React, { useEffect, useState } from "react";
import { Tabs, Table, Select, Checkbox, Tag, Spin, Button, Modal, Input, Descriptions, Divider, Space, Rate, message } from "antd";
import { fetchOrders, returnOrderAPI } from "../../services/homeService";
import { updateOrderStatus, fetchReturnDetails } from "../../services/orderService";
import { useNavigate } from "react-router-dom";
import { render } from "react-dom";
import { CheckOutlined } from '@ant-design/icons';
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
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewProduct, setReviewProduct] = useState<any>(null);
    const [ratingValue, setRatingValue] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [detailId, setDetailId] = useState();
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [returnReasons, setReturnReasons] = useState<{ [key: string]: string }>({});


    const [reasonModalVisible, setReasonModalVisible] = useState(false);
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === "refunded") {
            navigate("/orders/return");
        }
    };
    const setReason = (productId: number, reason: string) => {
        setReturnReasons(prev => ({
            ...prev,
            [productId]: reason
        }));
    };

    const handleOpenReviewModal = (productDetail: any) => {
        setReviewProduct(productDetail);
        setReviewModalVisible(true);
    };
    const handleSubmitReview = async () => {

        const token = localStorage.getItem('access_token');

        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/api/ratings",
                {
                    product_id: selectedProductId,
                    rating: ratingValue,
                    comment: reviewText,
                    order_detail_id: detailId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            console.log(res.data);
            if (res.status === 201) {
                Swal.fire("Thành công", "Đánh giá đã được gửi!", "success");
                setReviewModalVisible(false);
                setReviewText("");
                setRatingValue(5);
            }
        } catch (error) {
            console.error(error);
            if (error.response.status === 400) {
                Swal.fire("Lỗi", "Bạn đã đánh giá rồi", "error");
            }
            Swal.fire("Lỗi", "Không thể gửi đánh giá", "error");
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
                message.success(response.data.message);
                loadOrders();
        } catch (error: any) {        
            message.error(error.response.data.message);
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
          const response =  await updateOrderStatus(selectedOrder.id, "processing");
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === selectedOrder.id ? { ...order, shipping_status: "processing" } : order
                )
            );
            message.success(response.data.message);
            setModalVisible(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        }
    };

    const handleReturnOrder = async () => {
        const itemsToRefund = Object.entries(selectedReturnItems).map(([id, quantity]) => ({
            order_detail_id: Number(id),
            quantity,
            reason: returnReasons[id] || ""
        }));

        console.log("Dữ liệu gửi lên API:", JSON.stringify({ items: itemsToRefund }, null, 2));

        try {
            const response = await returnOrderAPI(selectedOrder.id, { items: itemsToRefund });

            // if (response.status === 200) {
            //     console.log("Hoàn trả sản phẩm thành công", response.data);
            //     await Swal.fire({
            //         title: 'Gửi yêu cầu hoàn trả thành công',
            //         text: 'Vui lòng kiểm tra đơn hàng',
            //         icon: 'success',
            //     });
            //     setReturnModalVisible(false);
            // }
            message.success(response.data.message);
            setReturnModalVisible(false);
        } catch (error) {
            message.error(error.response.data.message);
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
       
        loadOrders();
    }, [activeTab]);
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
                console.log("response", response);
                message.success(response.message);
                //loadOrders();
            }
        } catch (error) {
           message.error(error.message);
            console.error("Lỗi khi hủy đơn hàng:", error);
        }
    };


    const trackingStatusMap: Record<string, string> = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý",
        shipped: "Đã vận chuyển",
        delivered: "Đang giao hàng",
        cancelled: "Đã hủy",
        completed: "Hoàn thành"
    };

    const handleConfirmReceived = async (orderId: number) => {
        try {
          const response =  await updateOrderStatus(orderId, "completed");
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, tracking_status: "completed" } : order
                )
            );
            message.success(response.data.message);
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
    const handlePayment = async (orderId: number) => {
        try {
          const res = await axios.post(`http://127.0.0.1:8000/api/payment/retry/${orderId}`);
          const { payUrl } = res.data;
          console.log(res);
          window.location.href = payUrl; 
        } catch (err) {
            console.log(err);
            message.error(err.response.data.message);
          message.error("Không thể thực hiện lại thanh toán");
        }
      };
      
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
            render: (product_name: string) => product_name.slice(0, 30) + "...",

        },
        {
            title: " Phương thức thanh toán",
            dataIndex: "payment_method",
            key: "payment_method",
            render: (payment_method: string) => payment_method === "cod" ? "Thanh toán khi nhận hàng" : "Thanh toán MoMo",
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
                    <Button type="primary" onClick={() => handleShowModal(record)}>Xem</Button>
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
                    {(record.tracking_status === "cancelled" && record.status === "cancelled") && (
                        <Button type="primary" danger onClick={() => handleRebuy(record)}>
                            Mua lại
                        </Button>
                    )}

                    {record.tracking_status === "delivered" && (
                        <Button type="primary" onClick={() => handleConfirmReceived(record.id)}>
                            Đã nhận
                        </Button>
                    )}
                     {record.payment_method == "online" && record.is_paid == 0 && (
                        <Button type="primary" onClick={() => handlePayment(record.id)}>
                          Thanh toán lại 
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
                    <Tabs.TabPane tab="Đã gửi" key="shipped" />
                    <Tabs.TabPane tab="Đang giao" key="delivered" />
                    <Tabs.TabPane tab="Hoàn tất" key="completed" />
                    <Tabs.TabPane tab="Đã hủy" key="cancelled" />
                    <Tabs.TabPane tab="Trả hàng" key="refunded" />
                </Tabs>

                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table columns={columns} dataSource={transformedOrders} rowKey="id" pagination={{ pageSize: 10 }} />
                )}

                <Modal
                    title="Chi tiết đơn hàng"
                    open={modalVisible}
                    onCancel={handleClose}
                    footer={[
                        <Button key="cancel" type="primary" onClick={handleClose}>
                            Đóng
                        </Button>,
                    ]}
                    width={800}
                >
                    {selectedOrder && (
                        <div>
                            {/* Phần 1: Thông tin đơn hàng */}
                            <Divider orientation="left">Thông tin đơn hàng</Divider>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Họ tên">{selectedOrder.name}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{selectedOrder.phone}</Descriptions.Item>
                                <Descriptions.Item label="Email">{selectedOrder.email}</Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ giao hàng">{`${selectedOrder.address}, ${selectedOrder.ward}, ${selectedOrder.district}, ${selectedOrder.city}`}</Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">{selectedOrder.total_amount.toLocaleString()} VND</Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Tag color="blue">{selectedOrder.payment_method?.toUpperCase()}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái đơn hàng">
                                    <Tag color={selectedOrder.tracking_status === 'completed' ? 'green' : 'orange'}>
                                        {selectedOrder.tracking_status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thanh toán">
                                    {selectedOrder.payment_method === 'online' && selectedOrder.is_paid === 0 ? (
                                        <Tag color="red">Chưa thanh toán</Tag>
                                    ) : (
                                        <Tag color={selectedOrder.payment_method === 'online' ? 'green' : 'orange'}>
                                        {selectedOrder.tracking_status === 'completed'
                                          ? 'Hoàn tất'
                                          : selectedOrder.payment_method == 'online' && selectedOrder.is_paid == 1
                                            ? 'Đã thanh toán'
                                            : 'Chưa thanh toán'}
                                      </Tag>
                                      
                                    )}
                                </Descriptions.Item>

                            </Descriptions>

                            {/* Phần 2: Danh sách sản phẩm */}
                            <Divider orientation="left">Sản phẩm đã mua</Divider>
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

                            {/* Phần 3: Đánh giá sản phẩm */}
                            {selectedOrder.tracking_status === 'completed' && (
                                <>
                                    <Divider orientation="left">Đánh giá sản phẩm</Divider>
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {selectedOrder.orderdetails.map((detail) => (
                                            <div key={detail.id} className="flex justify-between items-center border p-3 rounded-md bg-gray-50">
                                                <div>
                                                    <div className="font-semibold">{detail.product_name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {detail.variant_details
                                                            ? Object.entries(detail.variant_details).map(([key, value]) => `${key}: ${value}`).join(", ")
                                                            : "Không có biến thể"}
                                                    </div>
                                                </div>
                                                <div>
                                                    {detail.is_rating ? (
                                                        <Tag icon={<CheckOutlined />} color="success">Đã đánh giá</Tag>
                                                    ) : (
                                                        <Button
                                                            type="primary"
                                                            onClick={() => {
                                                                setSelectedProductId(detail.product_id);
                                                                setDetailId(detail.id);
                                                                handleOpenReviewModal(detail);
                                                            }}
                                                        >
                                                            Đánh giá
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </Space>
                                </>
                            )}
                        </div>
                    )}
                </Modal>

                <Modal
                    title="Đánh giá sản phẩm"
                    open={reviewModalVisible}
                    onCancel={() => setReviewModalVisible(false)}
                    onOk={handleSubmitReview}
                >
                    <p><strong>{reviewProduct?.product_name}</strong></p>
                    <p>Đánh giá:</p>

                    {/* Cho phép người dùng chọn sản phẩm để đánh giá nếu có nhiều sản phẩm */}
                    <Select
                        value={selectedProductId}
                        onChange={(value) => setSelectedProductId(value)}
                        style={{ width: "100%", marginBottom: 10 }}
                    >
                        {reviewProduct?.orderdetails?.map((item) => (
                            <Select.Option key={item.product_id} value={item.product_id}>
                                {item.product_name} - {item.variant_details ? Object.entries(item.variant_details).map(([key, value]) => `${key}: ${value}`).join(", ") : "Không có biến thể"}
                            </Select.Option>
                        ))}
                    </Select>

                    {/* Rate component for choosing stars */}
                    <div style={{ marginBottom: 10 }}>
                        <span>Chọn số sao:</span>
                        <Rate
                            value={ratingValue}
                            onChange={(value) => setRatingValue(value)}
                        />
                    </div>

                    <Input.TextArea
                        rows={4}
                        placeholder="Nhập đánh giá của bạn..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                    />
                </Modal>
                <Modal
                    width={1100}
                    title="Hoàn trả sản phẩm"
                    open={returnModalVisible}
                    onCancel={() => setReturnModalVisible(false)}
                    onOk={() => handleReturnOrder()}
                    okText="Xác nhận hoàn"
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
                                        title: "Lý do hoàn trả",
                                        key: "reason",
                                        render: (_: any, detail: any) => (
                                            <Input
                                                style={{ width: 200 }}
                                                placeholder="Nhập lý do"
                                                disabled={!selectedReturnItems[detail.id]}
                                                value={returnReasons[detail.id] || ""}
                                                onChange={(e) => setReason(detail.id, e.target.value)}
                                            />
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