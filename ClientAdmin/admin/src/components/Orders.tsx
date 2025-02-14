const Orders = () => {
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
              <th style={{ width: "100px" }}>Status</th>
              <th style={{ width: "130px" }}>Shipping Status</th>
              <th style={{ width: "150px" }}>Name</th>
              <th>Email</th>
              <th style={{ width: "100px" }}>Phone</th>
              <th>Ward</th>
              <th>District</th>
              <th style={{ width: "120px" }}>City</th>
              <th style={{ width: "80px" }}>Zip Code</th>
              <th style={{ width: "130px" }}>Payment Method</th>
              <th style={{ maxWidth: "200px", wordBreak: "break-word" }}>Note</th>
              <th style={{ width: "100px" }}>Created</th>
              <th style={{ width: "100px" }}>Updated</th>
              <th style={{ width: "200px" }} className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>101</td>
              <td>500,000 VND</td>
              <td>Đã xác nhận</td>
              <td>Đang giao</td>
              <td>Nguyễn Văn A</td>
              <td>nguyenvana@example.com</td>
              <td>0987654321</td>
              <td>Phường 5</td>
              <td>Quận 10</td>
              <td>TP.HCM</td>
              <td>700000</td>
              <td>Chuyển khoản</td>
              <td>Giao hàng trong giờ hành chính, gọi trước khi giao.</td>
              <td>2024-02-01</td>
              <td>2024-02-02</td>
              <td className="text-center">
                <button className="btn btn-warning btn-sm me-1" style={{ width: "80px" }}>View</button>
                <button className="btn btn-primary btn-sm" style={{ width: "80px" }}>Edit</button>
                <button className="btn btn-danger btn-sm me-1" style={{ width: "80px" }}>Delete</button>
              </td>
            </tr>

            <tr>
              <td>2</td>
              <td>102</td>
              <td>1,200,000 VND</td>
              <td>Chờ xác nhận</td>
              <td>Chưa giao</td>
              <td>Trần Thị B</td>
              <td>tranthib@example.com</td>
              <td>0912345678</td>
              <td>Phường 2</td>
              <td>Quận 3</td>
              <td>TP.HCM</td>
              <td>700000</td>
              <td>Tiền mặt</td>
              <td>Gọi trước khi giao, có thể hẹn ngày nhận hàng.</td>
              <td>2024-02-02</td>
              <td>2024-02-03</td>
              <td className="text-center">
                <button className="btn btn-warning btn-sm me-1" style={{ width: "80px" }}>View</button>
                <button className="btn btn-primary btn-sm" style={{ width: "80px" }}>Edit</button>
                <button className="btn btn-danger btn-sm me-1" style={{ width: "80px" }}>Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
