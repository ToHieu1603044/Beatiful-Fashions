import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import { AxiosError } from "axios";
import { Slider } from "antd";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import ProductAdd from "./ProductsAdd";

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
  variants: VariantType[];
  created_at?: string;
  updated_at?: string;
};

const Products = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootProducts = location.pathname === "/admin/products";
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectCategory, date, minPrice, maxPrice, selectedStatus]);

  useEffect(() => {
    fetchCategory();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= lastPage) {
      fetchOrders(newPage);
    }
  };
  const getShortDescription = (description) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = description;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
  
    if (textContent.length > 100) {
      return DOMPurify.sanitize(description.substring(0, 100) + "...");
    }
    return DOMPurify.sanitize(description);
  };
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getProducts({
        search: searchTerm,
        category_id: selectCategory ? selectCategory : undefined,
        active: selectedStatus !== "" ? (selectedStatus === "1" ? "1" : "0") : undefined,

        date,
        min_price: minPrice,
        max_price: maxPrice,
        page,
      });

      console.log("Dữ liệu API:", response.data);
      setProducts(Array.isArray(response.data) ? response.data : response.data.data || []);
      setCurrentPage(response.data.page.currentPage);
      setLastPage(response.data.page.lastPage);
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/403");
      }
      console.error("Lỗi khi lấy sản phẩm:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };



  const fetchCategory = async () => {
    setLoading(true);
    try {
      const res = await getCategories();

      setCategories(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
  }
  const renderCategoryTree = (categories: CategoryType[], level: number = 0): JSX.Element[] => {
    return categories.flatMap((category) => [
      <option key={category.id} value={category.id}>
        {"—".repeat(level)} {category.name}
      </option>,
      ...renderCategoryTree(category.children, level + 1),
    ]);
  };


  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) return;
    console.log(id);
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
  const handleProductAdd = (newProduct) => {
    setProducts((prevProducts) => [newProduct, ...prevProducts]);
  }

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
          <label htmlFor="form-lable">Danh mục</label>
          <select className="form-select" onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Tất cả danh mục</option>
            {renderCategoryTree(categories)}
          </select>
          <br />

          <label htmlFor="Date" className="form-lable">Date</label>
          <select className="form-select" name="" onChange={(e) => setDate(e.target.value)} id="">
            <option value="">-------------</option>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>


          {/* <Slider
            range
            min={10}
            max={1000}
            step={10}
            defaultValue={[minPrice, maxPrice]}
            onChange={(value) => {
              setMinPrice(value[0]);
              setMaxPrice(value[1]);
            }}
          /> */}
          <br />

          <div className="mb-3">
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Thương hiệu</th>
                  <th>Danh mục</th>
                  <th>Trang thái</th>
                  <th>Hình ảnh</th>
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
                        {product.active ? (
                          <span className="badge rounded-pill text-bg-success">Active</span>
                        ) : (
                          <span className="badge rounded-pill text-bg-success">Deactive</span>
                        )}

                      </td>

                      <td>
                        <div className="d-flex position-relative">

                          <img
                            src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://placehold.co/50x50"}
                            alt={product.name}
                            className="rounded-circle position-relative"
                            style={{ width: "50px", height: "50px", zIndex: 2, marginRight: "-20px" }}
                          />

                          {product.galleries?.map((galleryImage, index) => (
                            <img
                              key={galleryImage.id}
                              src={`http://127.0.0.1:8000/storage/${galleryImage.image}`}
                              alt={`Gallery image ${index + 1}`}
                              className="rounded-circle position-relative"
                              style={{
                                width: "50px",
                                height: "50px",
                                marginLeft: index === 0 ? "0px" : "-20px",
                                zIndex: 1
                              }}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="d-flex justify-content-start gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm d-flex align-items-center"
                          onClick={() => handleShowModal(product)}
                        >
                          <BsEye />
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center"
                          onClick={() => handleDelete(product.id)}
                        >
                          <BsTrash />
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm d-flex align-items-center"
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        >
                          <BsPencilSquare />
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

            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>← Trước</button>
                </li>

                {[...Array(lastPage)].map((_, i) => (
                  <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Sau →</button>
                </li>
              </ul>
            </nav>
            <Link to="trash" >San pham da xoa</Link>
          </div>
        </>
      )}

      {
        selectedProduct && (
          <div
            className={`modal fade ${showModal ? "show d-block" : ""}`}
            tabIndex="-1"
            style={{
              background: "rgba(0,0,0,0.5)",
            }}
          >
            <div className="modal-dialog modal-lg">
              {/* Use modal-lg or modal-xl for larger modals */}
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  {/* Header with primary background color and white text */}
                  <h5 className="modal-title">Chi tiết sản phẩm</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  ></button>
                  {/* White close button for contrast */}
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      {/* Left column for product details */}
                      <p>
                        <strong>ID:</strong> {selectedProduct.id}
                      </p>
                      <p>
                        <strong>Tên:</strong> {selectedProduct.name}
                      </p>
                      <p>
                        <strong>Thương hiệu:</strong> {selectedProduct.brand.name}
                      </p>
                      <p>
                        <strong>Danh mục:</strong> {selectedProduct.category.name}
                      </p>
                    </div>
                    <div className="col-md-6">
                      {/* Right column for image */}
                      <p>
                        <strong>Hình ảnh:</strong>
                        <br />
                        <img
                          src={
                            selectedProduct.images
                              ? `http://127.0.0.1:8000/storage/${selectedProduct.images}`
                              : "https://placehold.co/200x200"
                          }
                          alt={selectedProduct.name}
                          className="rounded img-fluid"
                          style={{
                            maxWidth: "200px",
                            height: "auto",
                          }}
                        />
                      </p>
                    </div>
                  </div>
                  <h6 className="mt-3">Biến thể:</h6>
                  {/* Add margin top for better spacing */}
                  <ul className="list-group">
                    {/* Use list-group for a cleaner list */}
                    {selectedProduct.variants.map((variant, index) => (
                      <li key={index} className="list-group-item">
                        {/* Style list items */}
                        <strong>SKU:</strong> {variant.sku} | <strong> Giá:</strong> {variant.price.toLocaleString()} VNĐ |
                        <strong> Kho:</strong> {variant.stock}
                        <br />
                        <strong>Thuộc tính:</strong> {variant.attributes.map((attr) => `${attr.name}: ${attr.value}`).join(", ")}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={handleCloseModal}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      <Outlet />
    </div>
  );
};

export default Products;
