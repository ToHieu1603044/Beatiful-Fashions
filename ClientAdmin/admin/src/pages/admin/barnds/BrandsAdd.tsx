
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import slugify from "slugify";
import { createBrand, getBrands } from "../../../services/brandsService";

type BrandType = {
  id: number;
  name: string;
  status: string;
  parent_id?: number | null;
  children: BrandType[];
};

const BrandsAdd = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<BrandType[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<string>("1"); // Mặc định là "Đang hoạt động"
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [parentId, setParentId] = useState<number | null>(null); // Thêm parent_id nếu cần

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getBrands();
        setBrands(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    setSlug(slugify(name, { lower: true }));
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Kiểm tra nếu tên không có hoặc không hợp lệ
    if (!name.trim()) {
      setErrors({ name: "Tên danh mục không được để trống" });
      setLoading(false);
      return;
    }

    // Tạo FormData để gửi lên server
    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("status", status);
    if (parentId !== null) formData.append("parent_id", parentId.toString()); // Gửi parent_id nếu có

    try {
      await createBrand(formData);
      alert("Danh mục đã được thêm thành công!");
      navigate("/admin/brands", { state: { added: true } });
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/403");
      }
      console.error("Lỗi khi thêm danh mục:", error);
      alert("Không thể thêm danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Thêm danh mục</h2>
        <button className="btn btn-secondary ms-3" onClick={() => navigate("/admin/brands")}>
          Quay lại
        </button>
      </div>

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          {/* Nhập tên danh mục */}
          <div className="mb-3">
            <label className="form-label">Tên Brand</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Trạng thái hoạt động */}
          <div className="mb-3">
            <label className="form-label">Trạng thái</label>
            <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="1">Đang hoạt động</option>
              <option value="0">Ngừng hoạt động</option>
            </select>
          </div>


          {/* Nút submit */}
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

export default BrandsAdd;