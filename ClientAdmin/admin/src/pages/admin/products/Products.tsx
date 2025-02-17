import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../../services/productService";
import { AxiosError } from "axios";

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
  images?: string | null;
  variants: VariantType[];
  created_at?: string;
  updated_at?: string;
};

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootProducts = location.pathname === "/admin/products";

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProducts({ search: searchTerm });
      console.log("Dữ liệu API:", response.data);

      const productsData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;

    try {
      await deleteProduct(id);
      alert("Xóa sản phẩm thành công!");
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error("Lỗi khi xóa sản phẩm:", axiosError);
      alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleShowModal = (product: ProductType) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="container mt-4">
      {isRootProducts && (
        <>
          <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Sản Phẩm</h2>
            <button className="btn btn-success ms-3" onClick={() => navigate("/admin/products/create")}>
              Thêm mới
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Thương hiệu</th>
                  <th>Danh mục</th>
                  <th>Hình ảnh</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center">Đang tải dữ liệu...</td>
                  </tr>
                )}
                {!loading && products.length > 0 &&
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>{product.name}</td>
                      <td>{product.brand.name}</td>
                      <td>{product.category.name}</td>
                      <td>
                        <img
                          src={product.images || "https://placehold.co/50x50"}
                          alt={product.name}
                          className="rounded"
                          width={50}
                          height={50}
                        />
                      </td>
                      <td>{product.created_at || "----"}</td>
                      <td>{product.updated_at || "----"}</td>
                      <td>
                        <button className="btn btn-warning btn-sm me-1" onClick={() => handleShowModal(product)}>
                          Xem
                        </button>
                        <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(product.id)}>
                          Xóa
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
                          Sửa
                        </button>
                      </td>
                    </tr>
                  ))
                }
                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center">Không có sản phẩm nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedProduct && (
        <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết sản phẩm</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>ID:</strong> {selectedProduct.id}</p>
                <p><strong>Tên:</strong> {selectedProduct.name}</p>
                <p><strong>Thương hiệu:</strong> {selectedProduct.brand.name}</p>
                <p><strong>Danh mục:</strong> {selectedProduct.category.name}</p>
                <p>
                  <strong>Hình ảnh:</strong><br />
                  <img
                    src={selectedProduct.images || "https://placehold.co/100x100"}
                    alt={selectedProduct.name}
                    className="rounded mt-2"
                    width={100}
                    height={100}
                  />
                </p>
                <h6>Biến thể:</h6>
                <ul>
                  {selectedProduct.variants.map((variant, index) => (
                    <li key={index}>
                      <strong>SKU:</strong> {variant.sku} | 
                      <strong> Giá:</strong> {variant.price.toLocaleString()} VNĐ | 
                      <strong> Kho:</strong> {variant.stock} 
                      <br />
                      <strong>Thuộc tính:</strong> {variant.attributes.map((attr) => `${attr.name}: ${attr.value}`).join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default Products;
