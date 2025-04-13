import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { getProducts, getCategories } from "../../services/homeService";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Product } from "../../interfaces/Products";
import { Category } from "../../interfaces/Categories";
import videoSrc from "../../assets/slider-video.mp4";
import ImageCollection from "../ImageCollection";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsRes.data.data || []);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        // setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    if (!selectedVariant) {
      alert("Vui lòng chọn biến thể.");
      return;
    }
    console.log("Dữ liệu gửi đi:", { sku_id: selectedVariant.sku_id });
  };
  const handleCategoryClick = (id: number, slug: string) => {
    navigate(`/category/${id}/${slug}`);
  };
  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(null);

    const allAttributes = [...new Set(product.variants.flatMap((variant) => variant.attributes.map((attr) => attr.name)))];
    // Loc tat ca variants va lay ra ten cac thuoc tinh -> dung Set de ne cac truong giong nhau-> chuyen thnanh mang

    const initialSelectedAttributes = Object.fromEntries(allAttributes.map((attr) => [attr, null]));

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

    setSelectedAttributes(initialSelectedAttributes);
    setAvailableOptions(initialAvailableOptions);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setSelectedAttributes({});
    setSelectedVariant(null);
  };

  const handleSelectAttribute = (attributeName, attributeValue) => {
    setSelectedAttributes((prev) => {
      const newSelectedAttributes = { ...prev, [attributeName]: attributeValue }

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

  return (
    <div className="container mt-4">
      <div className="row mb-5 g-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          className="w-100"
          style={{ maxWidth: "100%", height: "500px" }}
        >
          {/* Slide Video */}
          <SwiperSlide>
            <div className="position-relative">
              <video src={videoSrc} autoPlay muted playsInline loop className="w-100" style={{ height: "500px", objectFit: "cover", borderRadius: "10px" }}></video>
              {/* <div className="position-absolute top-50 start-50 translate-middle text-white text-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "20px", borderRadius: "10px" }}>
                <h2>Khám phá sản phẩm mới</h2>
                <h4 className="text-warning">Ưu đãi hấp dẫn hôm nay!</h4>
              </div> */}
            </div>
          </SwiperSlide>

        </Swiper>
      </div>
      < ImageCollection />
      <h2 className="mb-4 text-center text-uppercase mt-5">--Tất cả sản phẩm--</h2>
      <div className="row justify-content-center gap-4 mb-5">
        {products.length === 0 ? (
          <p className="text-center">Không có sản phẩm nào.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="col-auto">
              <div
                className="card h-100 shadow-sm hover-card position-relative mx-auto mb-4"
                style={{
                  width: "260px", // Card rộng bằng ảnh + khoảng trống
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Icon trái tim */}
                <div
                  className="position-absolute top-0 end-0 m-2 p-2 rounded-circle bg-white shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToFavorites(product);
                  }}
                  style={{
                    cursor: "pointer",
                    zIndex: 10,
                    transition: "color 0.2s ease-in-out",
                  }}
                >
                  <i
                    className={`fas fa-heart ${product.isFavorite ? "text-danger" : "text-muted"}`}
                    style={{ fontSize: "1.2rem" }}
                  ></i>
                </div>

                <div
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="image-container">
                    <img
                      src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://placehold.co/260x320"}
                      className="card-img-top"
                      alt={product.name}
                      style={{
                        height: "320px",
                        width: "260px",
                        objectFit: "cover",
                        borderTopLeftRadius: "10px",
                        borderTopRightRadius: "10px",
                      }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title text-truncate fw-bold">{product.name}</h5>
                    <div className="price-container">
                      <h6 className="text-danger fw-bold mb-1">{product.price.toLocaleString()} VND</h6>
                      {product.old_price && (
                        <small className="text-muted text-decoration-line-through">
                          {product.old_price.toLocaleString()} VND
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer bg-transparent border-0 text-center pb-3">
                  <button
                    className="btn btn-primary w-100 rounded-pill"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowModal(product);
                    }}
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
