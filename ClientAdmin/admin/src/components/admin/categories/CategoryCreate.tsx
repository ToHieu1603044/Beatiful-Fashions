import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory, getCategories } from "../../../services/categoryService";
import Select from "react-dropdown-tree-select";
import "react-dropdown-tree-select/dist/styles.css";

type CategoryType = {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    parent_id?: number | null;
    children?: CategoryType[]; // Cần có nếu có danh mục con
  };
  type TreeNode = {
    label: string;
    value: string;
    children?: TreeNode[];
  };
  
const CategoryCreate = () => {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCategory({ name, parent_id: parentId });
    navigate("/admin/categories");
  };

  // Chuyển danh sách danh mục thành dạng tree
  const convertToTree = (categories: CategoryType[]): TreeNode[] => {
    return categories.map((category) => ({
      label: category.name,
      value: category.id.toString(),
      children: category.children && category.children.length > 0 ? convertToTree(category.children) : [],
    }));
  };
  
  
  return (
    <div className="container mt-4">
      <h2>Thêm Danh Mục</h2>
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

        {/* Chọn danh mục cha dạng cây */}
        <div className="mb-3">
          <label className="form-label">Danh mục cha</label>
          <Select
          
            data={convertToTree(categories)}
            onChange={(selected) => setParentId(selected.value ? Number(selected.value) : null)}
           
          />
        </div>

        <button type="submit" className="btn btn-primary">Lưu</button>
      </form>
    </div>
  );
};

export default CategoryCreate;
