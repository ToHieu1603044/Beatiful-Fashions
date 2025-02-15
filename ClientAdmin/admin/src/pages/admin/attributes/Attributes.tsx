import { Outlet, useLocation, useNavigate } from "react-router-dom";

const Attributes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootAttributes = location.pathname === "/admin/attributes";

  return (
    <div className="container mt-4">
      {isRootAttributes && (
        <>
          <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Attributes</h2>
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
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, name: "Màu sắc", created: "2024-01-10", updated: "2024-02-01" },
                  { id: 2, name: "Kích thước", created: "2024-01-15", updated: "2024-02-05" },
                  { id: 3, name: "Chất liệu", created: "2024-01-20", updated: "2024-02-10" },
                ].map((attr) => (
                  <tr key={attr.id}>
                    <td>{attr.id}</td>
                    <td>{attr.name}</td>
                    <td>{attr.created}</td>
                    <td>{attr.updated}</td>
                    <td>
                      <button className="btn btn-warning btn-sm me-1">View</button>
                      <button className="btn btn-danger btn-sm me-1">Delete</button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/admin/attributes/edit`)}
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

      {/* Hiển thị route con như /admin/attributes/add hoặc /admin/attributes/edit */}
      <Outlet />
    </div>
  );
};

export default Attributes;
