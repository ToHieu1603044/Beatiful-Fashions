import { FaSearch, FaUser, FaShoppingCart } from 'react-icons/fa';
import { useState } from 'react';

const Header = () => {
  const [showDropdownAo, setShowDropdownAo] = useState(false);
  const [showDropdownQuan, setShowDropdownQuan] = useState(false);

  const handleMouseEnterAo = () => setShowDropdownAo(true);
  const handleMouseLeaveAo = () => setShowDropdownAo(false);

  const handleMouseEnterQuan = () => setShowDropdownQuan(true);
  const handleMouseLeaveQuan = () => setShowDropdownQuan(false);

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container d-flex align-items-center justify-content-start">
        {/* Logo */}
        <a className="navbar-brand me-3 text-white" href="/">
          <img
            src="//bizweb.dktcdn.net/100/347/891/themes/710583/assets/logo.png?1739517244563"
            alt="logo Lak Shop"
            className="img-fluid"
            style={{ maxWidth: '170px' }}
          />
        </a>

        {/* Toggle Navbar for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-3">
            {/* Dropdown: ÁO */}
            <li
              className="nav-item dropdown"
              onMouseEnter={handleMouseEnterAo}
              onMouseLeave={handleMouseLeaveAo}
            >
              <a
                className="nav-link dropdown-toggle text-white"
                href="/ao"
                id="navbarDropdownAo"
                role="button"
              >
                ÁO
              </a>
              {showDropdownAo && (
                <ul className="dropdown-menu show" aria-labelledby="navbarDropdownAo">
                  <li><a className="dropdown-item" href="/ao-thun">Áo Thun</a></li>
                  <li><a className="dropdown-item" href="/ao-vest">Áo Vest</a></li>
                  <li><a className="dropdown-item" href="/ao-dai">Áo Dài</a></li>
                </ul>
              )}
            </li>

            {/* Dropdown: QUẦN */}
            <li
              className="nav-item dropdown"
              onMouseEnter={handleMouseEnterQuan}
              onMouseLeave={handleMouseLeaveQuan}
            >
              <a
                className="nav-link dropdown-toggle text-white"
                href="/quan"
                id="navbarDropdownQuan"
                role="button"
              >
                QUẦN
              </a>
              {showDropdownQuan && (
                <ul className="dropdown-menu show" aria-labelledby="navbarDropdownQuan">
                  <li><a className="dropdown-item" href="/quan-au">Quần Âu</a></li>
                  <li><a className="dropdown-item" href="/quan-jeans">Quần Jeans</a></li>
                </ul>
              )}
            </li>

            {/* Các mục khác */}
            <li className="nav-item"><a className="nav-link text-white" href="/giay">GIÀY</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/lak-studios">LAKSTUDIOS</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/mu">MŨ</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/tui">TÚI</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/kinh">KÍNH</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/that-lung">THẮT LƯNG</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/ca-vat">CÀ VẠT</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/keychain">KEYCHAIN</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/vong">VÒNG</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/phu-kien">PHỤ KIỆN</a></li>
            <li className="nav-item"><a className="nav-link text-white" href="/tin-tuc">LOOKBOOK</a></li>

            {/* Search, User & Cart */}
            <li className="nav-item">
              <a className="nav-link text-white" href="/search">
                <FaSearch size={20} />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="/user">
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
