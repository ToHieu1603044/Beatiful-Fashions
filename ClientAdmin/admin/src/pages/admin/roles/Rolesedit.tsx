import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditRole = () => {
  const { id } = useParams(); // Lấy ID từ URL
  console.log(id);
  
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  
  const token = localStorage.getItem("access_token");
  const fetchRole = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/roles/permissions`)
      console.log("response",response);
      
      // setValue("name", response.data.name);
    } catch (error) {
      console.error("Error fetching role:", error);
      setErrorMessage("Không thể tải thông tin vai trò");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchRole();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/roles/${id}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSuccessMessage(true);
      setTimeout(() => navigate("/admin/roles"), 1500);
    } catch (error) {
      console.error("Error updating role:", error);
      setErrorMessage("Lỗi khi cập nhật vai trò");
    }
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="container mt-4" style={{ maxWidth: "400px" }}>
      <h5 className="mb-3">Chỉnh sửa tên</h5>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Tên</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            {...register("name", { required: "Tên không được để trống" })}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100">Cập Nhật</button>
      </form>
      {successMessage && <div className="alert alert-success mt-3">Cập nhật thành công!</div>}
      {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
    </div>
  );
};

export default EditRole;