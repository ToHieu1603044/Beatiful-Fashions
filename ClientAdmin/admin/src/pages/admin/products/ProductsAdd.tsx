import { useState, useEffect } from "react";
import { TagsInput } from "react-tag-input-component";
import Swal from 'sweetalert2'
import CreatableSelect from "react-select/creatable";
import "bootstrap/dist/css/bootstrap.min.css";
import { createProduct } from "../../../services/productService";
import { axiosInstance } from "../../../services/axiosInstance";
import DescriptionEditor from "../../../components/admin/DescriptionEditor";
import { useNavigate } from "react-router-dom";
import { Button } from 'antd';
import { Plus } from "lucide-react";
import { message } from "antd";

export default function AddProductForm() {
  const [product, setProduct] = useState({
    name: "",
    brand_id: "",
    category_id: "",
    description: "",
    active: true,
    image: [],
    galleryImages: [],
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
  const navigate = useNavigate();
  const [attributesList, setAttributesList] = useState<{ id: number; name: string }[]>([]);
  const [attributeOptions, setAttributeOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axiosInstance.get("/brands");
        const categoryRes = await axiosInstance.get("/categories");
        const responseattr = await axiosInstance.get("/attributes");

        console.log("attr", responseattr.data);
        setAttributesList(responseattr.data || []);
        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);

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
  }, []);
  useEffect(() => {
    const fetchAttributeOptions = async () => {
      try {
        const response = await axiosInstance.get("/attribute-options");
        console.log("response", response);
        const options = response.data.map((option) => ({
          label: option.value,
          value: option.id,
        }));

        console.log("options", options);
        setAttributeOptions(options);
      } catch (error) {
        console.error("Lỗi khi lấy attribute options:", error);
      }
    };

    fetchAttributeOptions();
  }, []);

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
  };
  const handleAttributeChange = (e) => {
    const attributeId = e.target.value;
    setSelectedAttribute(attributeId);

    // Tìm thuộc tính đã chọn trong danh sách
    const attribute = attributesList.find(attr => attr.id.toString() === attributeId);

    if (attribute) {
      const filteredOptions = attribute.values.map(value => ({
        label: value.value, // Hiển thị tên giá trị
        value: value.id, // ID của giá trị
      }));
      setAttributeOptions(filteredOptions);
    } else {
      setAttributeOptions([]); // Không có giá trị thì reset
    }

    setSelectedOptions([]); // Reset giá trị đã chọn
  };
  const addAttribute = () => {
    if (!selectedAttribute || selectedOptions.length === 0) return;
    const existingAttr = product.attributes.find(attr => attr.name === attributesList.find(a => a.id == selectedAttribute)?.name);
    if (existingAttr) {
      Swal.fire("Cảnh báo", "Thuộc tính này đã được thêm!", "warning");
      return;
    }
    const attributeName = attributesList.find(attr => attr.id.toString() === selectedAttribute)?.name;

    setProduct((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        { name: attributeName, values: selectedOptions.map(opt => opt.label) }, // Lưu giá trị đã chọn
      ],
    }));

    setSelectedAttribute("");
    setSelectedOptions([]);
    setAttributeOptions([]);
  };

  const generateVariants = () => {
    if (product.attributes.length === 0) {
      alert("Vui lòng thêm ít nhất một thuộc tính!");
      return;
    }

    if (product.variant_values.length > 0) {
      Swal.fire({
        title: "Xác nhận",
        text: "Bạn đã sinh biến thể rồi. Có muốn tạo lại không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Tạo lại",
      }).then((result) => {
        if (result.isConfirmed) {
          generateNewVariants();
        }
      });
    } else {
      generateNewVariants();
    }
  };
  // const generateVariants = () => {
  //   if (product.attributes.length === 0) {
  //     alert("Vui lòng thêm ít nhất một thuộc tính!");
  //     return;
  //   }

  //   if (product.variant_values.length > 0) {
  //     Swal.fire({
  //       title: "Xác nhận",
  //       text: "Bạn đã sinh biến thể rồi. Có muốn tạo lại không?",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonText: "Tạo lại",
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         generateNewVariants();
  //       }
  //     });
  //   } else {
  //     generateNewVariants();
  //   }
  // };

  // const generateNewVariants = () => {
  //   let combinations = [[]];
  //   product.attributes.forEach((attr) => {
  //     let temp = [];
  //     attr.values.forEach((value) => {
  //       combinations.forEach((combo) => {
  //         temp.push([...combo, value]);
  //       });
  //     });
  //     combinations = temp;
  //   });

  //   const variant_values = combinations.map((comb) => ({
  //     variant_combination: comb,
  //     price: 0,
  //     old_price: 0,
  //     stock: 0,
  //   }));

  //   setProduct((prev) => ({ ...prev, variant_values }));
  // };

  const generateNewVariants = () => {
    let combinations = [[]];
    product.attributes.forEach((attr) => {
      let temp = [];
      attr.values.forEach((value) => {
        combinations.forEach((combo) => {
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
  const handleDeleteVariant = (index: number) => {
    setProduct((prev) => {
      const updatedVariants = prev.variant_values.filter((_, i) => i !== index);
      return { ...prev, variant_values: updatedVariants };
    });
  };
  const handleRemoveAttribute = (attributeName) => {
    setProduct((prev) => ({
      ...prev,
      attributes: prev.attributes.filter(attribute => attribute.name !== attributeName)
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProduct((prev) => ({
      ...prev,
      image: file,
    }));

  };
  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({
      ...prev,
      galleryImages: files,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const outputData = {
      name: product.name,
      images: product.image,
      image: product.galleryImages,
      description: product.description,
      active: product.active,
      category_id: product.category_id,
      brand_id: product.brand_id,
      stock: product.stock,
      attributes: product.attributes.map((attr) => ({
        name: attr.name,
        values: attr.values,
      })),
      variant_values: product.variant_values.map((variant) => ({
        variant_combination: variant.variant_combination,
        price: variant.price,
        old_price: variant.old_price,
        stock: variant.stock,
      })),
    };

    try {
      console.log("Dữ liệu gửi lên API:", outputData);
      const response = await createProduct(outputData);

      if (response.status === 200 || response.status === 201) {
        message.success(response.data.message);
      }
    } catch (error) {

      const errorMessage = error.response?.data?.message || "Lỗi khi thêm sản phẩm";

      Swal.fire({
        title: "Lỗi!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-4">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4 p-4 bg-light border rounded">
      <h2 className="text-center mb-4">Thêm sản phẩm</h2>

      <div className="row">
        <div className="col-md-6"> {/* Form on the left */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="productName">Tên sản phẩm</label>
                <input
                  id="productName"
                  className="form-control"
                  placeholder="Nhập tên sản phẩm"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="mainImage">Ảnh chính</label>
                <input
                  id="mainImage"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Gallery Upload */}
              <div className="mb-3">
                <label className="form-label" htmlFor="galleryImages">Ảnh gallery</label>
                <input
                  id="galleryImages"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
              </div>

              {/* Brand Selection */}
              <div className="mb-3">
                <label className="form-label" htmlFor="brandSelect">Chọn thương hiệu</label>
                <select
                  id="brandSelect"
                  className="form-control"
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
              </div>

              {/* Category Selection */}
              <div className="mb-3">
                <label className="form-label" htmlFor="categorySelect">Chọn danh mục</label>
                <select
                  id="categorySelect"
                  className="form-control"
                  value={product.category_id}
                  onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {renderCategoryTree(categories)}
                </select>
              </div>

              <DescriptionEditor product={product} setProduct={setProduct} />

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
            </div>
          </div>

          {/* Attributes and Variants Section */}
          <h4>Thuộc tính</h4>
          <div className="mb-3">
            {/* Chọn thuộc tính */}
            <div className="mb-3">
              <label className="form-label">Chọn thuộc tính</label>
              <select
                className="form-control"
                value={selectedAttribute}
                onChange={handleAttributeChange}
              >
                <option value="">-- Chọn thuộc tính --</option>
                {attributesList.map((attr) => (
                  <option key={attr.id} value={attr.id}>
                    {attr.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn giá trị thuộc tính */}
            <div>
              <label className="form-label">Chọn giá trị</label>
              <CreatableSelect
                isMulti
                options={attributeOptions} // Lọc danh sách giá trị theo thuộc tính đã chọn
                value={selectedOptions}
                onChange={setSelectedOptions}
                placeholder="Nhập giá trị hoặc chọn từ danh sách..."
                isClearable
              />
            </div>

            <Button

              onClick={addAttribute}>
              Thêm thuộc tính
            </Button>
          </div>

          <ul className="list-group mb-3">
            {product.attributes.map((attr, index) => (
              <li key={index} className="list-group-item">
                <strong>{attr.name}:</strong> {attr.values.join(", ")}
                <Button
                  onClick={() => handleRemoveAttribute(attr.name)}
                  className="btn btn-danger float-end"
                >Xóa</Button>
              </li>

            ))}
          </ul>

          <Button onClick={generateVariants}>
            Tạo biến thể
          </Button>

          {product.variant_values.length > 0 && (
            <div className="mt-3">
              <h4>Danh sách biến thể</h4>
              {product.variant_values.map((variant, index) => (
                <div key={index} className="p-2 border rounded mb-2">
                  {variant.variant_combination.map((value, i) => (
                    <span key={i} className="badge bg-secondary me-1">{value}</span>
                  ))}
                  <input
                    className="form-control mt-1"
                    placeholder="Giá"
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  />
                  <input
                    className="form-control mt-1"
                    placeholder="Giá cũ"
                    type="number"
                    value={variant.old_price}
                    onChange={(e) => handleVariantChange(index, "old_price", e.target.value)}
                  />
                  <input
                    className="form-control mt-1"
                    placeholder="Tồn kho"
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                  />
                  {/* Nút xóa biến thể */}
                  <button
                    className="btn btn-danger mt-2"
                    onClick={() => handleDeleteVariant(index)}
                  >
                    Xóa biến thể
                  </button>
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-danger w-100 mt-3" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              "Lưu sản phẩm"
            )}
          </button>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h4 className="card-title">Ảnh sản phẩm</h4>

              {product.image && product.image instanceof File && (
                <div className="text-center mb-2">
                  <img
                    src={URL.createObjectURL(product.image)}
                    alt="Main Product"
                    className="img-thumbnail"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              )}
              {/* Gallery Images */}
              <div className="d-flex flex-wrap">
                {product.galleryImages.map((file, index) => (
                  file instanceof File && (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Gallery Image ${index + 1}`}
                      className="img-thumbnail me-2 mb-2"
                      style={{ maxWidth: '100px', height: 'auto' }}
                    />
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
