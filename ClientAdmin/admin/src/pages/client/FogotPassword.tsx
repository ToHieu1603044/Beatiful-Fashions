import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/forgot-password", data);

      setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } catch (error: any) {
      setError(error.response?.data?.message || "Lỗi khi gửi yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg border-0 p-4 rounded-4" style={{ width: "400px" }}>
        <h2 className="text-center fw-bold">Quên Mật Khẩu</h2>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              placeholder="Email..."
              {...register("email")}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
          <Link to="/login">
            <button className="btn btn-secondary w-100 mt-2">Huỷ</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
