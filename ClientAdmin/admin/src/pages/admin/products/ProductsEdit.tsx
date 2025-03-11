import { useState, useEffect } from "react";
import { TagsInput } from "react-tag-input-component";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { getProductById, updateProduct } from "../../../services/productService";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../services/axiosInstance";

export default function EditProductForm() {
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    active: false,
    image: [],
    galleryImages: [],
    attributes: [],
    variant_values: [],
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributeName, setAttributeName] = useState("");
  const [attributeValues, setAttributeValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newVariant, setNewVariant] = useState({
    attributes: [{ name: "", value: [] }],
    price: "",
    old_price: "",
    stock: "",
  });
  const [attributesList, setAttributesList] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axiosInstance.get("/brands");
        const categoryRes = await axiosInstance.get("/categories");
        const productRes = await getProductById(id);
        const response = await axiosInstance.get("/attributes");

        setAttributesList(response.data || []);
        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);
        const productData = productRes.data.data;

        const extractedAttributes = [];
        productData.variants.forEach((variant) => {
          variant.attributes.forEach((attr) => {
            let existingAttr = extractedAttributes.find((a) => a.name === attr.name);
            if (existingAttr) {
              if (!existingAttr.value.includes(attr.value)) {
                existingAttr.value.push(attr.value);
              }
            } else {
              extractedAttributes.push({ name: attr.name, value: [attr.value] });
            }
          });
        });


        setProduct({
          id: productData.id,
          name: productData.name,
          brand_id: productData.brand?.id || "",
          category_id: productData.category?.id || "",
          description: productData.description || "",
          active: productData.active || false,
          images: productData.images || "",
          image: productData.image || [],
          attributes: extractedAttributes, // Gán danh sách thuộc tính lấy từ variants
          variant_values: productData.variants?.map((variant) => ({
            sku: variant.sku,
            price: variant.price,
            old_price: variant.old_price,
            stock: variant.stock,
            variant_combination: variant.attributes.map((attr) => attr.value) || [],
          })) ?? [],
        });
      } catch (err) {
        if (err.response?.status === 403) {
          window.location.href = "/403";
        } else {
          console.error("Lỗi khi tải dữ liệu:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


  const renderCategoryTree = (categories, level = 0) => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };

  const addAttribute = () => {
    if (!attributeName.trim() || attributeValues.length === 0) return;

    setProduct((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { name: attributeName, value: attributeValues.join(", ") },
      ],
    }));

    setAttributeName("");
    setAttributeValues([]);
  };

  const handleVariantChange = (index, field, value) => {
    setProduct((prev) => {
      const updatedVariants = [...prev.variant_values];
      updatedVariants[index][field] = value;
      return { ...prev, variant_values: updatedVariants };
    });
  };

  const handleNewVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewVariantAttributeChange = (index, field, value) => {
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

  const generateVariants = () => {
    if (product.attributes.length === 0) {
      alert("Vui lòng thêm ít nhất một thuộc tính!");
      return;
    }

    let combinations = [[]];

    product.attributes.forEach((attr) => {
      let temp = [];
      combinations.forEach((combo) => {
        attr.value.split(", ").forEach((value) => {
          temp.push([...combo, value]);
        });
      });
      combinations = temp;
    });

    const variant_values = combinations.map((comb) => ({
      variant_combination: comb,
      price: 0,
      old_price: 0,
      stock: 0,
    }));

    setProduct((prev) => ({ ...prev, variant_values }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProduct((prev) => ({
      ...prev,
      image: file,
    }));
  };
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      galleryImages: files,
    }));
  };
  const handleSubmit = async () => {

    const FormData = {
      name: product.name,
      images: product.image,
      image: product.galleryImages,
      description: product.description,
      category_id: product.category_id,
      brand_id: product.brand_id,
      active: Boolean(product.active),
      stock: product.stock,
      attributes: product.attributes.map((attr) => ({
        name: attr.name,
        values: Array.isArray(attr.value) ? attr.value : attr.value.split(", "),
      })),

      variant_values: product.variant_values.map((variant) => ({
        variant_combination: variant.variant_combination,
        price: variant.price,
        old_price: variant.old_price,
        stock: variant.stock,
      })),
    };

    try {
      console.log("Dữ liệu gửi lên API:", JSON.stringify(FormData, null, 2));

      await updateProduct(id, FormData);
      alert("Sản phẩm đã được cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      alert("Lỗi khi cập nhật sản phẩm! Kiểm tra lại dữ liệu.");
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4 p-4 bg-light border rounded">
      <h2>Chỉnh sửa sản phẩm</h2>

      <input
        className="form-control mb-2"
        placeholder="Tên sản phẩm"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />

      <label className="form-label" htmlFor="Image">Image</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        onChange={handleImageChange}
      />

      <label className="form-label" htmlFor="Galleries">Galleries</label>
      <input
        type="file"
        className="form-control mb-2"
        accept="image/*"
        multiple
        onChange={handleGalleryChange}
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
        {renderCategoryTree(categories)}
      </select>

      <textarea
        className="form-control mb-2"
        placeholder="Mô tả sản phẩm"
        value={product.description}
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
      />
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="activeSwitch"
          checked={product.active}
          onChange={(e) => setProduct({ ...product, active: e.target.checked })}
        />
        <label className="form-check-label" htmlFor="activeSwitch">
          {product.active ? "Sản phẩm đang hoạt động" : "Sản phẩm bị vô hiệu hóa"}
        </label>
      </div>
      <h4>Thuộc tính</h4>
      <div className="mb-3">
        <label className="form-label" htmlFor="attributeSelect">Chọn thuộc tính</label>
        <select
          id="attributeSelect"
          className="form-control"
          value={attributeName}
          onChange={(e) => setAttributeName(e.target.value)}
        >
          <option value="">-- Chọn thuộc tính --</option>
          {attributesList.map((attr) => (
            <option key={attr.id} value={attr.name}>
              {attr.name}
            </option>
          ))}
        </select>
      </div>

      <TagsInput value={attributeValues} onChange={setAttributeValues} placeHolder="Nhập giá trị và nhấn Enter" />
      <button className="btn btn-primary mt-2" onClick={addAttribute}>
        Thêm thuộc tính
      </button>

      <h4 className="mt-4">Danh sách thuộc tính</h4>
      {product.attributes.length > 0 && (
        <ul className="list-group mb-3">
          {product.attributes.map((attr, index) => (
            <li key={index} className="list-group-item">
              <strong>{attr.name}:</strong> {attr.value.join(", ")}

            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-success mt-3" onClick={generateVariants}>
        Tạo biến thể
      </button>

      <h4>Danh sách biến thể</h4>
      {product.variant_values.length > 0 ? (
        product.variant_values.map((variant, index) => {
          const variantDescription = variant.variant_combination.join(" - ");
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
      <button className="btn btn-danger w-100 mt-3" onClick={handleSubmit}>
        Cập nhật sản phẩm
      </button>
    </div>
  );
}