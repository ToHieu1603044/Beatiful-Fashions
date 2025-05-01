import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getProductByCategory, storeCart } from "../../services/homeService";
import { Link, useParams } from "react-router-dom";
import Swal from 'sweetalert2'
import { message } from "antd";

const ProductCategories = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [price, setPrice] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, totalItems: 0 });
  const [quantity, setQuantity] = useState(1);
  const [productsPerRow, setProductsPerRow] = useState(4); // Số sản phẩm trên 1 dòng, mặc định là 4
  const [showFilterModal, setShowFilterModal] = useState(false); // Trạng thái hiển thị modal filter

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
    const fetchProducts = async () => {
      try {
        const response = await getProductByCategory(id, {
          sortby: sortBy,
          price: price,
          price_range: priceRange,
          page: pagination.currentPage,
        });
        setProducts(response.data.data);
        setPagination({
          currentPage: response.data.page.currentPage,
          lastPage: response.data.page.lastPage,
          totalItems: response.data.page.total,
        });
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [id, sortBy, price, priceRange, pagination.currentPage]);

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
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

    try {
      const response = await storeCart(data);
      message.success(response.data.message);
    } catch (error) {
      if (error?.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Bạn chưa đăng nhập!",
          text: "Vui lòng đăng nhập để tiếp tục.",
          confirmButtonText: "Đăng nhập",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        mess.error(error.response.data.message);
      }
    }
  };

  const getColumnClass = () => {
    switch (productsPerRow) {
      case 4:
        return "col-12 col-md-4 col-lg-3";
      case 6:
        return "col-12 col-md-4 col-lg-2";
      case 8:
        return "col-12 col-md-3 col-lg-15"; 
      default:
        return "col-12 col-md-4 col-lg-3";
    }
  };

  // Hàm render dấu chấm theo lưới
  const renderDots = (count, isActive, onClick) => {
    const rows = 2;
    let cols;
    switch (count) {
      case 4:
        cols = 2; // 2x2
        break;
      case 6:
        cols = 3; // 2x3
        break;
      case 8:
        cols = 4; // 2x4
        break;
      default:
        cols = 2;
    }

    const dots = [];
    for (let i = 0; i < count; i++) {
      dots.push(
        <span
          key={i}
          className={`dot ${isActive ? 'active' : ''}`}
          style={{ margin: "2px" }}
        ></span>
      );
    }

    return (
      <div
        className="d-flex flex-wrap"
        style={{ width: `${cols * 14}px`, cursor: "pointer" }}
        onClick={onClick}
      >
        {dots.map((dot, index) => (
          <div key={index} style={{ width: "14px", height: "14px" }}>
            {dot}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-5">
      <style>
        {`
          @media (min-width: 992px) {
            .col-lg-15 {
              flex: 0 0 12.5%;
              max-width: 12.5%;
            }
          }
          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #ccc;
            display: inline-block;
          }
          .dot.active {
            background-color: #000;
          }
        `}
      </style>

      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">Trang chủ</a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Danh mục
          </li>
        </ol>
      </nav>

      {/* Tiêu đề */}
      <h4 className="text-center mb-4">Shop through our latest selection of Mens</h4>

      <div className="row">
        {/* Danh sách sản phẩm */}
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <Button
                variant="outline-secondary"
                className="d-flex align-items-center"
                onClick={() => setShowFilterModal(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-filter me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                </svg>
                FILTER
              </Button>
            </div>
            <div className="d-flex align-items-center">
              <div className="d-flex me-3">
                {renderDots(4, productsPerRow === 4, () => setProductsPerRow(4))}
                <div className="mx-2">
                  {renderDots(6, productsPerRow === 6, () => setProductsPerRow(6))}
                </div>
                {renderDots(8, productsPerRow === 8, () => setProductsPerRow(8))}
              </div>
              <Form.Select
                className="w-auto me-3"
                aria-label="Sắp xếp theo"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "asc" || value === "desc") {
                    setPrice(value);
                    setSortBy("");
                  } else {
                    setSortBy(value);
                    setPrice("");
                  }
                }}
              >
                <option value="">Featured</option>
                <option value="newest">Ngày mới nhất</option>
                <option value="oldest">Ngày cũ nhất</option>
                <option value="asc">Giá thấp đến cao</option>
                <option value="desc">Giá cao đến thấp</option>
              </Form.Select>
              <span className="text-muted">{pagination.currentPage} of {pagination.lastPage}</span>
            </div>
          </div>

          <div className="row g-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className={getColumnClass()}>
                  <div className="card border-0 shadow-sm">
                    <Link to={`/products/${product.id}/detail`}>
                      <img
                        src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://via.placeholder.com/400x500?text=Product+Image"}
                        alt={product.name}
                        className="card-img-top"
                        style={{ height: "300px", objectFit: "cover" }}
                      />
                    </Link>
                    <div className="card-body text-center">
                      <Link to={`/products/${product.id}/detail`} className="text-decoration-none text-dark">
                        <h6 className="card-title">{product.name}</h6>
                      </Link>
                      <p className="card-text fw-bold mb-2">
                        {product.price} đ
                        {product.old_price && (
                          <span className="text-muted ms-2">
                            <del>{product.old_price.toLocaleString()} đ</del>
                          </span>
                        )}
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShowModal(product)}
                      >
                        Mua ngay
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có sản phẩm nào.</p>
            )}
          </div>

          {/* Phân trang */}
          <div className="d-flex justify-content-center mt-4">
            <Button
              variant="primary"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              className="me-2"
            >
              {"<"}
            </Button>
            <span className="align-self-center mx-3">
              {pagination.currentPage} of {pagination.lastPage}
            </span>
            <Button
              variant="primary"
              disabled={pagination.currentPage === pagination.lastPage}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              {">"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Filter */}
      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Filter</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="mb-2">Khoảng giá</h6>
          <Form>
            <Form.Check
              type="radio"
              name="priceRange"
              id="price-100k-200k"
              value="100000-200000"
              label="100K - 200K"
              onChange={(e) => handlePriceRangeChange(e)}
              checked={priceRange === "100000-200000"}
            />
            <Form.Check
              type="radio"
              name="priceRange"
              id="price-200k-400k"
              value="200000-400000"
              label="200K - 400K"
              onChange={(e) => handlePriceRangeChange(e)}
              checked={priceRange === "200000-400000"}
            />
            <Form.Check
              type="radio"
              name="priceRange"
              id="price-400k-1000k"
              value="400000-1000000"
              label="400K - 1M"
              onChange={(e) => handlePriceRangeChange(e)}
              checked={priceRange === "400000-1000000"}
            />
          </Form>
          <h6 className="mt-4 mb-2">Số sản phẩm trên một dòng</h6>
          <div className="d-flex align-items-center">
            {renderDots(4, productsPerRow === 4, () => setProductsPerRow(4))}
            <div className="mx-3">
              {renderDots(6, productsPerRow === 6, () => setProductsPerRow(6))}
            </div>
            {renderDots(8, productsPerRow === 8, () => setProductsPerRow(8))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setPrice("");
              setPriceRange("");
              setSortBy("");
              setPagination((prev) => ({ ...prev, currentPage: 1 }));
            }}
          >
            Reset bộ lọc
          </Button>
          <Button variant="primary" onClick={() => setShowFilterModal(false)}>
            Áp dụng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Sản phẩm */}
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

export default ProductCategories;