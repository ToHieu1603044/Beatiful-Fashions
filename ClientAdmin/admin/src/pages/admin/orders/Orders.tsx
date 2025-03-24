import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Select, Pagination, Input } from "antd";
import { confirmOrder, getOrderReturns, getOrders, updateOrderStatus } from "../../../services/orderService";
import Swal from 'sweetalert2'
import EditOrderModal from "./EditOrderModal";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [status, setStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null); // Bộ lọc trạng thái
  const [editOrder, setEditOrder] = useState(null);

  useEffect(() => {
    fetchOrders(currentPage, filterStatus);
  }, [currentPage, filterStatus]); const handleEditOrder = (order) => {
    console.log("Nhấn Edit, Order:", order);
    setEditOrder(order);
  };

  const fetchOrders = async (page = 1, trackingStatus?: string | null, userSearch?: string) => {
    try {
      setLoading(true);
      const response = await getOrders({ page, tracking_status: trackingStatus, user: userSearch });
      const res = await getOrderReturns();
      console.log("response", response);
      
      console.log("Danh sách đơn hàng:---", res.data.data);
      setOrders(response.data.data);
      setCurrentPage(response.data.page.currentPage);
      setLastPage(response.data.page.lastPage);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đơn hàng?",
      text: "Bạn có chắc chắn muốn xác nhận đơn hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await confirmOrder(selectedOrder.id);
        Swal.fire("Thành công!", "Đơn hàng đã được xác nhận.", "success");
        fetchOrders(currentPage);
      } catch (error) {
        console.error("Lỗi xác nhận đơn hàng:", error);
        Swal.fire("Lỗi!", "Không thể xác nhận đơn hàng.", "error");
      }
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

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      console.log("Du lieu gui di", selectedOrder.id, status);

      await updateOrderStatus(selectedOrder.id, status);
      Swal.fire("Thành công!", "Cập nhật trạng thái đơn hàng thành công.", "success");

      handleCloseModal();
      fetchOrders(currentPage, filterStatus); // Giữ nguyên bộ lọc khi reload danh sách
    } catch (error) {
      console.log(error);
      Swal.fire("Lỗi!", "Không thể cập nhật trạng thái đơn hàng.", "error");
    }
  };


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
      title: "Payment Status",
      dataIndex: "is_paid",
      key: "is_paid",
      render: (isPaid: boolean) =>
        isPaid ? <span style={{ color: "green" }}>✅ Đã thanh toán</span> : <span style={{ color: "red" }}>❌ Chưa thanh toán</span>,
    },
    {
      title: "Address",
      key: "address",
      render: (record: any) =>
        `${record.city}-${record.district}-${record.ward}-${record.address}`.slice(0, 30) + "...",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <Button.Group>
          <Button type="primary" onClick={() => handleShowModal(record)}>View</Button>
          <Button type="primary" onClick={() => handleEditOrder(record)}>Edit</Button>
          <Button danger>Delete</Button>
        </Button.Group>
      ),
    },
  ];
  return (
    <div className="container mt-4">
      <h2>Orders List</h2>
      <div className="mb-4 flex gap-3">
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          className="w-40"
          value={filterStatus}
          onChange={(value) => {
            setStatus(value);
            setFilterStatus(value || null);
            fetchOrders(1, value || null);
          }}
        >

         <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="processing">Đang xử lý</Select.Option>
          <Select.Option value="shipped">Đã gửi</Select.Option>
          <Select.Option value="delivered">Đã giao</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
          <Select.Option value="completed">Giao hàng thành công</Select.Option>
        </Select>
        <Button danger>📄 Export PDF</Button>
      </div>

      <Table columns={columns} dataSource={orders} loading={loading} pagination={false} rowKey="id" />
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          visible={true}
          onClose={() => setEditOrder(null)}
        />
      )}
      <Pagination
        current={currentPage}
        total={lastPage * 10}
        onChange={(page) => page >= 1 && page <= lastPage && fetchOrders(page)}
        className="mt-4 text-center"
      />

      <Modal
        title={`Order Details #${selectedOrder?.id}`}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>Close</Button>,
          selectedOrder?.shipping_status === "completed" && (
            <Button key="confirm" type="primary" onClick={handleConfirmOrder}>
              ✅ Xác nhận đơn hàng
            </Button>
          ),
          <Button key="update" type="primary" onClick={handleUpdateStatus}>
            Update Order
          </Button>,
        ]}
      >

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
                { title: "Tên sản phẩm", dataIndex: ["product", "name"], key: "product_name" },
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

            <h6>Cập nhật trạng thái đơn hàng:</h6>
            <Select
              value={status}
              onChange={(value) => setStatus(value)}
              className="w-100"
            >
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="processing">Đang xử lý</Select.Option>
              <Select.Option value="shipped">Đã gửi</Select.Option>
              <Select.Option value="delivered">Đã giao</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
              <Select.Option value="completed">Giao hàng thành công</Select.Option>
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
