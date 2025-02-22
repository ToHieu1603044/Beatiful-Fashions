import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { Product } from "../../interfaces/Products";
import { Category } from "../../interfaces/Categories";

const MainContent = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
                  src={product.images || "https://placehold.co/200x200"}
                  className="card-img-top product-image"
                  alt={product.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                 
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MainContent;
