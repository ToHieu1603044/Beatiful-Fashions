import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Input, Select, Switch, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../services/axiosInstance";
import { getProductById, updateProduct } from "../../../services/productService";
import { TagsInput } from "react-tag-input-component";

const { Option } = Select;

export default function EditProductForm() {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [galleries, setGalleries] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const [brandRes, categoryRes, productRes, attrRes] = await Promise.all([
          axiosInstance.get("/brands"),
          axiosInstance.get("/categories"),
          getProductById(id),
          axiosInstance.get("/attributes"),
        ]);

        setBrands(brandRes.data.data || []);
        setCategories(categoryRes.data || []);
        setAttributes(attrRes.data || []);

        const product = productRes.data.data;
        form.setFieldsValue({
          name: product.name,
          brand_id: product.brand?.id,
          category_id: product.category?.id,
          description: product.description,
          active: product.active,
        });

        setVariants(
          product.variants.map((variant) => ({
            attributes: variant.attributes.map((attr) => ({
              attribute: attr.name,
              value: attr.value,
            })),
            price: variant.price || "",
            old_price: variant.old_price || "",
            stock: variant.stock || "",
          }))
        );

      } catch (err) {
        message.error("Lỗi khi tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, form]);

  const addAttribute = (attributeId) => {
    if (selectedAttributes.some((attr) => attr.id === attributeId)) {
      message.warning("Thuộc tính đã tồn tại!");
      return;
    }
    const attribute = attributes.find((a) => a.id === attributeId);
    setSelectedAttributes([...selectedAttributes, { ...attribute, values: [] }]);
  };

  const updateAttributeValues = (attributeId, values) => {
    setSelectedAttributes((prev) =>
      prev.map((attr) =>
        attr.id === attributeId ? { ...attr, values } : attr
      )
    );
  };

  const generateVariants = () => {
    if (selectedAttributes.length === 0) {
      message.warning("Vui lòng chọn ít nhất một thuộc tính!");
      return;
    }

    let allCombinations = [{}];

    selectedAttributes.forEach((attr) => {
      let temp = [];
      allCombinations.forEach((combination) => {
        attr.values.forEach((value) => {
          temp.push({
            ...combination,
            [attr.id]: { attribute: attr.name, value },
          });
        });
      });
      allCombinations = temp;
    });

    setVariants(
      allCombinations.map((combination) => ({
        attributes: Object.values(combination),
        price: "",
        old_price: "",
        stock: "",
      }))
    );
  };
  const formattedAttributes = [];

  variants.forEach((variant) => {
    variant.attributes.forEach((attr) => {
      let existingAttr = formattedAttributes.find((a) => a.name === attr.attribute);
      if (existingAttr) {
        existingAttr.values.push(attr.value);
      } else {
        formattedAttributes.push({ name: attr.attribute, values: [attr.value] });
      }
    });
  });
  const formattedVariants = variants
    .filter((variant) => variant.price && variant.stock) // Loại bỏ biến thể không có giá
    .map((variant) => ({
      variant_combination: variant.attributes.map((attr) => attr.value),
      price: Number(variant.price),
      old_price: variant.old_price ? Number(variant.old_price) : null,
      stock: Number(variant.stock),
    }));



  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };
  const removeAttribute = (attributeId) => {
    setSelectedAttributes((prev) => prev.filter((attr) => attr.id !== attributeId));
  };
  const handleGalleryChange = ({ fileList }) => {
    setGalleries(fileList);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("brand_id", values.brand_id);
    formData.append("category_id", values.category_id);
    formData.append("description", values.description);
    formData.append("active", values.active ? 1 : 0); // Chuyển về boolean

    // Fix lỗi gửi attributes (Laravel yêu cầu mảng chứ không phải chuỗi JSON)
    formattedAttributes.forEach((attr, index) => {
      formData.append(`attributes[${index}][name]`, attr.name);
      attr.values.forEach((value, valueIndex) => {
        formData.append(`attributes[${index}][values][${valueIndex}]`, value);
      });
    });

    // Fix lỗi gửi variants (cần format lại dữ liệu đúng dạng mảng)
    formattedVariants.forEach((variant, index) => {
      variant.variant_combination.forEach((value, valueIndex) => {
        formData.append(`variant_values[${index}][variant_combination][${valueIndex}]`, value);
      });
      formData.append(`variant_values[${index}][price]`, variant.price.toString());
      formData.append(`variant_values[${index}][old_price]`, variant.old_price?.toString() ?? "0");
      formData.append(`variant_values[${index}][stock]`, variant.stock.toString());
    });

    // Xử lý hình ảnh
    if (values.image?.file) {
      formData.append("images", values.image.file);
    }

    // Xử lý gallery (đảm bảo gửi danh sách ảnh)
    galleries.forEach((file, index) => {
      if (file.originFileObj) {
        formData.append(`galleries[${index}]`, file.originFileObj);
      }
    });

    try {
      await updateProduct(id, formData);
      message.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      message.error("Lỗi khi cập nhật sản phẩm!");
      console.error(error);
    }
  };


  const handleVariantChange = (index, field, value) => {
    setVariants((prevVariants) =>
      prevVariants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };


  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical" disabled={loading}>
      <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: "Bắt buộc!" }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Ảnh sản phẩm" name="image">
        <Upload listType="picture" maxCount={1} beforeUpload={() => false}>
          <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Thư viện ảnh" name="galleries">
        <Upload
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          fileList={galleries}
          onChange={handleGalleryChange}
        >
          <Button icon={<UploadOutlined />}>Tải lên</Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Thương hiệu" name="brand_id" rules={[{ required: true, message: "Bắt buộc!" }]}>
        <Select placeholder="Chọn thương hiệu">
          {brands.map((brand) => (
            <Option key={brand.id} value={brand.id}>{brand.name}</Option>
          ))}
        </Select>
      </Form.Item>


      <Form.Item label="Danh mục" name="category_id" rules={[{ required: true, message: "Bắt buộc!" }]}>
        <Select placeholder="Chọn danh mục">
          {renderCategoryTree(categories)}
        </Select>
      </Form.Item>
      <Form.Item label="Mô tả sản phẩm" name="description">
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item label="Trạng thái" name="active" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="Thuộc tính">
        <Select placeholder="Chọn một thuộc tính" onChange={addAttribute}>
          {attributes.map((attr) => (
            <Option key={attr.id} value={attr.id}>{attr.name}</Option>
          ))}
        </Select>
      </Form.Item>

      {selectedAttributes.map((attr) => (
        <Form.Item key={attr.id} label={`Giá trị của ${attr.name}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TagsInput
              value={attr.values}
              onChange={(values) => updateAttributeValues(attr.id, values)}
              placeHolder="Nhập giá trị và nhấn Enter"
            />
            <Button type="danger" onClick={() => removeAttribute(attr.id)}>Xóa</Button>
          </div>
        </Form.Item>
      ))}


      <Button type="primary" onClick={generateVariants}>Tạo biến thể</Button>

      <h4>Danh sách biến thể</h4>
      {variants.map((variant, index) => (
        <div key={index} style={{ border: "1px solid #ddd", padding: 10, marginTop: 10 }}>
          <p>{variant.attributes.map((attr) => `${attr.attribute}: ${attr.value}`).join(" - ")}</p>

          <Input
            placeholder="Giá"
            type="number"
            value={variant.price}
            onChange={(e) => handleVariantChange(index, "price", e.target.value)}
          />
          <Input
            placeholder="Giá nhập"
            type="number"
            value={variant.old_price}
            onChange={(e) => handleVariantChange(index, "old_price", e.target.value)}
          />
          <Input
            placeholder="Tồn kho"
            type="number"
            value={variant.stock}
            onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
          />

        </div>
      ))}

      <Button type="primary" htmlType="submit" block>Cập nhật sản phẩm</Button>
    </Form>
  );
}