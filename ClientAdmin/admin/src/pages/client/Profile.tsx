import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../../services/homeService";
import { FaClock, FaBox, FaTruck, FaStar, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaLock } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
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
          <div className="mt-4 text-center">
            <h3 className="mb-3">Trạng thái đơn hàng</h3>
            <div className="row justify-content-center">
              <div className="col-6 col-md-3">
                <div className="status-box" onClick={() => navigate("/order-status?status=pending")}>
                  <FaClock size={40} className="text-warning" />
                  <p>Chờ xác nhận</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-box" onClick={() => navigate("/order-status?status=ready")}>
                  <FaBox size={40} className="text-primary" />
                  <p>Chờ lấy hàng</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-box" onClick={() => navigate("/order-status?status=shipping")}>
                  <FaTruck size={40} className="text-success" />
                  <p>Chờ giao hàng</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="status-box">
                  <FaStar size={40} className="text-warning" />
                  <p>Đánh giá</p>
                </div>
              </div>
            </div>
          </div>

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
