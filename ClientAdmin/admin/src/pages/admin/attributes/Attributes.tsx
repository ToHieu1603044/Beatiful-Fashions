import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Attributes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootAttributes = location.pathname === "/admin/attributes";
  const [attributes, setAttributes] = useState([]);

  const fetchAttributes = () => {
    axios
      .get("http://localhost:3000/data")
      .then((response) => setAttributes(response.data))
      .catch((error) => console.error("Error fetching attributes:", error));
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleAdd = (newAttribute) => {
    setAttributes((prev) => [...prev, newAttribute]); // Cập nhật danh sách ngay lập tức
  };

  const handleUpdate = (updatedAttribute) => {
    setAttributes((prev) =>
      prev.map((attr) => (attr.id === updatedAttribute.id ? updatedAttribute : attr))
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      axios
        .delete(`http://localhost:3000/data/${id}`)
        .then(() => setAttributes((prev) => prev.filter((attr) => attr.id !== id)))
        .catch((error) => console.error("Error deleting attribute:", error));
    }
  };

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
                {attributes.map((attr) => (
                  <tr key={attr.id}>
                    <td>{attr.id}</td>
                    <td>{attr.name}</td>
                    <td>{attr.created_at}</td>
                    <td>{attr.updated_at}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-1"
                        onClick={() =>
                          navigate(`/admin/attributes/view/${attr.id}`)
                        }
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm me-1"
                        onClick={() => handleDelete(attr.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          navigate(`/admin/attributes/edit/${attr.id}`)
                        }
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

      {/* Truyền handleAdd và handleUpdate cho trang con */}
      <Outlet context={{ handleAdd, handleUpdate }} />
    </div>
  );
};

export default Attributes;
