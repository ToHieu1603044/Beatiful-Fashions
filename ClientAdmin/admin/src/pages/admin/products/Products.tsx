const Products = () => {
  return (
    <div className="container mt-4">
     <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Danh sách Products</h2>
        <button className="btn btn-success ms-3">Thêm mới</button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand Id</th>
              <th>Total Rating</th>
              <th>Total Sold</th>
              <th>Image</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Áo Thun Nam</td>
              <td>Áo</td>
              <td>120</td>
              <td>300</td>
              <td>
                <img src="https://placehold.co/50x50" alt="Sản phẩm" className="rounded" />
              </td>
              <td>2024-01-10</td>
              <td>2024-02-01</td>
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
};

export default Products;
