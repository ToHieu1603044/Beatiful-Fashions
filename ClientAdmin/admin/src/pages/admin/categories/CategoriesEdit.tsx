import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, getCategories, updateCategory } from "../../../services/categoryService";
import slugify from "slugify";
import { AxiosError } from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type CategoryType = {
  id: number;
  name: string;
  parent_id?: number | null;
  children: CategoryType[];
};

const CategoriesEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string; image?: string }>({});

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const categoryResponse = await getCategoryById(Number(id));
        const category = categoryResponse.data;
        setName(category.name);
        setSlug(category.slug);
        setParentId(category.parent_id ?? null);
        setOldImage(category.image);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin danh mục:", error);
        toast.error("Không thể tải dữ liệu danh mục.");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        toast.error("Không thể tải danh sách danh mục.");
      }
    };

    fetchCategory();
    fetchCategories();
  }, [id]);

  useEffect(() => {
    setSlug(slugify(name, { lower: true }));
  }, [name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
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
    if (!slug.trim()) {
      setErrors((prev) => ({ ...prev, slug: "Slug không được để trống" }));
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    if (parentId) formData.append("parent_id", parentId.toString());
    if (image) formData.append("image", image);

    try {
      await updateCategory(Number(id), formData);
       toast.success("Cập nhật danh mục thành công! 🎉");
       navigate("/admin/categories", { state: { updated: true } });

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error("Lỗi khi cập nhật danh mục:", axiosError);
      if (axiosError.response?.data?.message) {
        toast.error("Lỗi từ server: " + axiosError.response.data.message);
      } else {
        toast.error("Cập nhật thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) =>
      category.id !== Number(id)
        ? [
            <option key={category.id} value={category.id}>
              {"—".repeat(level)} {category.name}
            </option>,
            ...renderCategoryTree(category.children, level + 1),
          ]
        : []
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Chỉnh sửa danh mục</h2>
        <button className="btn btn-secondary ms-3" onClick={() => navigate("/admin/categories")}>
          Quay lại
        </button>
      </div>

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
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

          <div className="mb-3">
            <label className="form-label">Hình ảnh</label>
            <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
            <div className="mt-2 d-flex">
              {preview && <img src={preview} alt="Ảnh mới" className="rounded me-2" width={100} height={100} />}
              {!preview && oldImage && <img src={oldImage} alt="Ảnh cũ" className="rounded" width={100} height={100} />}
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesEdit;
