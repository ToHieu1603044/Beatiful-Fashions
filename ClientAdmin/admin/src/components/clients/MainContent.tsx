import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { getsales, getCategories, getProductSales, getProducts, storeCart } from "../../services/homeService";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Product } from "../../interfaces/Products";
import { Category } from "../../interfaces/Categories";
import videoSrc from "../../assets/slider-video.mp4";
import ImageCollection from "../ImageCollection";
import CountDown from "../CountDown";
import axios from "axios";
import { toast } from 'react-toastify';
import Swal from "sweetalert2";
import Carousel from "../Carousel ";
import Post from "../Post";

const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]); // Sản phẩm hiển thị
  const [showAll, setShowAll] = useState(false);

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, salesRes] = await Promise.all([
        getProducts(),
        getCategories(),
        getProductSales(),
      ]);

      const fetchedProducts = productsRes.data.data || [];
      setProducts(fetchedProducts);
      setDisplayedProducts(fetchedProducts.slice(0, 4)); // Chỉ hiển thị 4 sản phẩm đầu tiên
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setSales(salesRes.data.data || []);
      console.log("Danh sách khuyen mai:", salesRes.data);

      const token = localStorage.getItem("access_token");
      if (token) {
        const favoritesRes = await axios.get('http://127.0.0.1:8000/api/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavoriteProductIds(favoritesRes.data.product_id || []);
      } else {
        setFavoriteProductIds([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedVariant) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng chọn biến thể.",
      });
      return;
    }

    const missingAttributes = [];
    Object.keys(availableOptions).forEach((attributeName) => {
      if (!selectedAttributes[attributeName]) {
        missingAttributes.push(attributeName);
      }
    });

    if (missingAttributes.length > 0) {
      Swal.fire({
        icon: "warning",
        title: `Vui lòng chọn ${missingAttributes.join(", ")}.`,
      });
      return;
    }

    if (quantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Số lượng phải lớn hơn 0.",
      });
      return;
    }

    const data = {
      sku_id: selectedVariant.sku_id,
      quantity: quantity,
      attributes: selectedAttributes,
    };

    console.log("Dữ liệu gửi đi:", data);

    try {
      const response = await storeCart(data);
      console.log("Phản hồi từ API:", response.data);

      if (response.status === 200) {
        Swal.fire({
          title: "Thêm giỏ hàng thành công!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Vui lòng thử lại sau.",
        });
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Bạn chưa đăng nhập!",
          text: "Vui lòng đăng nhập để tiếp tục.",
          confirmButtonText: "Đăng nhập"
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!",
        });
      }
    }
  };

  const handleCategoryClick = (id: number, slug: string) => {
    navigate(`/category/${id}/${slug}`);
  };

  const handleAddToFavorites = async (product) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Bạn cần đăng nhập để sử dụng chức năng yêu thích.");
        return;
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/api/toggle-favorite",
        { product_id: product.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === "success") {
        const isFavorite = res.data.is_favorite;

        setProducts((prev) =>
          prev.map((item) =>
            item.id === product.id ? { ...item, isFavorite } : item
          )
        );

        setSales((prevSales) =>
          prevSales.map((item) =>
            item.id === product.id ? { ...item, isFavorite } : item
          )
        );
        await fetchData();
        toast.success(res.data.is_favorite ? "Đã thêm vào yêu thích!" : "Đã xóa khỏi yêu thích!");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Bạn cần đăng nhập để sử dụng chức năng này.");
      } else {
        console.error("Lỗi toggle favorite:", error);
      }
    }
  };

  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);
    setQuantity(1);

    const allAttributes = [...new Set(product.variants.flatMap((variant) => variant.attributes.map((attr) => attr.name)))];

    const initialAvailableOptions = {};
    allAttributes.forEach((attrName) => {
      initialAvailableOptions[attrName] = [
        ...new Set(
          product.variants.flatMap((variant) =>
            variant.attributes
              .filter((attr) => attr.name === attrName)
              .map((attr) => attr.value)
          )
        ),
      ];
    });

    const initialSelectedAttributes = {};
    allAttributes.forEach((attrName) => {
      initialSelectedAttributes[attrName] = initialAvailableOptions[attrName][0] || null;
    });

    const matchedVariant = product.variants.find((variant) =>
      variant.attributes.every(
        (attr) => initialSelectedAttributes[attr.name] === attr.value
      )
    );

    setSelectedAttributes(initialSelectedAttributes);
    setAvailableOptions(initialAvailableOptions);
    setSelectedVariant(matchedVariant || null);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedAttributes({});
    setSelectedVariant(null);
  };

  const handleSelectAttribute = (attributeName, attributeValue) => {
    setSelectedAttributes((prev) => {
      const newSelectedAttributes = { ...prev, [attributeName]: attributeValue };

      const matchedVariant = selectedProduct.variants.find((variant) =>
        variant.attributes.every(
          (attr) => newSelectedAttributes[attr.name] === attr.value || newSelectedAttributes[attr.name] === null
        )
      );

      setSelectedVariant(matchedVariant || null);

      return newSelectedAttributes;
    });
  };

  const handleProductClick = (id: number) => {
    navigate(`/products/${id}/detail`);
  };

  const handleShowMore = () => {
    setDisplayedProducts(products); // Hiển thị tất cả sản phẩm
    setShowAll(true);
  };

  return (
    <div className="container mt-4">
      <div className="row mb-5 g-4">
        <Carousel />
      </div>

      <h2 className="mb-5 text-center text-uppercase mt-5 text-secondary">--Tất cả sản phẩm--</h2>
      <div className="row justify-content-center gap-4 mb-5">
        {displayedProducts.length === 0 ? (
          <p className="mb-5 text-center text-uppercase mt-5">Không có sản phẩm nào.</p>
        ) : (
          displayedProducts.map((product) => (
            <div key={product.id} className="col-auto">
              <div
                className="card h-100 border-0 position-relative mx-auto mb-4"
                style={{
                  width: "260px",
                  background: "transparent",
                }}
              >
                <div
                  className="position-absolute top-0 end-0 d-flex flex-column m-2 gap-2"
                  style={{ zIndex: 10 }}
                >
                  <div
                    className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorites(product);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "32px",
                      height: "32px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <i
                      className={`fas fa-heart ${favoriteProductIds.includes(product.id) ? "text-danger" : "text-gray-500"}`}
                      style={{ fontSize: "1rem" }}
                    ></i>
                  </div>
                  <div
                    className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowModal(product);
                    }}
                    style={{
                      cursor: "pointer",
                      width: "32px",
                      height: "32px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                  >
                    <i className="fas fa-eye text-gray-500" style={{ fontSize: "1rem" }}></i>
                  </div>
                </div>

                {/* Product Image */}
                <div
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="image-container">
                    <img
                      src={
                        product.images
                          ? `http://127.0.0.1:8000/storage/${product.images}`
                          : "https://placehold.co/260x320"
                      }
                      className="card-img-top"
                      alt={product.name}
                      style={{
                        height: "320px",
                        width: "260px",
                        objectFit: "cover",
                        borderRadius: "0",
                      }}
                    />
                  </div>

                  <div className="card-body text-center px-0 py-2">
                    <h5
                      className="card-title text-truncate"
                      style={{ fontSize: "1rem", fontWeight: "400", color: "#000" }}
                    >
                      {product.name}
                    </h5>
                    <div className="price-container">
                      <h6
                        className="fw-bold mb-0"
                        style={{ fontSize: "1rem", color: "#000" }}
                      >
                        ${product.price.toLocaleString()}
                      </h6>
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <div className="card-footer bg-transparent border-0 text-center pb-3">
                  <button
                    className="btn w-100"
                    style={{
                      background: "#000",
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      textTransform: "uppercase",
                      padding: "8px 0",
                      borderRadius: "0",
                      transition: "background 0.2s ease",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowModal(product);
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {!showAll && products.length > 4 && (
        <div className="text-center mt-4">
          <Button
            variant="primary"
            onClick={handleShowMore}
            style={{
              background: "#000",
              border: "none",
              textTransform: "uppercase",
              padding: "10px 20px",
            }}
          >
            Xem thêm
          </Button>
        </div>
      )}

      {sales.length > 0 && (
        <>
          <h2 className="mb-4 text-center text-uppercase mt-5">--Sản phẩm khuyến mại--</h2>
          <div className="row justify-content-center gap-4 mb-5">
            {sales.map((sale) => (
              <div key={sale.id} className="col-auto">
                <div
                  className="card h-100 border-0 position-relative mx-auto mb-4"
                  style={{
                    width: "260px",
                    background: "transparent",
                  }}
                >
                  {/* Discount Tag */}
                  <div
                    className="discount-tag position-absolute top-0 start-0 m-2 p-2 text-white fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #ff4d4d, #cc0000)",
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 20% 50%)",
                      fontSize: "0.85rem",
                      lineHeight: "1.2",
                      padding: "6px 12px",
                      transform: "rotate(-10deg)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      zIndex: 2,
                    }}
                  >
                    -{((sale.sale_price / sale.old_price) * 100).toFixed(0)}%
                  </div>

                  {/* Icons on the right */}
                  <div
                    className="position-absolute top-0 end-0 d-flex flex-column m-2 gap-2"
                    style={{ zIndex: 1 }}
                  >
                    <div
                      className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowModal(sale);
                      }}
                      style={{
                        cursor: "pointer",
                        width: "32px",
                        height: "32px",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                    >
                      <i className="fas fa-eye text-gray-500" style={{ fontSize: "1rem" }}></i>
                    </div>
                  </div>

                  {/* Product Image */}
                  <div
                    onClick={() => handleProductClick(sale.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="image-container">
                      <img
                        src={
                          sale.images
                            ? `http://127.0.0.1:8000/storage/${sale.images}`
                            : "https://placehold.co/260x320"
                        }
                        className="card-img-top"
                        alt={sale.name}
                        style={{
                          height: "320px",
                          width: "260px",
                          objectFit: "cover",
                          borderRadius: "0",
                        }}
                      />
                    </div>

                    <div className="card-body text-center px-0 py-2">
                      <h5
                        className="card-title text-truncate"
                        style={{ fontSize: "1rem", fontWeight: "400", color: "#000" }}
                      >
                        {sale.name}
                      </h5>
                      <div className="price-container">
                        <h6 className="text-danger fw-bold mb-1">
                          {(sale.price - sale.sale_price).toLocaleString()} VND
                        </h6>
                        {sale.old_price && (
                          <small className="text-muted text-decoration-line-through">
                            {sale.old_price.toLocaleString()} VND
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <div className="card-footer bg-transparent border-0 text-center pb-3">
                    <button
                      className="btn w-100"
                      style={{
                        background: "#000",
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        textTransform: "uppercase",
                        padding: "8px 0",
                        borderRadius: "0",
                        transition: "background 0.2s ease",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowModal(sale);
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {sales.length === 0 && (
        <p className="text-center"></p>
      )}

      <CountDown />
      <div>
        <Post />
      </div>

      {selectedProduct && (
        <Modal
          show={!!selectedProduct}
          onHide={handleCloseModal}
          centered
          size="lg"
          className="product-modal"
        >
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fs-4 fw-bold">{selectedProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            <div className="row">
              <div className="col-md-6">
                <div className="product-image-container">
                  <img
                    src={selectedProduct.images ? `http://127.0.0.1:8000/storage/${selectedProduct.images}` : "https://placehold.co/50x50"}
                    className="img-fluid rounded shadow-sm"
                    alt={selectedProduct.name}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="product-details">
                  <div className="brand-category mb-3">
                    <span className="badge bg-light text-dark me-2">
                      <i className="fas fa-tag me-1"></i>
                      {selectedProduct.brand?.name}
                    </span>
                    <span className="badge bg-light text-dark">
                      <i className="fas fa-folder me-1"></i>
                      {selectedProduct.category?.name}
                    </span>
                    {selectedProduct.quantity_sale && (
                      <span className="badge bg-light text-dark">
                        <i className="fas fa-bolt me-1 text-warning"></i>
                       Sale còn: {selectedProduct.quantity_sale}
                      </span>
                    )}

                  </div>

                  {Object.keys(selectedAttributes).map((attributeName, index) => (
                    <Form.Group key={index} className="mb-3">
                      <Form.Label className="fw-semibold">{attributeName}</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {availableOptions[attributeName]?.map((attributeValue, idx) => (
                          <Button
                            key={idx}
                            variant={selectedAttributes[attributeName] === attributeValue ? "primary" : "outline-primary"}
                            className="rounded-pill px-3 py-1"
                            onClick={() => handleSelectAttribute(attributeName, attributeValue)}
                          >
                            {attributeValue}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  ))}

                  {selectedVariant && (
                    <div className="variant-details mt-4">
                      <div className="price-container mb-3">
                        <h5 className="mb-2">Giá bán:</h5>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fs-4 text-danger fw-bold">
                            {selectedVariant.price.toLocaleString()}đ
                          </span>
                          {selectedVariant.old_price && (
                            <span className="text-muted text-decoration-line-through fs-6">
                              {selectedVariant.old_price.toLocaleString()}đ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="stock-info mb-3">
                        <h5 className="mb-2">Số lượng còn lại:</h5>
                        <span className="badge bg-success">{selectedVariant.stock} sản phẩm</span>

                      </div>

                      <div className="quantity-selector">
                        <h5 className="mb-2">Số lượng mua:</h5>
                        <div className="d-flex align-items-center gap-2">
                          <Button
                            variant="outline-secondary"
                            onClick={handleDecrease}
                            disabled={quantity <= 1}
                            className="rounded-circle"
                          >
                            <i className="fas fa-minus"></i>
                          </Button>
                          <Form.Control
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (!isNaN(value) && value > 0 && value <= selectedVariant.stock) {
                                setQuantity(value);
                              }
                            }}
                            min="1"
                            max={selectedVariant.stock}
                            className="text-center rounded"
                            style={{ width: "70px" }}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={handleIncrease}
                            disabled={quantity >= selectedVariant.stock}
                            className="rounded-circle"
                          >
                            <i className="fas fa-plus"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
              className="rounded-pill px-4"
            >
              <i className="fas fa-times me-2"></i>
              Đóng
            </Button>
            <Button
              onClick={handleSubmit}
              variant="success"
              disabled={!selectedVariant}
              className="rounded-pill px-4"
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Thêm vào giỏ
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default MainContent; 