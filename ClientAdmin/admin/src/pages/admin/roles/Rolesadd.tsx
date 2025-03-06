import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// const getAuthToken = () => localStorage.getItem("access_token");
const token = localStorage.getItem("access_token");
// console.log(token);



const AddRole = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // const token = getAuthToken();
      await axios.post("http://127.0.0.1:8000/api/roles", data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      reset();
      setSuccessMessage(true);
      setTimeout(() => navigate("/admin/roles"), 1500);
    } catch (error) {
      console.error("Error adding role:", error);
      setErrorMessage(true);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "400px" }}>
      <h5 className="mb-3">Thêm Name</h5>
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
        <button type="submit" className="btn btn-primary w-100">Thêm</button>
      </form>

      {successMessage && (
        <div className="alert alert-success mt-3" role="alert">
          Thêm vai trò thành công!
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger mt-3" role="alert">
          Lỗi khi thêm vai trò. Vui lòng thử lại!
        </div>
      )}
    </div>
  );
};

export default AddRole;
