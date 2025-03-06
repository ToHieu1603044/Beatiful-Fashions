import axios from "axios";
import { useEffect, useState } from "react";
import { getOrders } from "../../../services/orderService";


const Orders = () => {

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<[]| null>(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    fetchOrders();

  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      console.log(response.data);
      setOrders(response.data.data);


    } catch (error) {


    }
  }
  
  const handleShowModal = (order: []) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };



  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Orders</h2>
      <div className="table-responsive">
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
            {/* {id: 92, user: 'Admin', total_amount: 'required|integer|min:0', status: 'pending', shipping_status: null, …} */}
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
      </div>

      {selectedOrder && (
        <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
             <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Chi tiết đơn hàng #{selectedOrder.id}</h5>
          
            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
          </div>
          <div className="modal-body">
            <select name="" id="">
              <option value="pending">Pending</option>

              <option value="pending">Comple</option>

              <option value="pending">Cancle</option>
            </select>
            <p><strong>Người đặt:</strong> {selectedOrder.user}</p>
            <p><strong>Tổng tiền:</strong> {selectedOrder.total_amount.toLocaleString()} VND</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.payment_method.toUpperCase()}</p>
            <p><strong>Địa chỉ giao hàng:</strong> {`${selectedOrder.address}, ${selectedOrder.ward}, ${selectedOrder.city}`}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
            
            <h6 className="mt-4">Sản phẩm:</h6>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Sản phẩm</th>
                  <th>Size</th>
                  <th>Màu sắc</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.orderdetails.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>Mã SKU: {item.sku}</td>
                    <td>{item.variant_details.Size}</td>
                    <td>{item.variant_details.Color}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price.toLocaleString()} VND</td>
                    <td>{item.subtotal.toLocaleString()} VND</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
          </div>
        </div>
      </div>
  
        </div>
      )}
    </div>
    
  );
};

export default Orders;
