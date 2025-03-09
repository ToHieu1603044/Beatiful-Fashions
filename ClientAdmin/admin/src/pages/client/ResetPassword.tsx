import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Điều hướng sau khi reset thành công

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Hàm xử lý reset mật khẩu
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Ngăn form gửi request mặc định

    if (password !== confirmPassword) {
      setMessage("Mật khẩu không khớp!");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/reset-password", {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      }, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });

      setMessage("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => navigate("/login"), 2000); 
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  return (
    <div>
      <h2>Đặt lại mật khẩu</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Đặt lại mật khẩu</button>
      </form>
    </div>
  );
};

export default ResetPassword;
