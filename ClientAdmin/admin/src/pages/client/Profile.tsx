// Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "../../services/homeService"; // Giả sử bạn đã có hàm này để gọi API lấy thông tin người dùng

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        console.log("Dữ liệu API trả về:", response.data); // Kiểm tra dữ liệu thực tế
  
        if (response.data && response.data.data && typeof response.data.data === "object") {
          setUser(response.data.data); // Gán đúng object user
        } else {
          console.error("Dữ liệu người dùng không hợp lệ");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };
  
    fetchUserProfile();
  }, []);
  
  
  

  if (!user) return <div>Loading...</div>; // Nếu chưa có dữ liệu người dùng, hiển thị loading

  return (
    <div>
      <h1>Thông tin tài khoản</h1>
      <div>
        <p><strong>Họ và tên:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Số điện thoại:</strong> {user.phone}</p>
        <p><strong>Địa chỉ:</strong> {user.address}</p>
      
      </div>
    </div>
  );
};

export default Profile;
