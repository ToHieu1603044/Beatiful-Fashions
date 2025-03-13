import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/homeService";

// Schema kiểm tra dữ liệu đầu vào
const schema = z.object({
  name: z.string().min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  zip_code: z.string().optional(),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  password_confirmation: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  active: z.boolean().default(true),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["password_confirmation"],
});

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    try {
      console.log("Dữ liệu gửi đi:", data);
  
      const response = await registerUser(
        data.name, 
        data.email, 
        data.password, 
        data.password_confirmation, // Gửi thêm password_confirmation
        data.phone, 
        data.address, 
        data.city, 
        data.district, 
        data.ward, 
        data.zip_code
      );
  
      console.log("Phản hồi từ server:", response);
      
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
        <label className="form-label">Tên người dùng</label>
        <input type="text" {...register("name")} className={`form-control ${errors.name ? "is-invalid" : ""}`} />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Email</label>
        <input type="email" {...register("email")} className={`form-control ${errors.email ? "is-invalid" : ""}`} />
        {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Số Điện Thoại</label>
        <input type="text" {...register("phone")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Địa Chỉ</label>
        <input type="text" {...register("address")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Tỉnh/Thành Phố</label>
        <input type="text" {...register("city")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Quận/Huyện</label>
        <input type="text" {...register("district")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Phường/Xã</label>
        <input type="text" {...register("ward")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Mã Bưu Điện</label>
        <input type="text" {...register("zip_code")} className="form-control" />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Mật khẩu</label>
        <input type="password" {...register("password")} className={`form-control ${errors.password ? "is-invalid" : ""}`} />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>
      
      <div className="mb-3">
        <label className="form-label">Xác Nhận Mật khẩu</label>
        <input type="password" {...register("password_confirmation")} className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`} />
        {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation.message}</div>}
      </div>
      
      <button type="submit" className="btn btn-primary">Đăng ký</button>
    </form>
  );
};

export default Register;
