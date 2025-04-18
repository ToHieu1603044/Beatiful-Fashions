import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL = "http://127.0.0.1:8000/api";
axios.defaults.baseURL = API_BASE_URL;

const token = localStorage.getItem("access_token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
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
  } = useForm({
    resolver: zodResolver(schema),
  });

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

  const login = async (email, password) => {
    return axios.post("/login", { email, password }).then((res) => res.data);
  };

  const googleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const onSubmit = async (data) => {
   
    console.log("Data:", data);
    
    setLoading(true);
    try {
      const response = await login(data.email, data.password);
      console.log(response);
      
      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        localStorage.setItem("users", JSON.stringify(response.user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.access_token}`;
        const userRoles = response.user.roles?.map(role => role.name);
  
        if (userRoles && userRoles.includes("admin")) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (error.response?.status === 429) {
        // Thông báo khi vượt quá số lần đăng nhập
        const message = error.response?.data?.message || "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau vài phút.";
        setError("email", { message });
        setError("password", { message: "" });
      } else {
        // Lỗi đăng nhập thông thường
        setError("email", { message: "Email hoặc mật khẩu không đúng" });
        setError("password", { message: "Vui lòng kiểm tra lại" });
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4 rounded-4" style={{ width: "380px", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(10px)" }}>
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Đăng nhập</h2>
        </div>
        <button
          className="btn btn-light w-100 d-flex align-items-center justify-content-center border rounded-3 mb-3"
          onClick={googleLogin}
        >
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
