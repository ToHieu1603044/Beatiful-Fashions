import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// Lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

const Attributes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootAttributes = location.pathname === "/admin/attributes";
  const [attributes, setAttributes] = useState<any[]>([]); // Loại any có thể thay đổi theo cấu trúc dữ liệu thực tế
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = () => {
    const token = getAuthToken();
    axios
      .get("http://127.0.0.1:8000/api/attributes", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        setAttributes(response.data);
        setError(null);
      })
      .catch((error) => {
        setError("Lỗi khi tải dữ liệu: " + error.message);
        console.error("Error fetching attributes:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleAdd = (newAttribute: any) => {
    setAttributes((prev) => [...prev, newAttribute]); 
  };

  const handleUpdate = (updatedAttribute: any) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.id === updatedAttribute.id ? updatedAttribute : attr
      )
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      const token = getAuthToken();
      axios
        .delete(`http://127.0.0.1:8000/api/attributes/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then(() =>
          setAttributes((prev) => prev.filter((attr) => attr.id !== id))
        )
        .catch((error) => console.error("Error deleting attribute:", error));
    }
  };

  return (
    <div className="container mt-4">
      {loading && <p>Đang tải dữ liệu...</p>}

      {error && <div className="alert alert-danger">{error}</div>}

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
