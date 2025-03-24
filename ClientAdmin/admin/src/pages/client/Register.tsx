import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { registerUser } from "../../services/homeService";
import "bootstrap/dist/css/bootstrap.min.css";

const schema = z
  .object({
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
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["password_confirmation"],
  });

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    discount: "",

    payment_method: "",
    note: "",
    province: "",
    city: "",
    district: "",
    district_name: "",
    ward: ""
  });


  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/provinces")
      .then((response) => setProvinces(response.data))
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`http://127.0.0.1:8000/api/provinces/${selectedProvince}?depth=2`)
        .then((response) => setDistricts(response.data.districts))
        .catch((error) => console.error("Error fetching districts:", error));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      axios
        .get(`http://127.0.0.1:8000/api/districts/${selectedDistrict}?depth=2`)
        .then((response) => setWards(response.data.wards))
        .catch((error) => console.error("Error fetching wards:", error));
    }
  }, [selectedDistrict]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setMessage("");
    setError("");


    const updatedData = {
      ...data,
      city: formData.city,
      district: formData.district_name,
      ward: selectedWard,
    };

    try {
      const response = await registerUser(updatedData);

      console.log(response.data);
      setMessage("Đăng ký thành công! Hãy đăng nhập.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      console.log("Dữ liệu đã gửi:", JSON.stringify(updatedData, null, 2));
      setError(error.response?.data?.message || "Lỗi đăng ký!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="card shadow-lg border-0 p-4 rounded-4"
        style={{ width: "600px", background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold text-dark">Đăng Ký</h2>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Tên người dùng</label>
              <input type="text" {...register("name")} className={`form-control ${errors.name ? "is-invalid" : ""}`} />
              {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Email</label>
              <input type="email" {...register("email")} className={`form-control ${errors.email ? "is-invalid" : ""}`} />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Số Điện Thoại</label>
              <input type="text" {...register("phone")} className="form-control" />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-bold">Mã Bưu Điện</label>
              <input type="text" {...register("zip_code")} className="form-control" />
            </div>

            <div className="col-md-12">
              <label className="form-label fw-bold">Địa Chỉ</label>
              <input type="text" {...register("address")} className="form-control" />
            </div>

            <div className="mb-3">
              <select
                value={selectedProvince}
                onChange={(e) => {
                  const provinceCode = e.target.value;
                  const provinceName = provinces.find(p => p.code == provinceCode)?.name || "";

                  setSelectedProvince(provinceCode);
                  setFormData(prev => ({
                    ...prev,
                    province: provinceCode,
                    city: provinceName,

                  }));
                }}
                className="form-select"
              >
                <option value="" disabled>Chọn tỉnh thành</option>
                {provinces.map(province => (
                  <option key={province.code} value={province.code}>{province.name}</option>
                ))}
              </select>

            </div>
            {/* Quận Huyện */}
            <div className="mb-3">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const districtCode = e.target.value;
                  const districtName = districts.find(d => d.code == districtCode)?.name || "";

                  setSelectedDistrict(districtCode);
                  setFormData(prev => ({
                    ...prev,
                    district: districtCode, // Lưu mã quận/huyện
                    district_name: districtName, // Lưu tên quận/huyện
                    ward: "" // Reset phường/xã khi thay đổi quận/huyện
                  }));
                }}
                className="form-select"
              >
                <option value="" disabled>Chọn quận huyện</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>

            </div>
            {/* Phường xã */}
            <div className="mb-3">
              <select
                value={selectedWard}
                onChange={(e) => {
                  setSelectedWard(e.target.value);
                  setFormData({ ...formData, ward: e.target.value });
                }}
                className="form-select"
              >
                <option value="" disabled selected>Chọn phường xã</option>
                {wards.map(ward => (
                  <option key={ward.code} value={ward.name}>{ward.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Mật khẩu</label>
            <input
              type="password"
              {...register("password")}
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Xác nhận mật khẩu</label>
            <input
              type="password"
              {...register("password_confirmation")}
              className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
            />
            {errors.password_confirmation && <div className="invalid-feedback">{errors.password_confirmation.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
