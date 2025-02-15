import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
type CategoryType = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  parent?: { id: number; name: string } | null;
  children: CategoryType[];
};

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await axios.get<CategoryType[]>(
          "http://localhost:8000/api/categories"
        );
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    getCategories();
  }, []);

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
        {/* <td>{category.parent ? category.parent.name : "----"}</td> */}
        <td>
          <button className="btn btn-warning btn-sm me-1">Xem</button>
          <button className="btn btn-danger btn-sm me-1">Xóa</button>
          <Link className="btn btn-primary" to={`/admin/categories/${category.id}/edit`}>Edit</Link>
        </td>
      </tr>,
      ...renderCategories(category.children, level + 1),
    ]);
  };
  

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Categories</h2>
      <div className="table-responsive">
      <Link className="btn btn-primary mb-3" to="/admin/categories/create">Thêm danh mục</Link>

        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Hình ảnh</th>
              {/* <th>Danh mục cha</th> */}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              renderCategories(categories)
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;