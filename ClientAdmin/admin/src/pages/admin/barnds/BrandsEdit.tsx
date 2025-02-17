import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getBrandsById, updateBrand } from "../../../services/brandsService";

type BrandType = {
  id: number;
  name: string;
  status: string;
  parent_id?: number | null;
  children: BrandType[];
};

const BrandsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
 
  const [brand, setBrand] = useState<BrandType | null>(null);
  const [name, setName] = useState("");

  const [status, setStatus] = useState<string>("1");
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    const fetchBrand = async () => {
      if (!id) return;
      try {
        const response = await getBrandsById(parseInt(id));
        console.log("Dữ liệu API----:", response.data);
        const brandData = response.data;
        setBrand(brandData.data);
        
       
     
      } catch (error) {
        console.error("Lỗi khi lấy thông tin danh mục:", error);
      }
    };
    fetchBrand();
  }, [id]);

  useEffect(() => {
    
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: "Tên danh mục không được để trống" });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
  
    formData.append("status", status);
   

    try {
      if (brand) {
        await updateBrand(brand.id, formData); 
        alert("Danh mục đã được cập nhật thành công!");
        navigate("/admin/brands", { state: { updated: true } });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      alert("Không thể cập nhật danh mục. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (!brand) return <div>Loading...</div>; 

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Chỉnh sửa danh mục</h2>
        <button className="btn btn-secondary ms-3" onClick={() => navigate("/admin/brands")}>
          Quay lại
        </button>
      </div>

      <div className="card p-4 shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên Brand</label>
            <input
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={brand.name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

        
          <div className="mb-3">
            <label className="form-label">Trạng thái</label>
            <select className="form-control" value={brand.status} onChange={(e) => setStatus(e.target.value)}>
              <option value="1">Đang hoạt động</option>
              <option value="0">Ngừng hoạt động</option>
            </select>
          </div>
         
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang cập nhật..." : "Cập nhật danh mục"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandsEdit;
