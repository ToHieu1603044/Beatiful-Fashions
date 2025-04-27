import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { getProducts, deleteProduct, updateProductStatus } from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import { Table, Button, Input, Select, Modal, Badge, Space, Pagination, Image, Switch, message, Dropdown, Menu } from "antd";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { BsFilter } from "react-icons/bs";
import DeleteButton from "../../../components/DeleteButton ";
const { Option } = Select;

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootProducts = location.pathname === "/admin/products";
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getProducts({
        search: searchTerm,
        category_id: selectedCategory || undefined,
        active: selectedStatus !== "" ? selectedStatus : undefined,
        page,
      });
      setProducts(response.data.data || []);
      setCurrentPage(response.data.page.currentPage);
      setLastPage(response.data.page.lastPage);
    } catch (error) {
      console.log(error);
      console.error("Lỗi khi lấy sản phẩm:", error);
      
      if (error.response?.status === 403) {
        navigate("/403");
      } else {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };
  const filterMenu = (
    <Menu>
    <Menu.Item key="1" onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Select
          placeholder="Danh mục"
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>{category.name}</Option>
          ))}
        </Select>
  
        <Select
          placeholder="Trạng thái"
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 200 }}
        >
          <Option value="">Tất cả</Option>
          <Option value="1">Active</Option>
          <Option value="0">Inactive</Option>
        </Select>
  
        <Button icon={<BsFilter />} onClick={() => fetchProducts(1)}>Lọc</Button>
      </div>
    </Menu.Item>
  </Menu>
  
  );
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này không?",
      onOk: async () => {
        try {
        const response =  await deleteProduct(id);
          message.success(response.data.message);
          fetchProducts();
        } catch (error) {
          console.error("Lỗi khi xóa sản phẩm:", error);
        }
      },
    });
  };
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = product.active ? 0 : 1; 
     const resStatus = await updateProductStatus(product.id, newStatus);
      message.success(resStatus.data.message);
      console.log("Sta",resStatus.data);
      fetchProducts(); 
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error(error.response.data.message);
    }
  };
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Thương hiệu", dataIndex: ["brand", "name"], key: "brand" },
    { title: "Danh mục", dataIndex: ["category", "name"], key: "category" },
    {
      title: "Hình ảnh",
      dataIndex: "galleries",
      key: "galleries",
      render: (galleries, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Ảnh chính */}
          <Image
            width={50}
            height={50}
            className="rounded-circle"
            src={record.images ? `http://127.0.0.1:8000/storage/${record.images}` : "https://placehold.co/50x50"}
            alt="main-product"
            style={{ zIndex: galleries?.length ? 2 : 1 }}
          />

          {/* Gallery stack */}
          <div style={{ display: "flex", position: "relative" }}>
            {galleries?.slice(0, 3).map((galleryImage, index) => (
              <img
                key={galleryImage.id}
                src={`http://127.0.0.1:8000/storage/${galleryImage.image}`}
                alt={`Gallery image ${index + 1}`}
                className="rounded-circle position-relative"
                style={{
                  width: "50px",
                  height: "50px",
                  marginLeft: index === 0 ? "0px" : "-20px",
                  zIndex: galleries.length - index,
                  border: "2px solid white",
                }}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active, record) => (
        <Switch
          checked={active === true || active === 1} 
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },

    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<BsEye />} onClick={() => setSelectedProduct(record)} />
          <Button icon={<BsPencilSquare />} onClick={() => navigate(`/admin/products/${record.id}/edit`)} />
          <Button icon={<BsTrash />} danger onClick={() => handleDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      {isRootProducts && (
        <>
          <h2>Danh sách Sản Phẩm</h2>
          <Button type="primary" onClick={() => navigate("/admin/products/create")}>Thêm mới</Button>

          <Input placeholder="Tìm kiếm sản phẩm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          <Dropdown
            overlay={filterMenu}
            trigger={["click"]}
            overlayStyle={{ minWidth: 250 }}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
          >
            <Button icon={<BsFilter />}>Lọc</Button>
          </Dropdown>


          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
          />

          <Pagination
            current={currentPage}
            total={lastPage * 10}
            onChange={(page) => fetchProducts(page)}
            className="mt-3"
          />

         <DeleteButton label="Đã xóa" navigateTo="/admin/products/trash"/>
        </>
      )}

      {selectedProduct && (
        <Modal
          visible={!!selectedProduct}
          title="Chi tiết sản phẩm"
          onCancel={() => setSelectedProduct(null)}
          footer={[<Button type="primary" onClick={() => setSelectedProduct(null)}>Đóng</Button>]}
          width={800} // Tăng kích thước modal
          style={{ top: 20 }} // Đưa modal xuống một chút
        >
          {selectedProduct && (
            <div style={{ display: "grid", gap: "15px" }}>
              {/* Thông tin sản phẩm */}
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <Image
                  width={150}
                  height={150}
                  style={{ borderRadius: 8, objectFit: "cover" }}
                  src={selectedProduct.images ? `http://127.0.0.1:8000/storage/${selectedProduct.images}` : "https://placehold.co/150"}
                  alt="product"
                />
                <div>
                  <p><strong>ID:</strong> {selectedProduct.id}</p>
                  <p><strong>Tên:</strong> {selectedProduct.name}</p>
                  <p><strong>Thương hiệu:</strong> {selectedProduct.brand?.name}</p>
                  <p><strong>Danh mục:</strong> {selectedProduct.category?.name}</p>
                  <p><strong>Giá:</strong> {selectedProduct.price.toLocaleString()} VNĐ {selectedProduct.old_price && <del>({selectedProduct.old_price.toLocaleString()} VNĐ)</del>}</p>
                  <p><strong>Số lượng đã bán:</strong> {selectedProduct.total_sold}</p>
                  <p><strong>Đánh giá:</strong> {selectedProduct.total_rating}⭐</p>
                </div>
              </div>

              {/* Thư viện ảnh */}
              <h4>Gallery</h4>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {selectedProduct.galleries?.length > 0 ? (
                  selectedProduct.galleries.map((gallery) => (
                    <Image
                      key={gallery.id}
                      width={80}
                      height={80}
                      style={{ borderRadius: 5, objectFit: "cover" }}
                      src={`http://127.0.0.1:8000/storage/${gallery.image}`}
                      alt="gallery"
                    />
                  ))
                ) : (
                  <p>Không có ảnh trong thư viện</p>
                )}
              </div>

              {/* Biến thể sản phẩm */}
              <h4>Biến thể sản phẩm</h4>
              {selectedProduct.variants?.length > 0 ? (
                <Table
                  dataSource={selectedProduct.variants}
                  columns={[
                    { title: "SKU", dataIndex: "sku", key: "sku" },
                    { title: "Giá", dataIndex: "price", key: "price", render: (price) => `${price.toLocaleString()} VNĐ` },
                    { title: "Giá cũ", dataIndex: "old_price", key: "old_price", render: (old_price) => old_price ? `${old_price.toLocaleString()} VNĐ` : "-" },
                    { title: "Tồn kho", dataIndex: "stock", key: "stock" },
                    { title: "Thuộc tính", dataIndex: "attributes", key: "attributes", render: (attributes) => attributes.map(attr => `${attr.name}: ${attr.value}`).join(", ") },
                  ]}
                  rowKey="sku_id"
                  pagination={false}
                />
              ) : (
                <p>Không có biến thể</p>
              )}
            </div>
          )}
        </Modal>
      )}

      <Outlet />
    </div>
  );
};

export default Products; 