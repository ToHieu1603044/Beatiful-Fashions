import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../../../services/categoryService";
import { AxiosError } from "axios";

type CategoryType = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  parent_id?: number | null;
  children: CategoryType[];
  created_at?: string;
  updated_at?: string;
};

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootCategories = location.pathname === "/admin/categories";

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ search: searchTerm });
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return "----";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "----";
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;

    try {
      await deleteCategory(id);
      alert("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error("Lỗi khi xóa danh mục:", axiosError);
      alert("Không thể xóa danh mục. Vui lòng thử lại.");
    }
  };

  const handleShowModal = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const renderCategories = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <tr key={category.id}>
        <td>{category.id}</td>
        <td style={{ paddingLeft: `${level * 20}px` }}>{category.name}</td>
        <td>{category.slug}</td>
        <td>
          <img
            src={category.image || "https://placehold.co/50x50"}
            alt={category.name}
            className="rounded"
            width={50}
            height={50}
          />
        </td>
        <td>{getParentName(category.parent_id ?? null)}</td>
        <td>{category.created_at || "----"}</td>
        <td>{category.updated_at || "----"}</td>
        <td>
          <button className="btn btn-warning btn-sm me-1" onClick={() => handleShowModal(category)}>
            Xem
          </button>
          <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(category.id)}>
            Xóa
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/categories/${category.id}/edit`)}>
            Sửa
          </button>
        </td>
      </tr>,
      ...renderCategories(category.children, level + 1),
    ]);
  };

  return (
    <div className="container mt-4">
      {isRootCategories && (
        <>
          <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Danh Mục</h2>
            <button className="btn btn-success ms-3" onClick={() => navigate("/admin/categories/create")}>
              Thêm mới
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Hình ảnh</th>
                  <th>Danh mục cha</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center">Đang tải dữ liệu...</td>
                  </tr>
                ) : categories.length > 0 ? (
                  renderCategories(categories)
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center">Không có danh mục nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedCategory && (
        <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết danh mục</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {selectedCategory.id}</p>
                <p><strong>Tên:</strong> {selectedCategory.name}</p>
                <p><strong>Slug:</strong> {selectedCategory.slug}</p>
                <p><strong>Danh mục cha:</strong> {getParentName(selectedCategory.parent_id || null)}</p>
                <p>
                  <strong>Hình ảnh:</strong><br />
                  <img
                    src={selectedCategory.image || "https://placehold.co/100x100"}
                    alt={selectedCategory.name}
                    className="rounded mt-2"
                    width={100}
                    height={100}
                  />
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Categories;
