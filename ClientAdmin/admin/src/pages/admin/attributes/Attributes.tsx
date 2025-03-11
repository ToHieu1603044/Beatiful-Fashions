import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

// Hàm lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

const Attributes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootAttributes = location.pathname === "/admin/attributes";

  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State quản lý Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);

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

  const handleAdd = (newAttribute: any) => {
    setAttributes((prev) => [...prev, newAttribute]);
  };
  const handleShowModal = (attribute: any) => {
    setSelectedAttribute(attribute);
    setShowModal(true);
  };

  return (
    <div className="container mt-4">
      {loading && <p>Đang tải dữ liệu...</p>}

      {error && <div className="alert alert-danger">{error}</div>}

      {isRootAttributes && (
        <>
          <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Attributes</h2>
           <Link to="/admin/attributes/create" className="btn btn-primary ms-auto">Add</Link>
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
                        onClick={() => handleShowModal(attr)}
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

      {/* Modal hiển thị danh sách Values */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Thuộc Tính</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttribute && (
            <>
              <p><strong>ID:</strong> {selectedAttribute.id}</p>
              <p><strong>Tên:</strong> {selectedAttribute.name}</p>
              <p><strong>Ngày tạo:</strong> {selectedAttribute.created_at}</p>
              <p><strong>Ngày cập nhật:</strong> {selectedAttribute.updated_at}</p>

              <h4>Danh sách giá trị</h4>
              {selectedAttribute.values.length > 0 ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Giá trị</th>
                      <th>Ngày tạo</th>
                      <th>Ngày cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAttribute.values.map((value: any) => (
                      <tr key={value.id}>
                        <td>{value.id}</td>
                        <td>{value.value}</td>
                        <td>{value.created_at}</td>
                        <td>{value.updated_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Không có giá trị nào.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
 
      <Outlet context={{ handleAdd }} />
    </div>
  );
};

export default Attributes;
