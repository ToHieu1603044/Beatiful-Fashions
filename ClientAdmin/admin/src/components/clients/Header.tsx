import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { getCategories } from "../../services/homeService";
import { Category } from '../../interfaces/Categories';
import { useNavigate } from 'react-router-dom'; // Để chuyển hướng

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate(); // Hook điều hướng
  
  // Lấy token từ localStorage khi component mount
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

  // Kiểm tra xem người dùng đã đăng nhập chưa
  const checkLogin = () => {
    if (!token) {
      // Nếu không có token, điều hướng đến trang đăng nhập
      navigate('/login');
    } else {
      // Nếu có token, điều hướng đến trang tài khoản
      navigate('/account');
    }
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
              <a className="nav-link text-white" href="/search">
                <FaSearch size={20} />
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-white"
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // Ngừng hành động mặc định (chuyển hướng)
                  checkLogin(); // Kiểm tra trạng thái đăng nhập
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
    </header>
  );
};

export default Header;
