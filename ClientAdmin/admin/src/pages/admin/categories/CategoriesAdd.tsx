import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory } from "../../../services/categoryService";
import slugify from "slugify";


type CategoryType = {
  id: number;
  name: string;
  parent_id?: number | null;
  children: CategoryType[];
};

const CategoriesAdd = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string; image?: string }>({});

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

  useEffect(() => {
    setSlug(slugify(name, { lower: true }));
  }, [name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Xem trước ảnh
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
  
    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Tên danh mục không được để trống" }));
      setLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (parentId) formData.append("parent_id", parentId.toString());
    if (image) formData.append("image", image);
  
    try {
      await createCategory(formData);
      navigate("/admin/categories", { state: { added: true } }); // Cập nhật danh sách ngay
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Thêm danh mục</h2>
        <button className="btn btn-secondary ms-3" onClick={() => navigate("/admin/categories")}>
          Quay lại
        </button>
      </div>

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          {/* Nhập tên danh mục */}
          <div className="mb-3">
            <label className="form-label">Tên danh mục</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Nhập Slug */}
          <div className="mb-3">
            <label className="form-label">Slug</label>
            <input
              type="text"
              className={`form-control ${errors.slug ? "is-invalid" : ""}`}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
          </div>

          {/* Chọn danh mục cha */}
          <div className="mb-3">
            <label className="form-label">Danh mục cha</label>
            <select
              className="form-select"
              value={parentId ?? ""}
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Không có danh mục cha --</option>
              {renderCategoryTree(categories)}
            </select>
          </div>

          {/* Upload ảnh */}
          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Xem trước" className="rounded" width={100} height={100} />
              </div>
            )}
          </div>

          {/* Nút Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang thêm..." : "Thêm danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesAdd;
