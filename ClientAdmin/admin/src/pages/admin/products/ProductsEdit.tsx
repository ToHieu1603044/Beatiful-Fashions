import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../../services/productService";
import { TagsInput } from "react-tag-input-component";

export default function EditProductForm() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    image: "",
    stock: 100,
    attributes: [],
    variant_values: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newVariant, setNewVariant] = useState({
    attributes: [{ name: "", value: [] }], // Changed value to an array for multiple values
    price: "",
    old_price: "",
    stock: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, categoryRes, productRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/brands"),
          axios.get("http://127.0.0.1:8000/api/categories"),
          getProductById(id),
        ]);

        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);

        const productData = productRes.data.data;
        setProduct({
          id: productData.id,
          name: productData.name || "",
          brand_id: productData.brand?.id || "",
          category_id: productData.category?.id || "",
          description: productData.description || "",
          image: productData.images || "",
          stock: productData.stock || 100,
          attributes: productData.attributes || [],
          variant_values: productData.variants || [],
        });
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể lấy dữ liệu từ API. Kiểm tra lại server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleVariantChange = (index, field, value) => {
    setProduct((prev) => {
      const updatedVariants = [...prev.variant_values];
      updatedVariants[index] = { ...updatedVariants[index], [field]: value };
      return { ...prev, variant_values: updatedVariants };
    });
  };

  const handleNewVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewVariantAttributesChange = (index, field, value) => {
    const updatedAttributes = [...newVariant.attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setNewVariant((prev) => ({ ...prev, attributes: updatedAttributes }));
  };

  const handleAddNewVariant = () => {
    setProduct((prev) => ({
      ...prev,
      variant_values: [...prev.variant_values, newVariant],
    }));
    setNewVariant({
      attributes: [{ name: "", value: [] }],
      price: "",
      old_price: "",
      stock: "",
    });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("brand_id", product.brand_id);
      formData.append("category_id", product.category_id);
      formData.append("description", product.description);
      formData.append("image", product.image);
      formData.append("stock", product.stock);
      formData.append("attributes", JSON.stringify(product.attributes));
      formData.append("variant_values", JSON.stringify(product.variant_values));
      formData.append("_method", "PUT");

      console.log("Dữ liệu gửi lên API:", Object.fromEntries(formData));
      await updateProduct(id, formData);
      alert("✅ Sản phẩm đã được cập nhật thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      alert("Lỗi khi cập nhật sản phẩm! Kiểm tra lại dữ liệu.");
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4 p-4 bg-light border rounded">
      <h2>Chỉnh sửa sản phẩm</h2>

      {/* Form nhập liệu cho sản phẩm */}
      <input
        className="form-control mb-2"
        placeholder="Tên sản phẩm"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />

      <select
        className="form-control mb-2"
        value={product.brand_id}
        onChange={(e) => setProduct({ ...product, brand_id: e.target.value })}
      >
        <option value="">Chọn thương hiệu</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      <select
        className="form-control mb-2"
        value={product.category_id}
        onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
      >
        <option value="">-- Chọn danh mục --</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Hiển thị danh sách biến thể hiện có */}
      <h4>Danh sách biến thể</h4>
      {product.variant_values.length > 0 ? (
        product.variant_values.map((variant, index) => {
          const variantDescription = variant.attributes
            .map((attr) => `${attr.value} ${attr.name}`)
            .join(" - ");

          return (
            <div key={index} className="p-2 border rounded mb-2">
              <span className="badge bg-secondary me-1">{variantDescription}</span>
              <input
                className="form-control mt-1"
                placeholder="Giá"
                type="number"
                value={variant.price || ""}
                onChange={(e) => handleVariantChange(index, "price", e.target.value)}
              />
              <input
                className="form-control mt-1"
                placeholder="Giá cũ"
                type="number"
                value={variant.old_price || ""}
                onChange={(e) => handleVariantChange(index, "old_price", e.target.value)}
              />
              <input
                className="form-control mt-1"
                placeholder="Tồn kho"
                type="number"
                value={variant.stock || ""}
                onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
              />
            </div>
          );
        })
      ) : (
        <p className="text-muted">Sản phẩm này chưa có biến thể.</p>
      )}

      {/* Thêm biến thể mới */}
      <h4>Thêm biến thể mới</h4>
      <div className="mb-3">
        {newVariant.attributes.map((attr, index) => (
          <div key={index} className="d-flex mb-2">
            <input
              className="form-control me-2"
              placeholder="Tên thuộc tính (ví dụ: Màu sắc)"
              value={attr.name}
              onChange={(e) =>
                handleNewVariantAttributesChange(index, "name", e.target.value)
              }
            />
            <TagsInput
              value={attr.value}
              onChange={(newTags) => {
                handleNewVariantAttributesChange(index, "value", newTags);
              }}
              name="value"
              placeHolder="Nhập giá trị thuộc tính"
              className="form-control"
            />
          </div>
        ))}
        <input
          className="form-control mt-1"
          placeholder="Giá"
          name="price"
          value={newVariant.price}
          onChange={handleNewVariantChange}
        />
        <input
          className="form-control mt-1"
          placeholder="Giá cũ"
          name="old_price"
          value={newVariant.old_price}
          onChange={handleNewVariantChange}
        />
        <input
          className="form-control mt-1"
          placeholder="Tồn kho"
          name="stock"
          value={newVariant.stock}
          onChange={handleNewVariantChange}
        />
      </div>
      <button className="btn btn-secondary" onClick={handleAddNewVariant}>
        Thêm biến thể mới
      </button>

      {/* Submit form */}
      <button className="btn btn-primary w-100 mt-3" onClick={handleSubmit}>
        Cập nhật sản phẩm
      </button>
    </div>
  );
}
