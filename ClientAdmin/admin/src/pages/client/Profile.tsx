import { useEffect, useState } from "react";
import { FaEdit, FaEnvelope, FaPhone, FaTicketAlt, FaCoins, FaMapMarkerAlt, FaCog, FaBoxOpen, FaTruck, FaCheckCircle } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { getDiscount, getDiscountForUser, getUserProfile, handleRedeemVoucher } from "../../services/homeService";
import ResetPassword from "./ResetPassword";



function Avatar({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="Avatar" className={`rounded-circle ${className}`} style={{ width: "80px", height: "80px" }} />;
}

function Button({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button className={`btn ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Tab({ children }: { children: React.ReactNode }) {
  return <div className="tab-pane fade show active">{children}</div>;
}

function Tabs({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div>
      <ul className="nav nav-tabs mb-4">
        {Array.isArray(children) && children.map((child: any, index) => (
          <li className="nav-item" key={index}>
            <button
              className={`nav-link ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {child.props.icon && <span className="me-2">{child.props.icon}</span>}
              {child.props.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="tab-content p-3 bg-white rounded shadow-sm">
        {Array.isArray(children) && children[activeTab]}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [userVouchers, setuserVouchers] = useState([]);
  const [user, setUser] = useState({});
  const [redeemableVouchers, setRedeemableVouchers] = useState([]);
  useEffect(() => {
    fetProfile();
    fetchRedeemableVouchers();
    VoucherbyUser();
  }, []);


  const VoucherbyUser = async () => {
    try {
      const response = await getDiscountForUser();

      setuserVouchers(response.data.data);
      console.log(response.data);
    } catch (error) {
      if (error.response.status === 404) {
        console.log("Không có voucher");
      }
      else {
        console.error("Lỗi khi lấy danh sách voucher cơ bản:", error);
      }
    }
  }
  const fetchRedeemableVouchers = async () => {
    try {
      const response = await getDiscount();

      setRedeemableVouchers(response.data.data);
      console.log(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher có thể đổi:", error);
    }
  };
  const redeemVoucher = async function (voucherId: number) {
    console.log(voucherId);

    await handleRedeemVoucher(voucherId);
  }
  const fetProfile = async () => {
    try {
      const response = await getUserProfile();
      console.log(response.data);
      setUser(response.data.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="container py-4">
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex align-items-center">
          {/* Avatar */}
          <Avatar src={user?.avatar || "/avatar.png"} className="me-3" />

          {/* Thông tin người dùng */}
          <div>
            <h4 className="mb-2">{user?.name || "Người dùng"}</h4>

            {/* Hiển thị Rank (hạng thành viên) */}
            <p className="text-muted mb-1">
              <FaCoins className="me-2 text-warning" />
              Hạng: <strong>{(user?.ranking)}</strong>
            </p>

            {/* Email */}
            <p className="text-muted mb-1">
              <FaEnvelope className="me-2" />
              {user?.email || "Chưa cập nhật"}
            </p>

            {/* Số điện thoại */}
            <p className="text-muted mb-1">
              <FaPhone className="me-2" />
              {user?.phone || "Chưa có số điện thoại"}
            </p>

            {/* Địa chỉ đầy đủ */}
            <p className="text-muted mb-0">
              <FaMapMarkerAlt className="me-2 text-danger" />
              {user?.ward ? `${user.ward}, ` : ""}
              {user?.district ? `${user.district}, ` : ""}
              {user?.city ? user.city : "Chưa có địa chỉ"}
            </p>
          </div>

          {/* Nút chỉnh sửa */}
          <Link to="/profile/edit" className="btn btn-outline-primary ms-auto">
            <FaEdit className="me-2" /> Chỉnh sửa
          </Link>
        </div>
      </div>

      <div className="d-flex justify-content-around text-center mb-4">
        <Link to="/orders" className="text-decoration-none text-dark">
          <FaBoxOpen className="fs-2 mb-2" />
          <p className="mb-0">Chờ xác nhận</p>
        </Link>
        <Link to="/orders" className="text-decoration-none text-dark">
          <FaTruck className="fs-2 mb-2" />
          <p className="mb-0">Đang giao</p>
        </Link>
        <Link to="/orders" className="text-decoration-none text-dark">
          <FaCheckCircle className="fs-2 mb-2 text-success" />
          <p className="mb-0">Hoàn thành</p>
        </Link>
      </div>


      <Tabs>
        <Tab label="Ví Voucher" icon={<FaTicketAlt />}>
          <div className="text-center py-4">
            <FaTicketAlt className="fs-1 mb-3 text-muted" />
            <h5>Danh sách mã giảm giá có thể đổi</h5>

            {redeemableVouchers.length > 0 ? (
              <div className="row">
                {redeemableVouchers.map((voucher: any) => (
                  <div key={voucher.id} className="col-md-4 mb-3">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h6 className="text-primary">{voucher.name}</h6>
                        {/* <p className="mb-1">Mã: <strong>{voucher.code}</strong></p> */}
                        <p className="text-muted">Giảm {voucher.value}% (Tối đa {voucher.max_discount.toLocaleString()}đ)</p>
                        <p className="text-muted">Áp dụng từ: {new Date(voucher.start_date).toLocaleDateString()}</p>
                        <p className="text-muted">HSD: {new Date(voucher.end_date).toLocaleDateString()}</p>
                        <p className="text-muted">Điểm đổi: {voucher.can_be_redeemed_with_points}</p>
                        <p className="text-muted">Yêu cầu đơn hàng tối thiểu: {voucher.min_order_amount.toLocaleString()}đ</p>

                        {/* Nút đổi voucher */}
                        <Button className="btn btn-success mt-2" onClick={() => redeemVoucher(voucher.id)}>
                          <FaTicketAlt className="me-2" /> Đổi Voucher
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Hiện tại không có voucher nào để đổi.</p>
            )}
            <hr className="my-4" />

            <h4>🎫 Danh sách voucher của bạn</h4>

            {userVouchers.length > 0 ? (
              <div className="row">
                {userVouchers.map((voucher: any) => (
                  <div key={voucher.id} className="col-md-4 mb-3">
                    <div className="card border-secondary">
                      <div className="card-body text-center">
                        <h6 className="text-secondary">{voucher.name}</h6>
                        <h6>Mã: {voucher.code}</h6>
                        <p className="text-muted">Giảm {voucher.value}% (Tối đa {voucher.max_discount.toLocaleString()}đ)</p>
                        <p className="text-muted">HSD: {new Date(voucher.end_date).toLocaleDateString()}</p>
                        <Button className="btn btn-outline-secondary mt-2">
                          <FaTicketAlt className="me-2" /> <a href="/">Sử dụng</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">❌ Bạn chưa có voucher nào.</p>
            )}
          </div>
        </Tab>

        <Tab label="Điểm của bạn" icon={<FaCoins />}>
          <div className="text-center py-4">
            <FaCoins className="fs-1 mb-3 text-warning" />
            <p>Bạn có <strong>{user.points}</strong> Điểm </p>
            <p>Mua càng nhiều cộng càng phiêu </p>
            <span>Cách tính : Đối với đơn hàng 100.000 VND ~ 1 Điểm (points)</span>
          </div>
        </Tab>
        <Tab label="Bảo mật & Cài đặt" icon={<FaCog />}>
          <div className="text-center py-4">
            <FaCog className="fs-1 mb-3 text-muted" />
            <p>Thay đổi mật khẩu và cài đặt bảo mật</p>
            <ResetPassword/>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
