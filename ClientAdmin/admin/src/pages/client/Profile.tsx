
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/homeService";
import { FaClock, FaBox, FaTruck, FaStar, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaLock, FaTicketAlt, FaCoins, FaBoxOpen, FaCheckCircle } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { getDiscount, getDiscountForUser, handleRedeemVoucher } from "../../services/homeService";
import { changePassword } from "../../services/homeService";

import { Input, message, Button, Modal } from "antd"; // Thêm Input & Button từ Ant Design

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userVouchers, setuserVouchers] = useState([]);
  const [redeemableVouchers, setRedeemableVouchers] = useState([]);

  const fetchRedeemableVouchers = async () => {
    console.log("fetchRedeemableVouchers được gọi!");
    try {
      const response = await getDiscount();
      console.log("Dữ liệu nhận được:", response);
      setRedeemableVouchers(response.data.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher có thể đổi:", error);
    }
  };

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

  const redeemVoucher = async function (voucherId: number) {
    console.log(voucherId);

    await handleRedeemVoucher(voucherId);
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
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        if (response.data && response.data.data) {
          setUser(response.data.data);
          setPhone(response.data.data.phone || "");
          setAddress(response.data.data.address || "");
          setCity(response.data.data.city || "");
          setDistrict(response.data.data.district || "");
          setWard(response.data.data.ward || "");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
    fetchUserProfile();
    fetchRedeemableVouchers();
    VoucherbyUser();
  }, []);

  if (!user) return <div className="text-center mt-5">Loading...</div>;

  // Xử lý cập nhật thông tin
  const handleSaveChanges = async () => {
    try {
      const updatedData = { phone, address, city, district, ward };
      await updateUserProfile(updatedData);
      message.success("Cập nhật thông tin thành công!");
      setEditMode(false);
    } catch (error) {
      message.error("Lỗi khi cập nhật thông tin!");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    try {
      await changePassword({
        oldPassword,
        newPassword,
        newPassword_confirmation: confirmPassword, // Thêm trường này
      });
      message.success("Đổi mật khẩu thành công!");
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      message.error("Lỗi khi đổi mật khẩu!");
    }
  };







  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Thông tin tài khoản */}
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Thông tin tài khoản</h2>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center">
                <FaUser className="me-2 text-primary" /> <strong>Họ và tên:</strong> {user.name}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaEnvelope className="me-2 text-success" /> <strong>Email:</strong> {user.email}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaPhone className="me-2 text-warning" />
                <strong>Số điện thoại:</strong>
                {editMode ? (
                  <Input className="ms-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
                ) : (
                  <span className="ms-2">{phone || "Chưa có"}</span>
                )}
              </li>
              <li className="list-group-item d-flex align-items-center">
                <FaMapMarkerAlt className="me-2 text-danger" />
                <strong>Địa chỉ:</strong>
                {editMode ? (
                  <Input className="ms-2" value={address} onChange={(e) => setAddress(e.target.value)} />
                ) : (
                  <span className="ms-2">{address || "Chưa có"}</span>
                )}
              </li>
              {editMode && (
                <>
                  <li className="list-group-item d-flex align-items-center">
                    <strong>Thành phố:</strong>
                    <Input className="ms-2" value={city} onChange={(e) => setCity(e.target.value)} />
                  </li>
                  <li className="list-group-item d-flex align-items-center">
                    <strong>Quận/Huyện:</strong>
                    <Input className="ms-2" value={district} onChange={(e) => setDistrict(e.target.value)} />
                  </li>
                  <li className="list-group-item d-flex align-items-center">
                    <strong>Phường/Xã:</strong>
                    <Input className="ms-2" value={ward} onChange={(e) => setWard(e.target.value)} />
                  </li>
                </>
              )}
            </ul>

            {/* Nút chỉnh sửa và lưu */}
            {editMode ? (
              <Button type="primary" className="mt-3 w-100" onClick={handleSaveChanges}>
                <FaSave className="me-2" /> Lưu thay đổi
              </Button>
            ) : (
              <Button type="default" className="mt-3 w-100" onClick={() => setEditMode(true)}>
                Chỉnh sửa thông tin
              </Button>

            )}
            <Button type="primary" danger className="mt-2 w-100" onClick={() => setShowPasswordModal(true)}>
              <FaLock className="me-2" /> Đổi mật khẩu
            </Button>
          </div>
          <Modal title="Đổi mật khẩu" open={showPasswordModal} onCancel={() => setShowPasswordModal(false)} footer={[
            <Button key="cancel" onClick={() => setShowPasswordModal(false)}>Hủy</Button>,
            <Button key="save" type="primary" onClick={handleChangePassword}>Lưu mật khẩu</Button>
          ]}>
            <div className="mb-3">
              <label>Mật khẩu cũ:</label>
              <Input.Password value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label>Mật khẩu mới:</label>
              <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label>Xác nhận mật khẩu mới:</label>
              <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </Modal>

          {/* Trạng thái đơn hàng */}
          <div className="d-flex justify-content-around text-center my-4"> {/* Thêm my-4 để tạo khoảng cách */}
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
          </Tabs>



        </div>
      </div>
    </div>
  );
};

// CSS cho trạng thái đơn hàng
const statusBoxStyle = `
  .status-box {
    cursor: pointer;
    text-align: center;
    padding: 15px;
    border-radius: 10px;
    background-color: #f8f9fa;
    transition: all 0.3s;
  }
  .status-box:hover {
    background-color: #e9ecef;
    transform: scale(1.05);
  }
`;

// Inject CSS vào trang
const Style = () => <style>{statusBoxStyle}</style>;

export default () => (
  <>
    <Style />
    <Profile />
  </>
);

