import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Cấu hình API
const API_BASE_URL = "http://127.0.0.1:8000/api";
axios.defaults.baseURL = API_BASE_URL;

// Kiểm tra và thiết lập token từ localStorage khi reload trang
const token = localStorage.getItem("accessToken");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
} else {
  delete axios.defaults.headers.common["Authorization"];
}

// Schema kiểm tra dữ liệu đầu vào
const schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(5, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
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

  const login = async (email: string, password: string) => {
    return axios.post("/login", { email, password }).then(res => res.data);
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    
    try {
      const response = await login(data.email, data.password);
  
      if (response.access_token) {
        console.log("Access Token:", response.access_token); // Kiểm tra token
        
        localStorage.setItem("access_token", response.access_token);
        console.log("Token đã lưu:", localStorage.getItem("access_token")); // Kiểm tra lưu thành công chưa
        
        localStorage.setItem("role", response.role[0]);
        localStorage.setItem("user", JSON.stringify(response.user));
      
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.access_token}`;
      
        const returnUrl = sessionStorage.getItem("returnUrl");
        sessionStorage.removeItem("returnUrl");
      
        const userRoles = response.user.roles?.map(role => role.name);
        if (userRoles && userRoles.includes("admin")) {
          navigate("/admin");
        } else {
          navigate(returnUrl || "/");
        }
      }
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError("email", { message: "Email hoặc mật khẩu không đúng" });
        setError("password", { message: "Vui lòng kiểm tra lại" });
      } else if (error.response?.status === 403) {
        navigate("/403");
      } else {
        console.error("Lỗi khi đăng nhập:", error);
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded bg-light">
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          {...register("email")}
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          id="email"
        />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Mật khẩu</label>
        <input
          type="password"
          {...register("password")}
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          id="password"
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </div>
    </form>
  );
};

export default Login;
