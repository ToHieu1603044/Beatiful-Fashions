import { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  getProductTrash,
  deleteProduct,
  restoreProduct,
} from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Tag,
  Slider,
  Image,
  message,
} from "antd";

const { Option } = Select;
const { Search } = Input;

type VariantType = {
  sku: string;
  price: number;
  old_price: number;
  stock: number;
  attributes: { name: string; value: string }[];
};

type ProductType = {
  id: number;
  name: string;
  brand: { id: number; name: string };
  category: { id: number; name: string };
  active: boolean;
  images?: string | null;
  galleries?: { id: number; image: string }[];
  variants: VariantType[];
};

const ProductTrash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState("");
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    fetchCategory();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectCategory, date, minPrice, maxPrice]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductTrash({
        search: searchTerm,
        category_id: selectCategory ? Number(selectCategory) : undefined,
        date: date,
      });

      setProducts(
        Array.isArray(response.data) ? response.data : response.data.data || []
      );
    } catch (error: any) {
      if (error.response?.status === 403) {
        navigate("/403");
      } else {
        console.error("Lỗi khi lấy sản phẩm:", error);
        message.error("Không thể tải sản phẩm");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        navigate("/403");
      } else {
        console.error("Lỗi khi tải danh mục:", error);
      }
    }
  };

  const handleRestore = async (id: number) => {
    try {
     const response =  await restoreProduct(id);
      message.success(response.data.message);
      fetchProducts();
    } catch (error: any) {
      message.error(error.response.data.message);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      onOk: async () => {
        try {
         const response = await deleteProduct(id);
          message.success(response.data.message);
          fetchProducts();
        } catch (error: any) {
          message.error(error.response.data.message);
        }
      },
    });
  };

  const handleShowModal = (product: ProductType) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
      key: "brand",
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Deactive</Tag>
        ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "images",
      render: (img: string, record: ProductType) => (
        <Image.PreviewGroup>
          <Image
            width={50}
            src={
              img
                ? `http://127.0.0.1:8000/storage/${img}`
                : "https://placehold.co/50x50"
            }
          />
          {record.galleries?.map((g) => (
            <Image
              key={g.id}
              width={50}
              src={`http://127.0.0.1:8000/storage/${g.image}`}
            />
          ))}
        </Image.PreviewGroup>
      ),
    },
    {
      title: "Hành động",
      render: (_: any, record: ProductType) => (
        <>
          <Button type="default" onClick={() => handleShowModal(record)} style={{ marginRight: 8 }}>
            Xem
          </Button>
          {/* <Button type="primary" danger onClick={() => handleDelete(record.id)} style={{ marginRight: 8 }}>
            Xóa
          </Button> */}
          <Button onClick={() => handleRestore(record.id)}>Khôi phục</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Danh sách sản phẩm đã xóa</h2>

      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <Search
          placeholder="Tìm kiếm sản phẩm..."
          allowClear
          onSearch={(value) => setSearchTerm(value)}
          style={{ width: 200 }}
        />

        <Select
          placeholder="Chọn danh mục"
          allowClear
          style={{ width: 180 }}
          onChange={(value) => setSelectedCategory(value)}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>

        <Select
          placeholder="Ngày tạo"
          allowClear
          style={{ width: 120 }}
          onChange={(value) => setDate(value)}
        >
          <Option value="desc">Mới nhất</Option>
          <Option value="asc">Cũ nhất</Option>
        </Select>

        <div style={{ width: 200 }}>
          <label>Giá: {minPrice} - {maxPrice}</label>
          <Slider
            range
            min={10}
            max={1000}
            step={10}
            defaultValue={[minPrice, maxPrice]}
            onChange={(val) => {
              setMinPrice(val[0]);
              setMaxPrice(val[1]);
            }}
          />
        </div>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={products}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title="Chi tiết sản phẩm"
      >
        {selectedProduct && (
          <div>
            <p><strong>ID:</strong> {selectedProduct.id}</p>
            <p><strong>Tên:</strong> {selectedProduct.name}</p>
            <p><strong>Thương hiệu:</strong> {selectedProduct.brand.name}</p>
            <p><strong>Danh mục:</strong> {selectedProduct.category.name}</p>
            <p>
              <Image
                src={
                  selectedProduct.images
                    ? `http://127.0.0.1:8000/storage/${selectedProduct.images}`
                    : "https://placehold.co/100x100"
                }
                width={100}
              />
            </p>
            <p><strong>Biến thể:</strong></p>
            <ul>
              {selectedProduct.variants.map((variant, idx) => (
                <li key={idx}>
                  <strong>SKU:</strong> {variant.sku},{" "}
                  <strong>Giá:</strong> {variant.price.toLocaleString()} VNĐ,{" "}
                  <strong>Kho:</strong> {variant.stock} <br />
                  <em>
                    {variant.attributes
                      .map((attr) => `${attr.name}: ${attr.value}`)
                      .join(", ")}
                  </em>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Outlet />
    </div>
  );
};

export default ProductTrash;
