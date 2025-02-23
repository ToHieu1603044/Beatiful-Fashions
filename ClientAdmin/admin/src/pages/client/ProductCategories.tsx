
import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getProducts } from "../../services/productService";
import { Link } from "react-router-dom";

const ProductCategories = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, totalItems: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({
          date: date,
          price: price,
          min_price: priceRange.min,
          max_price: priceRange.max,
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
  }, [date, price, priceRange, pagination.currentPage]);
  const handlePriceRangeChange = (event) => {
    const [min, max] = event.target.value.split("-").map(Number); 
    setPriceRange({ min, max });
  };
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
              <Form.Select
                className="mb-3"
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

              {/* Bộ lọc giá */}
              <h6 className="mb-2">Khoảng giá</h6>
              <Form>
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-100k-200k"
                  value="100000-200000"
                  label="100K - 200K"
                  onChange={handlePriceRangeChange}
                />
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-200k-400k"
                  value="200000-400000"
                  label="200K - 400K"
                  onChange={handlePriceRangeChange}
                />
                <Form.Check
                  type="radio"
                  name="priceRange"
                  id="price-400k-1000k"
                  value="400000-1000000"
                  label="400K - 1M"
                  onChange={handlePriceRangeChange}
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
        <Modal show={!!selectedProduct} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>{selectedProduct.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img

              src={selectedProduct.images ? `http://127.0.0.1:8000/storage/${selectedProduct.images}` : "https://placehold.co/50x50"}
              className="img-fluid mb-3"
              style={{ width: "500px", height: "300px", objectFit: "cover" }}
              alt={selectedProduct.name}
            />
            <p>Thương hiệu: {selectedProduct.brand?.name}</p>
            <p>Danh mục: {selectedProduct.category?.name}</p>

            {Object.keys(selectedAttributes).map((attributeName, index) => (
              <Form.Group key={index} className="mt-3">
                <Form.Label>Chọn {attributeName}</Form.Label>
                <div className="d-flex gap-2">
                  {availableOptions[attributeName]?.map((attributeValue, idx) => (
                    <Button
                      key={idx}
                      variant={selectedAttributes[attributeName] === attributeValue ? "primary" : "outline-secondary"}
                      onClick={() => handleSelectAttribute(attributeName, attributeValue)}
                    >
                      {attributeValue}
                    </Button>
                  ))}
                </div>
              </Form.Group>
            ))}

            {selectedVariant && (
              <div className="mt-3">
                <p>
                  Giá: <span className="text-danger">{selectedVariant.price.toLocaleString()}đ</span>
                  {selectedVariant.old_price && (
                    <span className="text-muted text-decoration-line-through">
                      {" "}
                      {selectedVariant.old_price.toLocaleString()}đ
                    </span>
                  )}
                </p>
                <p>Số lượng: {selectedVariant.stock}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Đóng
            </Button>
            <Button variant="success" disabled={!selectedVariant}>
              Thêm vào giỏ
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ProductCategories;
