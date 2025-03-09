
import { useEffect, useState } from "react";
import { getOrders } from "../../../services/orderService";


const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<[] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState(selectedOrder?.status || "pending");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const handleStatusChange = (event) => {
    setOrderStatus(event.target.value);
  };
  useEffect(() => {
    fetchOrders(currentPage);

  }, [currentPage]);

  const fetchOrders = async (page = 1) => {
    try {
      const response = await getOrders({ page });
      setOrders(response.data.data);
      setCurrentPage(response.data.page.currentPage);
      setLastPage(response.data.page.lastPage);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    }
  };

  const allVariantKeys = [
    ...new Set(
      selectedOrder?.orderdetails?.flatMap(item =>
        Object.keys(item.variant_details || {})
      ) || []
    )
  ];

  const handleShowModal = (order: []) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchOrders(newPage);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Orders</h2>
      <div className="table-responsive">
        <button className="btn btn-danger mb-4">📄 Xuất PDF</button>
        <table className="table table-bordered table-striped table-sm">
          <thead className="table-dark">
            <tr>
              <th style={{ width: "40px" }}>ID</th>
              <th style={{ width: "70px" }}>User Id</th>
              <th style={{ width: "120px" }}>Total Amount</th>
              <th style={{ width: "130px" }}>Shipping Status</th>
              <th>Address</th>
              <th style={{ width: "130px" }}>Payment Method</th>
              <th style={{ width: "200px" }} className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>

            {orders.map((order) => (
              <tr>
                <td>{order.id}</td>
                <td>{order.user}</td>
                <td>{order.total_amount}</td>

                <td>{order.shipping_status}</td>

                <td>{`${order.city}-${order.district}-${order.ward}-${order.address}`}</td>
                <td>{order.payment_method}</td>

                <td className="text-center">
                  <button className="btn btn-warning btn-sm me-1" style={{ width: "80px" }} onClick={() => handleShowModal(order)}>View</button>
                  <button className="btn btn-primary btn-sm" style={{ width: "80px" }}>Edit</button>
                  <button className="btn btn-danger btn-sm me-1" style={{ width: "80px" }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>← Trước</button>
            </li>

            {[...Array(lastPage)].map((_, i) => (
              <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
              </li>
            ))}

            <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Sau →</button>
            </li>
          </ul>
        </nav>
      </div>

      {selectedOrder && (
        <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-lg overflow-hidden">

              {/* HEADER */}
              <div className="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.id}</h5>
                <button type="button" className="btn-close text-white" onClick={handleCloseModal}></button>
              </div>

              {/* BODY */}
              <div className="modal-body p-4">
                <div className="row">
                  {/* Thông tin đơn hàng */}
                  <div className="col-md-6">
                    <p><strong>Người đặt:</strong> {selectedOrder.user}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                    <p><strong>Địa chỉ giao hàng:</strong> {`${selectedOrder.address}, ${selectedOrder.ward}, ${selectedOrder.city}`}</p>
                  </div>

                  {/* Thanh toán & trạng thái */}
                  <div className="col-md-6">
                    <p><strong>Tổng tiền:</strong> {selectedOrder.total_amount.toLocaleString()} VND</p>
                    <p><strong>Giảm giá:</strong> {selectedOrder.discount_amount ? `${selectedOrder.discount_amount.toLocaleString()} VND` : "Không có"}</p>
                    <p><strong>Mã giảm giá:</strong> {selectedOrder.discount_code || "Không có"}</p>
                    <p><strong>Phương thức thanh toán:</strong> <span className="badge bg-info">{selectedOrder.payment_method.toUpperCase()}</span></p>
                  </div>
                </div>

                {/* Cập nhật trạng thái đơn hàng */}
                <div className="mb-4">
                  <label className="form-label"><strong>Trạng thái đơn hàng:</strong></label>
                  <select className="form-select" value={orderStatus} onChange={handleStatusChange}>
                    <option value="pending">🕒 Chờ xử lý</option>
                    <option value="completed">✅ Đã hoàn thành</option>
                    <option value="canceled">❌ Đã hủy</option>
                  </select>
                </div>

                {/* Bảng sản phẩm */}
                <h6 className="mt-4">Sản phẩm đã đặt:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered text-center">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Mã phẩm</th>
                        <th>Tên sản phẩm</th>
                        {allVariantKeys.map((attr, i) => <th key={i}>{attr}</th>)}
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderdetails.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td><strong>Mã SKU:</strong> {item.sku}</td>
                          <td>{item.product_name}</td>
                          {allVariantKeys.map((attr, i) => (
                            <td key={i}>{item.variant_details?.[attr] || "-"}</td>
                          ))}
                          <td>{item.quantity}</td>
                          <td>{item.price.toLocaleString()} VND</td>
                          <td><strong>{item.subtotal.toLocaleString()} VND</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={handleCloseModal}>❌ Đóng</button>
                <button className="btn btn-success">💾 Cập nhật đơn hàng</button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default Orders;
