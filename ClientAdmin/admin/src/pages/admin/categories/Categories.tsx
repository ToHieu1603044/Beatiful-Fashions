import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootCategories = location.pathname === "/admin/categories";

  return (
    <div className="container mt-4">
      {isRootCategories && (
        <>
            <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Categories</h2>
            <button
              className="btn btn-success ms-3"
              onClick={() => navigate("/admin/attributes/create")}
            >
              Thêm mới
            </button>
          </div>

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
                {[
                  { id: 1, name: "Giày Sneakers", slug: "giay-sneakers", parentId: "None", created: "2024-01-20", updated: "2024-02-10" },
                  { id: 2, name: "Áo Polo", slug: "ao-polo", parentId: "1", created: "2024-01-25", updated: "2024-02-15" },
                ].map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      <img src="https://placehold.co/50x50" alt={category.name} className="rounded" />
                    </td>
                    <td>{category.parentId}</td>
                    <td>{category.created}</td>
                    <td>{category.updated}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-1">View</button>
                      <button className="btn btn-danger btn-sm me-1">Delete</button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/categories/edit/`)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Hiển thị route con như /admin/categories/add hoặc /admin/categories/edit */}
      <Outlet />
    </div>
  );
};

export default Categories;
