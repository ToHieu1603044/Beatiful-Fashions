import { useState, useEffect } from "react";
import { TagsInput } from "react-tag-input-component";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { updateProduct, getProductById } from "../../../services/productService";

export default function EditProductForm() {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    image: "",
    stock: 100, // Default stock
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

  // Fetch existing product data and other necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands and categories
        const brandRes = await axios.get("http://127.0.0.1:8000/api/brands");
        const categoryRes = await axios.get("http://127.0.0.1:8000/api/categories");

        // Log to check if the API response is correct
        console.log("Brand Data: ", brandRes.data);
        console.log("Category Data: ", categoryRes.data);

        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);

        // Fetch product by ID
        const productRes = await getProductById(id);
        
        // Log the product data to check if the correct data is returned
        console.log("Product Data: ", productRes.data);
        setProduct(productRes.data);

      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setError("Không thể lấy dữ liệu từ API. Kiểm tra lại server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  const handleVariantChange = (index, field, value) => {
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
      console.log("Dữ liệu gửi lên API:", outputData); // Kiểm tra dữ liệu
      const response = await updateProduct(id, outputData); // Use the update API
      console.log("Sản phẩm đã cập nhật:", response.data);
      alert("✅ Sản phẩm đã được cập nhật thành công!");
      navigate(`/admin/products`); // Redirect after update
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
   
      <input
        className="form-control mb-2"
        placeholder="Tên sản phẩm"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
      />

      <input
        className="form-control mb-2"
        placeholder="URL hình ảnh sản phẩm"
        value={product.image}
        onChange={(e) => setProduct({ ...product, image: e.target.value })}
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

      <h4>Thuộc tính</h4>
      <input
        className="form-control mb-2"
        placeholder="Tên thuộc tính"
        value={attributeName}
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
              <input className="form-control mt-1" placeholder="Giá" type="number" onChange={(e) => handleVariantChange(index, "price", e.target.value)} />
              <input className="form-control mt-1" placeholder="Giá cũ" type="number" onChange={(e) => handleVariantChange(index, "old_price", e.target.value)} />
              <input className="form-control mt-1" placeholder="Tồn kho" type="number" onChange={(e) => handleVariantChange(index, "stock", e.target.value)} />
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-danger w-100 mt-3" onClick={handleSubmit}>
        Cập nhật sản phẩm
      </button>
    </div>
  );
}
