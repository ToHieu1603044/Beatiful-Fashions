import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/homeService";

// Schema kiểm tra dữ liệu đầu vào
const schema = z.object({
  name: z.string().min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: { name: string; email: string; password: string }) => {
    try {
      console.log("Dữ liệu gửi đi:", data); // Debug dữ liệu trước khi gửi

      const response = await registerUser(data.name, data.email, data.password);

      console.log("Phản hồi từ server:", response); // Debug phản hồi API

      alert("Đăng ký thành công! Hãy đăng nhập.");
      navigate(`/login`);
    } catch (error: any) {
      console.error("Lỗi khi đăng ký:", error.response?.data || error);
      alert(error.response?.data?.message || "Lỗi đăng ký!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 border rounded bg-light">
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Tên người dùng</label>
        <input
          type="text"
          {...register("name")}
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          id="name"
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>

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
        <button type="submit" className="btn btn-primary">Đăng ký</button>
      </div>
    </form>
  );
};

export default Register;