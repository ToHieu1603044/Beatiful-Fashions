import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { Product } from "../../interfaces/Products";
import { Category } from "../../interfaces/Categories";

const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [availableOptions, setAvailableOptions] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      console.log("Products API response:", productsRes.data);
      console.log("Categories API response:", categoriesRes.data);

      setProducts(productsRes.data.data || []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
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
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="col-12 col-md-6">
              <div
                className="banner-hover position-relative rounded overflow-hidden category-hover"
                onClick={() => handleCategoryClick(category.id, category.slug)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={category.image || "https://placehold.co/400x300"}
                  className="img-fluid rounded banner-image category-image"
                  alt={category.name}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white fw-bold fs-4 banner-overlay">
                  {category.name}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="mb-4 text-center">Tất cả sản phẩm</h2>
      <div className="row g-4">
        {loading ? (
          <p>Đang tải...</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="col-md-4">
              <div
                className="card border-0"
                onClick={() => handleProductClick(product.id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://placehold.co/50x50"}
                  className="card-img-top product-image"
                  alt={product.name} style={{ height: "400px", width: "300px" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <h6 style={{ color: "red" }} >{product.price} VND</h6>
                  <h6>{product.old_price}</h6>

                </div>

              </div><button className="btn btn-primary btn-sm" onClick={() => handleShowModal(product)}>
                Mua ngay
              </button>

            </div>
          ))
        )}
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

export default MainContent;
