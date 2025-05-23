import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FcGoogle } from "react-icons/fc";

// ======== Cấu hình API ========
const API_BASE_URL = "http://127.0.0.1:8000/api";
axios.defaults.baseURL = API_BASE_URL;

// ======== Kiểm tra token còn hiệu lực ========
const token = localStorage.getItem("access_token");
const tokenExpiry = localStorage.getItem("access_token_expiry");

if (token && tokenExpiry && new Date().getTime() < Number(tokenExpiry)) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
  localStorage.removeItem("access_token");
  localStorage.removeItem("access_token_expiry");
  delete axios.defaults.headers.common["Authorization"];
}

const schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({ resolver: zodResolver(schema) });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get("ReturnUrl");
    if (returnUrl) {
      sessionStorage.setItem("returnUrl", returnUrl);
    } else {
      sessionStorage.removeItem("returnUrl");
    }
  }, [location]);

  // ======== Gọi API login ========
  const login = async (email, password) => {
    return axios.post("/login", { email, password }).then((res) => res.data);
  };


  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  // ======== Gửi form ========
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data.email, data.password);
      if (response.access_token) {
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 ngày

        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("userId", JSON.stringify(response.user.id));
        localStorage.setItem("access_token_expiry", expiresAt.toString());
        localStorage.setItem("users", JSON.stringify(response.user));

        const userRoles = response.user.roles?.map(role => role.name) || response.role || [];
        localStorage.setItem("roles", JSON.stringify(userRoles));
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.access_token}`;

        // Điều hướng theo vai trò
        if (userRoles.includes("admin")) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const message = error.response?.data?.message || "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau vài phút.";
        setError("email", { message });
        setError("password", { message: "" });
      } else {
        setError("email", { message: "Email hoặc mật khẩu không đúng" });
        setError("password", { message: "Vui lòng kiểm tra lại" });
      }
    } finally {
      setLoading(false);
    }
  };

  // ======== (Tuỳ chọn) Tự động logout khi token hết hạn ========
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      const expiry = localStorage.getItem("access_token_expiry");
      if (expiry && new Date().getTime() > Number(expiry)) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }, 60000); // kiểm tra mỗi phút
    return () => clearInterval(interval);
  }, []);
  */

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
<div className="card shadow-lg border-0 p-4 rounded-4" style={{ width: "380px", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Đăng nhập</h2>
        </div>
        <button className="btn btn-light w-100 d-flex align-items-center justify-content-center border rounded-3 mb-3" onClick={googleLogin}>
          <FcGoogle className="me-2" size={20} /> Đăng nhập với Google
        </button>
        <hr />
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`form-control rounded-3 ${errors.email ? "is-invalid" : ""}`}
              placeholder="Nhập email của bạn"
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Mật khẩu</label>
            <input
              type="password"
              {...register("password")}
              className={`form-control rounded-3 ${errors.password ? "is-invalid" : ""}`}
              placeholder="Nhập mật khẩu"
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold shadow-sm rounded-3"
            disabled={loading}
            style={{ background: "linear-gradient(45deg, #4c6ef5, #5f3dc4)" }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="text-center mt-3">
          <a href="auth/forgot-password" className="text-decoration-none text-primary">Quên mật khẩu?</a>
        </div>
        <div className="text-center mt-2">
          <span>Chưa có tài khoản? </span>
          <a href="/register" className="text-decoration-none text-primary fw-bold">Đăng ký ngay</a>
        </div>
      </div>
    </div>
  );
};

export default Login;