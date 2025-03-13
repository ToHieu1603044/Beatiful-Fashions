import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts } from "../../services/homeService";
import { Modal, Button, Form } from "react-bootstrap";
import { storeCart } from "../../services/homeService";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

const SearchProducts = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [quantity, setQuantity] = useState(1); // Initialize quantity state
  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        try {
          const results = await searchProducts(query);
          setProducts(results);
        } catch (error) {
          console.error("Error searching:", error);
        }
      };
      fetchResults();
    }
  }, [query]);

  const handleShowModal = (product) => {
    console.log("Sản phẩm được chọn:", product);
    setSelectedProduct(product);
    setSelectedVariant(null);
    setQuantity(1);

    if (!product || !product._source || !product._source.variants) {
      console.error("Sản phẩm không hợp lệ:", product);
      return;
    }

    const allAttributes = [
      ...new Set(
        product._source.variants.flatMap((variant) => {
          if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
            // Convert the object of attributes to an array of attribute objects
            return Object.entries(variant.attributes).map(([name, value]) => ({ name, value }));
          } else {
            console.warn("Variant attributes is not an object or is undefined:", variant);
            return []; // Return an empty array to avoid breaking the flatMap
          }
        }).flatMap(attr => attr.name) // Extract attribute names after converting to array
      ),
    ];

    const initialSelectedAttributes = Object.fromEntries(allAttributes.map((attr) => [attr, null]));
    const initialAvailableOptions = {};

    allAttributes.forEach((attrName) => {
      initialAvailableOptions[attrName] = [
        ...new Set(
          product._source.variants.flatMap((variant) => {
            if (variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)) {
              // Convert the object of attributes to an array of attribute objects
              return Object.entries(variant.attributes).map(([name, value]) => ({ name, value }));
            } else {
              console.warn("Variant attributes is not an object or is undefined:", variant);
              return []; // Return an empty array
            }
          }).filter((attr) => attr.name === attrName)
            .map((attr) => attr.value)
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
      const newSelectedAttributes = { ...prev, [attributeName]: attributeValue };

      const matchedVariant = selectedProduct._source.variants.find((variant) => {
        // Adapt the every check to work with the object structure
        return Object.entries(variant.attributes).every(([name, value]) => {
          return newSelectedAttributes[name] === value || newSelectedAttributes[name] === null;
        });
      });

      setSelectedVariant(matchedVariant || null);
      return newSelectedAttributes;
    });
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVariant) {
      Swal.fire({
        icon: "warning",
        title: "Vui lòng chọn biến thể.",
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
      quantity: quantity
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

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Kết quả tìm kiếm cho: "{query}"</h2>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-3 mb-4">
              <div className="card shadow-sm border-0 rounded">
                <Link to={`/products/${product._id}/detail`}>
                  <img
                    src={product._source.images
                      ? `http://127.0.0.1:8000/storage/${product._source.images}`
                      : "https://placehold.co/300x400"}
                    alt={product._source.name}
                    className="card-img-top"
                    style={{ width: "100%", height: "400px", objectFit: "cover", borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}
                  />
                </Link>
                <div className="card-body text-center">
                  <Link to={`/products/${product._id}/detail`} className="text-dark text-decoration-none">
                    <h6 className="fw-bold">{product._source.name}</h6>
                  </Link>
                  <p className="text-muted small">Brand: {product._source.brand} | Category: {product._source.category}</p>
                  <p className="fw-bold text-danger fs-5">{product._source.price.toLocaleString()} đ</p>
                  {product._source.old_price && (
                    <p className="text-muted">
                      <del>{product._source.old_price.toLocaleString()} đ</del>
                    </p>
                  )}
                  <button className="btn btn-primary btn-sm" onClick={() => handleShowModal(product)}>
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No products found.</p>
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
            <Modal.Title className="fs-4 fw-bold">{selectedProduct._source.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-4">
            <div className="row">
              <div className="col-md-6">
                <div className="product-image-container">
                  <img
                    src={selectedProduct._source.images ? `http://127.0.0.1:8000/storage/${selectedProduct._source.images}` : "https://placehold.co/50x50"}
                    className="img-fluid rounded shadow-sm"
                    alt={selectedProduct._source.name}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="product-details">
                  <div className="brand-category mb-3">
                    <span className="badge bg-light text-dark me-2">
                      <i className="fas fa-tag me-1"></i>
                      {selectedProduct._source.brand}
                    </span>
                    <span className="badge bg-light text-dark">
                      <i className="fas fa-folder me-1"></i>
                      {selectedProduct._source.category}
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

export default SearchProducts;
