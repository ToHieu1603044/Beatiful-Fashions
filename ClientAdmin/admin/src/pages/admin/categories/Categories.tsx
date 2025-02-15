import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getCategories } from "../../../services/categoryService";

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Hàm lấy tên danh mục cha từ ID
  const getParentName = (parentId: number | null) => {
    if (!parentId) return "----";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "----";
  };

  // 🔹 Đệ quy hiển thị danh mục con
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
        <td>{getParentName(category.parent_id)}</td>
        <td>{category.created_at || "----"}</td>
        <td>{category.updated_at || "----"}</td>
        <td>
          <button className="btn btn-warning btn-sm me-1">Xem</button>
          <button className="btn btn-danger btn-sm me-1">Xóa</button>
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

      {/* Hiển thị route con như /admin/categories/create hoặc /admin/categories/edit/:id */}
      <Outlet />
    </div>
  );
};

export default Categories;
