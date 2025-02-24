import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Thêm axios để thiết lập token
import { login } from "../../services/homeService";

// Schema kiểm tra dữ liệu đầu vào
const schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin location để kiểm tra ReturnUrl

  // Lưu ReturnUrl nếu có từ query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get("ReturnUrl");

    if (returnUrl) {
      // Lưu ReturnUrl vào sessionStorage (hoặc localStorage) để sử dụng sau khi đăng nhập
      sessionStorage.setItem("returnUrl", returnUrl);
    }
  }, [location]);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      console.log("Dữ liệu gửi đi:", data); // Debug dữ liệu trước khi gửi

      const response = await login(data.email, data.password);

      console.log("Phản hồi từ server:", response); // Debug phản hồi API

      if (response.access_token) {
        // Lưu thông tin người dùng và token vào localStorage
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("accessToken", response.access_token);
        
        // Thiết lập header Authorization cho axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.access_token}`;

        // Lấy ReturnUrl từ sessionStorage nếu có
        const returnUrl = sessionStorage.getItem("returnUrl");

        if (returnUrl) {
          // Điều hướng đến ReturnUrl nếu có, rồi xóa ReturnUrl
          navigate(returnUrl);
          sessionStorage.removeItem("returnUrl");
        } else {
          // Kiểm tra vai trò của người dùng và điều hướng đến trang phù hợp
          const userRoles = response.user.roles?.map(role => role.name);
          if (userRoles && userRoles.includes("admin")) {
            navigate(`/admin`); // Điều hướng đến trang admin nếu là admin
          } else {
            navigate(`/account`); // Điều hướng đến trang chính hoặc trang người dùng
          }
        }
      } else {
        alert("Đăng nhập không thành công.");
      }
    } catch (error: any) {
      console.error("Lỗi khi đăng nhập:", error.response?.data || error);
      alert(error.response?.data?.message || "Lỗi đăng nhập!");
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
        <button type="submit" className="btn btn-primary">Đăng nhập</button>
      </div>
    </form>
  );
};

export default Login;
