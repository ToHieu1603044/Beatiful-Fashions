
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getProductByCategory, storeCart } from "../../services/homeService";
import { Link, useParams } from "react-router-dom";
import Swal from 'sweetalert2'

const ProductCategories = () => {
  const { id } = useParams<{ id: number }>();
  // console.log(id);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [price, setPrice] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, totalItems: 0 });
  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock) {
      setQuantity(quantity + 1);
    }
  };
  const [quantity, setQuantity] = useState(1);

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
  }, [sortBy, price, priceRange, pagination.currentPage]);
  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  // console.log(priceRange);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.lastPage) {
      setPagination((prev) => ({ ...prev, currentPage: page }));
    }
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


      <div className="container mt-4">
        {/* Thanh lọc sản phẩm và danh sách sản phẩm */}
        <div className="row">
          {/* Bộ lọc bên trái */}
          <div className="col-md-3">
            <div className="p-3 border rounded">
              <h5 className="mb-3">Bộ lọc</h5>

              {/* Select sắp xếp bên trên phải */}
              <Form.Select onChange={(e) => {
                const value = e.target.value;
                if (value === "asc" || value === "desc") {
                  setPrice(value);
                } else {
                  setSortBy(value);
                }
              }}>
                <option value="">Chọn bộ lọc</option>
                <option value="newest">Ngày mới nhất</option>
                <option value="oldest">Ngày cũ nhất</option>
                <option value="asc">Giá thấp đến cao</option>
                <option value="desc">Giá cao đến thấp</option>
              </Form.Select>

              {/* Bộ lọc giá */}
              <h6 className="mb-2">Khoảng giá</h6>
              <Form>
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-100k-200k"
                  value="100000-200000"
                  label="100K - 200K"
                  onChange={(e) => handlePriceRangeChange(e)}
                />
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-200k-400k"
                  value="200000-400000"
                  label="200K - 400K"
                  onChange={(e) => handlePriceRangeChange(e)}
                />
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-400k-1000k"
                  value="400000-1000000"
                  label="400K - 1M"
                  onChange={(e) => handlePriceRangeChange(e)}
                />
              </Form>

              {/* Nút Reset */}
              <Button
                variant="outline-secondary"
                className="mt-3 w-100"
                onClick={() => {
                  setDate("");
                  setPrice("");
                  setPriceRange({ min: null, max: null });
                }}
              >
                Reset bộ lọc
              </Button>
            </div>
          </div>

          {/* Danh sách sản phẩm bên phải */}
          <div className="col-md-9">
            <Form.Select
              className="mb-3 "
              aria-label="Sắp xếp theo"
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith("date_")) {
                  setDate(value.replace("date_", ""));
                  setPrice("");
                } else if (value.startsWith("price_")) {
                  setPrice(value.replace("price_", ""));
                  setDate("");
                }
              }}
            >
              <option value="">Chọn bộ lọc</option>
              <option value="date_desc">Ngày mới nhất</option>
              <option value="date_asc">Ngày cũ nhất</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="price_asc">Giá thấp đến cao</option>
            </Form.Select>

            <div className="row mt-3">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="col-md-4 mb-4">
                    <div className="card">
                      <Link to={`/products/${product.id}/detail`}>
                        <img
                          src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://placehold.co/50x50"}
                          className="card-img-top"
                          alt={product.name}
                          style={{ height: "250px", objectFit: "cover" }}
                        />
                      </Link>
                      <div className="card-body">
                        <Link to={`/products/${product.id}/detail`}>{product.name}</Link>
                        <p className="text-muted">
                          Thương hiệu: {product.brand?.name} | Danh mục: {product.category?.name}
                        </p>
                        <p className="card-text fw-bold text-danger fs-5" >Giá: {product.price} đ</p>
                        {product.old_price ? (
                          <p>
                            <del>Giá cũ: {product.old_price.toLocaleString()} đ</del>
                          </p>
                        ) : ""}
                        <button className="btn btn-primary btn-sm" onClick={() => handleShowModal(product)}>
                          Mua ngay
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có sản phẩm nào.</p>
              )}
            </div>
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="primary"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                {"<"}
              </Button>
              <span className="mx-3">
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
            <br />
          </div>
        </div>
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

export default ProductCategories;
