import 'bootstrap/dist/css/bootstrap.min.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PolicyLinks = () => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
    };

    const linkStyle = {
        background: 'none',
        border: 'none',
        color: 'white',
        padding: 0,
        textDecoration: 'none',
        cursor: 'pointer',
    };

    return (
        <div className="col-md-3">
            <h2>Chính Sách</h2>
            <ul className="list-unstyled">
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/gioi-thieu')} style={linkStyle}>Giới thiệu</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/dieu-khoan')} style={linkStyle}>Điều khoản</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/chinh-sach-bao-mat')} style={linkStyle}>Chính sách bảo mật</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/chinh-sach-thanh-toan')} style={linkStyle}>Chính sách thanh toán</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/chinh-sach-van-chuyen')} style={linkStyle}>Chính sách vận chuyển</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/chinh-sach-doi-hang')} style={linkStyle}>Chính sách đổi hàng</button>
                </li>
                <li className="mb-2">
                    <button onClick={() => handleNavigate('/huong-dan')} style={linkStyle}>Hướng dẫn</button>
                </li>
            </ul>
        </div>
    );
};

const Footer = () => {
    return (
        <footer className="container-fluid bg-dark text-light py-5 mt-auto">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <img
                            src="//bizweb.dktcdn.net/100/347/891/themes/710583/assets/logo.png?1739517244563"
                            alt="Logo"
                            className="img-fluid mb-3"
                            style={{ maxWidth: '170px' }}
                        />
                        <p>
                            Hộ kinh doanh: Lakshop<br />
                            Giấy chứng nhận đăng ký kinh doanh số: 01D8021441.<br />
                            Đăng ký lần đầu ngày 14/08/2022.<br />
                            Đăng ký thay đổi lần 2 ngày 02/10/2021.<br />
                            Nơi cấp: Phòng Tài Chính - Kế Hoạch - UBND Quận HBT.<br />
                            MST: 0105981261 - Ngày cấp: 27/08/2024 tại Chi cục Thuế Quận Hai Bà Trưng.<br />
                            Website: www.ducanh.vn
                        </p>
                        <div className="d-flex gap-3">
                            <FaFacebook size={30} />
                            <FaTwitter size={30} />
                            <FaLinkedin size={30} />
                        </div>
                    </div>

                    <PolicyLinks />

                    <div className="col-md-3">
                        <h2>Liên hệ</h2>
                        <ul className="list-unstyled">
                            <li className="mb-2"><FaPhone /> 0366783302</li>
                            <li className="mb-2"><FaEnvelope /> ww.leviet@gmail.com</li>
                            <li className="mb-2"><FaMapMarkerAlt /> Địa chỉ: 276 Phố Huế, Hai Bà Trưng, Hà Nội</li>
                        </ul>
                    </div>
                </div>
                <hr className="bg-light" />
                <p className="text-center">© Bản quyền thuộc về LakShop | Cung cấp bởi Sapo</p>
                <div className="text-center mt-3">
                    <img
                        src="//bizweb.dktcdn.net/100/347/891/themes/710583/assets/payment-icon.png?1739517244563"
                        alt="Payment Methods"
                        className="img-fluid"
                        style={{ maxWidth: '200px' }}
                    />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
