const Categories = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Categories</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Image</th>
              <th>Parent Id</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Giày Sneakers</td>
              <td>giay-sneakers</td>
              <td>
                <img src="https://placehold.co/50x50" alt="Giày Sneakers" className="rounded" />
              </td>
              <td>None</td>
              <td>2024-01-20</td>
              <td>2024-02-10</td>
              <td>
                <button className="btn btn-warning btn-sm me-1">View</button>
                <button className="btn btn-danger btn-sm me-1">Delete</button>
                <button className="btn btn-primary btn-sm">Edit</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Áo Polo</td>
              <td>ao-polo</td>
              <td>
                <img src="https://placehold.co/50x50" alt="Áo Polo" className="rounded" />
              </td>
              <td>1</td>
              <td>2024-01-25</td>
              <td>2024-02-15</td>
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

export default Categories;
