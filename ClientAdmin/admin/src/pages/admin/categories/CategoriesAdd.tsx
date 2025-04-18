import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory } from "../../../services/categoryService";
import slugify from "slugify";
import { Modal, Button, Input, Select, message } from "antd";

type CategoryType = {
  id: number;
  name: string;
  parent_id?: number | null;
  children: CategoryType[];
};

const CategoriesAdd = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string; image?: string }>({});

  useEffect(() => {
    
    fetchCategories();
  }, []);
  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };
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

  const handleSubmit = async () => {
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
      message.success("Danh mục đã được thêm!");
      fetchCategories();
      onClose();
     
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <Select.Option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </Select.Option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };

  return (
    <Modal
      title="Thêm danh mục"
      visible={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Thêm danh mục"
      cancelText="Hủy"
      confirmLoading={loading}
    >
      {/* Nhập tên danh mục */}
      <div className="mb-3">
        <label className="form-label">Tên danh mục</label>
        <Input
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
        <Input
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
        <Select
          value={parentId ?? ""}
          onChange={(value) => setParentId(value ? Number(value) : null)}
          style={{ width: "100%" }}
        >
          <Select.Option value="">-- Không có danh mục cha --</Select.Option>
          {renderCategoryTree(categories)}
        </Select>
      </div>

      {/* Upload ảnh */}
      <div className="mb-3">
        <label className="form-label">Hình ảnh</label>
        <Input type="file" className="form-control" onChange={handleImageChange} accept="image/*" />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Xem trước" className="rounded" width={100} height={100} />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CategoriesAdd;