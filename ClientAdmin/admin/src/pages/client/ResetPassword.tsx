import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [old_password, setOldPassword] = useState<string>("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/reset-password",
        {
          email,
          token,
          old_password,
          password,
          password_confirmation: confirmPassword,
        },
        {
          headers: { "X-Requested-With": "XMLHttpRequest" },
        }
      );

      setMessage("Mật khẩu đã được đặt lại thành công!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4 rounded-4" style={{ width: "380px", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Đặt lại mật khẩu</h2>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
            <label className="form-label fw-bold">Mật khẩu cũ</label>
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Nhập mật khẩu cũ..."
              value={old_password}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Mật khẩu mới</label>
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Nhập mật khẩu mới"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control rounded-3"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold shadow-sm rounded-3"
            disabled={loading}
            style={{ background: "linear-gradient(45deg, #4c6ef5, #5f3dc4)" }}
          >
            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
