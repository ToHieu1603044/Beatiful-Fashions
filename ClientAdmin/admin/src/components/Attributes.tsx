const Attributes = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Attributes</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Màu sắc</td>
              <td>2024-01-10</td>
              <td>2024-02-01</td>
              <td>
                <button className="btn btn-warning btn-sm me-1">View</button>
                <button className="btn btn-danger btn-sm me-1">Delete</button>
                <button className="btn btn-primary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Kích thước</td>
              <td>2024-01-15</td>
              <td>2024-02-05</td>
              <td>
                <button className="btn btn-warning btn-sm me-1">View</button>
                <button className="btn btn-danger btn-sm me-1">Delete</button>
                <button className="btn btn-primary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Chất liệu</td>
              <td>2024-01-20</td>
              <td>2024-02-10</td>
              <td>
                <button className="btn btn-warning btn-sm me-1">View</button>
                <button className="btn btn-danger btn-sm me-1">Delete</button>
                <button className="btn btn-primary btn-sm">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attributes;
