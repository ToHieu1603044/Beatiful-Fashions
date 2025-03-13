import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getCategories, searchProducts } from "../../services/homeService";
import { Category } from '../../interfaces/Categories';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

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
          <ul className="navbar-nav ms-3">
            {categories.map((category) => (
              <li key={category.id} className="nav-item">
                <a className="nav-link text-white" href={`/category/${category.id}/${category.slug}`}>
                  {category.name}
                </a>
              </li>
            ))}

            <li className="nav-item">
              <a
                className="nav-link text-white"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSearchOpen(true);
                }}
              >
                <FaSearch size={20} />
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-white"
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  checkLogin();
                }}
              >
                <FaUser size={20} />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="/cart">
                <FaShoppingCart size={20} />
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
