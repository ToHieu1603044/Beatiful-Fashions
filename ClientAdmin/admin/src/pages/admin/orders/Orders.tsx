import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Select, Pagination, Input } from "antd";
import { confirmOrder, getOrder, getOrderReturns, getOrders, updateOrderStatus } from "../../../services/orderService";
import Swal from 'sweetalert2'
import EditOrderModal from "./EditOrderModal";
import OrderDetailModal from "../../../components/OrderDetailModal ";
import { exportPdf } from "../../../services/homeService";

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
  }, [currentPage, filterStatus]);

  const handleEditOrder = async (order) => {
    try {
      const response = await getOrder(order.id);

      console.log("Chi tiết đơn hàng:---", response.data.data);
      setEditOrder(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    }
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
  const trackingStatusMap: Record<string, string> = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã vận chuyển",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    completed: "Hoàn thành"
  };

  const handleExportPDF = async () => {
    try {
      const response = await exportPdf({
        responseType: "blob",
      });

      if (response.status === 200) {
        // Tạo URL từ Blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "all_invoices.pdf");
        document.body.appendChild(link);
        link.click();
        link.remove();

        alert("Xuất PDF thành công! 📄");
      }
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      alert("Có lỗi xảy ra khi xuất PDF!");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên ", dataIndex: "name", key: "name" },
    {
      title: "Tổng tiền ",
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
      title: "Phương thức thanh toán ",
      dataIndex: "is_paid",
      key: "is_paid",
      render: (isPaid: boolean) =>
        isPaid ? <span style={{ color: "green" }}>✅ Đã thanh toán</span> : <span style={{ color: "red" }}>❌ Chưa thanh toán</span>,
    },
    {
      title: "Địa chỉ ",
      key: "address",
      render: (record: any) =>
        `${record.city}-${record.district}-${record.ward}-${record.address}`.slice(0, 30) + "...",
    },
    {
      title: "Hành động",
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
          <Select.Option value="processing">Đã xác nhận</Select.Option>
          <Select.Option value="shipped">Đã gửi</Select.Option>
          <Select.Option value="delivered">Đã giao</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
          <Select.Option value="completed">Giao hàng thành công</Select.Option>
        </Select>
        <Button danger onClick={handleExportPDF}>📄 Export PDF</Button>
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

      <OrderDetailModal order={selectedOrder} visible={modalVisible} onClose={handleCloseModal} status={status} setStatus={setStatus} onConfirmOrder={handleUpdateStatus} confirmOrder={handleConfirmOrder} />
    </div>
  );
};

export default Orders;
