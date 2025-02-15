import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategory, updateCategory, getCategories } from "../../../services/categoryService";
import Select from "react-dropdown-tree-select";
import "react-dropdown-tree-select/dist/styles.css";

type CategoryType = {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: CategoryType[];
};

const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh mục hiện tại
        const categoryRes = await getCategory(Number(id));
        setName(categoryRes.data.name);
        setParentId(categoryRes.data.parent_id);

        // Lấy danh sách danh mục
        const categoriesRes = await getCategories();
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCategory(Number(id), { name, parent_id: parentId });
    navigate("/admin/categories");
  };

  // Chuyển danh sách danh mục thành dạng cây (có checked nếu là parentId)
  const convertToTree = (categories: CategoryType[], selectedParentId: number | null) => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id.toString(),
      children: category.children && category.children.length > 0 ? convertToTree(category.children, selectedParentId) : [],
      checked: selectedParentId === category.id, // Tick nếu danh mục này là cha hiện tại
    }));
  };
  

  return (
    <div className="container mt-4">
      <h2>Chỉnh sửa Danh Mục</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tên danh mục</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Dropdown chọn danh mục cha */}
        <div className="mb-3">
          <label className="form-label">Danh mục cha</label>
          <Select
            data={convertToTree(categories)}
            onChange={(selected) => setParentId(selected.value ? Number(selected.value) : null)}
          />
        </div>

        <button type="submit" className="btn btn-primary">Cập nhật</button>
      </form>
    </div>
  );
};

export default CategoryEdit;
