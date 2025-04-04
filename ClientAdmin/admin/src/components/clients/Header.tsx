import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getCart, getCartCount, getCategories, searchProducts } from "../../services/homeService";
import { Category } from '../../interfaces/Categories';
import { useNavigate } from 'react-router-dom';
import { Heart, User } from 'lucide-react';
import UserInfo from '../UserInfo';

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  console.log(token);
  console.log(localStorage.getItem("access_token"));

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  const checkLogin = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/account');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    navigate(`/searchs?query=${encodeURIComponent(searchQuery)}`);
  };
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await getCartCount();
        console.log("Số sản phẩm trong giỏ hàng:", response.data);
        setCartCount(response.data.data);

   
      } catch (error) {
        console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
      }
    };

    fetchCartCount();
  }, []); // Chạy 1 lần khi component render



  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container d-flex align-items-center justify-content-start">
        <a className="navbar-brand me-3 text-white" href="/">
          <img
            src="//bizweb.dktcdn.net/100/347/891/themes/710583/assets/logo.png?1739517244563"
            alt="logo Lak Shop"
            className="img-fluid"
            style={{ maxWidth: '170px' }}
          />
        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {categories.map((category) => (
              <li key={category.id} className="nav-item">
                <a className="nav-link text-white" href={`/category/${category.id}/${category.slug}`}>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Đẩy tìm kiếm, user, giỏ hàng sang bên phải */}
          <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">
            <li className="nav-item">
              <a className="nav-link text-white" href="#" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
                <FaSearch size={20} />
              </a>
            </li>

            <li className="nav-item position-relative">
              <a className="nav-link text-white" href="/cart">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "12px", padding: "5px 7px" }}
                  >
                    {cartCount}
                  </span>
                )}
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="/login" onClick={(e) => { e.preventDefault(); checkLogin(); }}>
                <UserInfo />
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link text-white" href="/whislist" onClick={(e) => { e.preventDefault(); checkLogin(); }}>
            
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="/whislist" onClick={(e) => { e.preventDefault(); checkLogin(); }}>
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Modal tìm kiếm */}
      {isSearchOpen && (
        <div className="search-modal-container">
          <div className="search-modal-content">
            <button className="close-btn" onClick={() => setIsSearchOpen(false)}>
              <span>×</span>
            </button>
            <div className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                autoFocus
              />

              <button className="search-btn" onClick={handleSearch}>
                <FaSearch /> Tìm kiếm
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map((product: any) => (
                  <li key={product._id} onClick={() => navigate(`/product/${product._id}`)}>
                    {product._source.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
