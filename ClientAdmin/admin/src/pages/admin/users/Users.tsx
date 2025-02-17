const Users = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Users</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Email Verified At</th>
              <th>Phone</th>
              <th>Address</th>
              <th>City</th>
              <th>District</th>
              <th>Ward</th>
              <th>Zip Code</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* User 1 */}
            <tr>
              <td>1</td>
              <td>Nguyễn Văn A</td>
              <td>nguyenvana@example.com</td>
              <td>2024-01-10</td>
              <td>0987654321</td>
              <td>123 Đường ABC</td>
              <td>TP.HCM</td>
              <td>Quận 1</td>
              <td>Phường Bến Nghé</td>
              <td>700000</td>
              <td>2024-01-01</td>
              <td>2024-02-01</td>
              <td className="text-center">
                <button className="btn btn-warning btn-sm me-1" style={{ width: "80px" }}>View</button>
                <button className="btn btn-primary btn-sm" style={{ width: "80px" }}>Edit</button>
                <button className="btn btn-danger btn-sm me-1" style={{ width: "80px" }}>Delete</button>
              </td>
            </tr>

            {/* User 2 */}
            <tr>
              <td>2</td>
              <td>Trần Thị B</td>
              <td>tranthib@example.com</td>
              <td>2024-01-15</td>
              <td>0912345678</td>
              <td>456 Đường XYZ</td>
              <td>Hà Nội</td>
              <td>Quận Ba Đình</td>
              <td>Phường Liễu Giai</td>
              <td>100000</td>
              <td>2024-01-05</td>
              <td>2024-02-05</td>
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

export default Users;
