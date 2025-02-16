import { useState, useEffect } from "react";
import axios from "axios";
import { TagsInput } from "react-tag-input-component";
import "bootstrap/dist/css/bootstrap.min.css";
import { createProduct } from "../../../services/productService"; // Sử dụng API tạo sản phẩm mới
import { updateProduct } from "../../../services/productService"; // API để cập nhật sản phẩm

export default function AddProductForm({ productId }: { productId?: number }) {
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

  type CategoryType = {
    id: number;
    name: string;
    parent_id?: number | null;
    children: CategoryType[];
  };

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [attributeName, setAttributeName] = useState("");
  const [attributeValues, setAttributeValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axios.get("http://127.0.0.1:8000/api/brands");
        const categoryRes = await axios.get("http://127.0.0.1:8000/api/categories");

        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể lấy dữ liệu từ API. Kiểm tra lại server.");
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      const fetchProduct = async () => {
        try {
          console.log("productId", productId);
          const res = await axios.get(`http://127.0.0.1:8000/api/products/${productId}`);
          console.log("AAAA");
          setProduct(res.data);
        } catch (err) {
          console.error("Lỗi khi lấy sản phẩm:", err);
          setError("Không thể lấy dữ liệu sản phẩm.");
        }
      };
      fetchProduct();
    } else {
      fetchData();
    }
  }, [productId]);

  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
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

  const handleVariantChange = (index: number, field: string, value: number) => {
    setProduct((prev) => {
      const updatedVariants = [...prev.variant_values];
      updatedVariants[index][field] = value;
      return { ...prev, variant_values: updatedVariants };
    });
  };

  const handleSubmit = async () => {
    const outputData = {
      name: product.name,
      image: product.image,
      description: product.description,
      category_id: product.category_id,
      brand_id: product.brand_id,
      stock: product.stock,
      attributes: product.attributes.map((attr) => ({
        name: attr.name,
        value: attr.value,
      })),
      variant_values: product.variant_values.map((variant) => ({
        variant_combination: variant.variant_combination,
        price: variant.price,
        old_price: variant.old_price,
        stock: variant.stock,
      })),
    };

    try {
      if (productId) {
        const response = await updateProduct(productId, outputData); // API cập nhật
        console.log("Sản phẩm đã sửa:", response.data);
        alert("✅ Sản phẩm đã được sửa thành công!");
      } else {
        const response = await createProduct(outputData); // API tạo sản phẩm mới
        console.log("Sản phẩm đã thêm:", response.data);
        alert("✅ Sản phẩm đã được thêm thành công!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm sửa sản phẩm:", error);
      alert("Lỗi khi thêm sửa sản phẩm! Kiểm tra lại dữ liệu.");
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4 p-4 bg-light border rounded">
      <h2>{productId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

      <input
        className="form-control mb-2"
        placeholder="Tên sản phẩm"
        value={product.name || ""}  // Đảm bảo luôn có giá trị
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="URL hình ảnh sản phẩm"
        value={product.image || ""}  // Đảm bảo luôn có giá trị
        onChange={(e) => setProduct({ ...product, image: e.target.value })}
      />

      <select
        className="form-control mb-2"
        value={product.brand_id || ""}  // Đảm bảo luôn có giá trị
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
        value={product.category_id || ""}  // Đảm bảo luôn có giá trị
        onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
      >
        <option value="">-- Chọn danh mục --</option>
        {renderCategoryTree(categories)}
      </select>

      <textarea
        className="form-control mb-2"
        placeholder="Mô tả sản phẩm"
        value={product.description || ""}  // Đảm bảo luôn có giá trị
        onChange={(e) => setProduct({ ...product, description: e.target.value })}
      />

      <h4>Thuộc tính</h4>
      <input
        className="form-control mb-2"
        placeholder="Tên thuộc tính"
        value={attributeName || ""}  // Đảm bảo luôn có giá trị
        onChange={(e) => setAttributeName(e.target.value)}
      />
      <TagsInput value={attributeValues} onChange={setAttributeValues} placeHolder="Nhập giá trị và nhấn Enter" />
      <button className="btn btn-primary mt-2" onClick={addAttribute}>
        Thêm thuộc tính
      </button>

      <h4 className="mt-4">Danh sách thuộc tính</h4>
      {product.attributes.length > 0 && (
        <ul className="list-group mb-3">
          {product.attributes.map((attr, index) => (
            <li key={index} className="list-group-item">
              <strong>{attr.name}:</strong> {attr.value}
            </li>
          ))}
        </ul>
      )}

      <button className="btn btn-success mt-3" onClick={generateVariants}>
        Tạo biến thể
      </button>

      {product.variant_values.length > 0 && (
        <div className="mt-3">
          <h4>Danh sách biến thể</h4>
          {product.variant_values.map((variant, index) => (
            <div key={index} className="p-2 border rounded mb-2">
              {variant.variant_combination.map((value, i) => (
                <span key={i} className="badge bg-secondary me-1">
                  {value}
                </span>
              ))}
              <input className="form-control mt-1" placeholder="Giá" type="number" onChange={(e) => handleVariantChange(index, "price", +e.target.value)} />
              <input className="form-control mt-1" placeholder="Giá cũ" type="number" onChange={(e) => handleVariantChange(index, "old_price", +e.target.value)} />
              <input className="form-control mt-1" placeholder="Tồn kho" type="number" onChange={(e) => handleVariantChange(index, "stock", +e.target.value)} />
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-danger w-100 mt-3" onClick={handleSubmit}>
        {productId ? "Cập nhật sản phẩm" : "Lưu sản phẩm"}
      </button>
    </div>
  );
}
