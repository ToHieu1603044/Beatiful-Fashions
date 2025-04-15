import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { IUsers } from "../../../interfaces/User";
import { getRoles } from "../../../services/roleService";

dayjs.extend(utc);
dayjs.extend(timezone);

const AddUser = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IUsers>();
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check user role
    const userRole = localStorage.getItem("role");
    if (!userRole || userRole !== "admin") {
      alert("Bạn không có quyền truy cập!");
      navigate("/");
      return;
    }

    // Fetch roles from API
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách roles:", error);
      }
    };

    fetchRoles();
  }, [navigate]);

  const handleRoleChange = (roleName: string) => {
    setSelectedRoles(prevRoles =>
      prevRoles.includes(roleName)
        ? prevRoles.filter(r => r !== roleName)
        : [...prevRoles, roleName]
    );
  };

  const onSubmit = async (data: IUsers) => {
    try {
      data.role = selectedRoles;
      data.createDate = dayjs().tz("Asia/Ho_Chi_Minh").format(); // Add create date
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      await axios.post("http://127.0.0.1:8000/api/users", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Thêm người dùng thành công!");
      navigate("/admin/users");

    } catch (error) {
      alert("Thêm người dùng thất bại!");
      console.error("Lỗi khi thêm user:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Thêm Người Dùng Mới</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-50">
        <div className="mb-3">
          <label className="form-label">Tên</label>
          <input type="text" className="form-control" {...register("name", { required: true })} />
          {errors.name && <p className="text-danger">Name is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" {...register("email", { required: true })} />
          {errors.email && <p className="text-danger">Email is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Số Điện Thoại</label>
          <input type="text" className="form-control" {...register("phone")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Địa Chỉ</label>
          <input type="text" className="form-control" {...register("address")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Thành Phố</label>
          <input type="text" className="form-control" {...register("city", { required: true })} />
          {errors.city && <p className="text-danger">City is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Quận/Huyện</label>
          <input type="text" className="form-control" {...register("district", { required: true })} />
          {errors.district && <p className="text-danger">District is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phường/Xã</label>
          <input type="text" className="form-control" {...register("ward", { required: true })} />
          {errors.ward && <p className="text-danger">Ward is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Mã Bưu Điện</label>
          <input type="text" className="form-control" {...register("zipCode", { required: true })} />
          {errors.zipCode && <p className="text-danger">Zip Code is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Vai trò</label>
          <div>
            {roles.map(role => (
              <label key={role.id} className="me-3">
                <input
                  type="checkbox"
                  value={role.name}
                  checked={selectedRoles.includes(role.name)}
                  onChange={() => handleRoleChange(role.name)} 
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Mật khẩu</label>
          <input type="password" className="form-control" {...register("password", { required: true })} />
          {errors.password && <p className="text-danger">Password is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Xác Nhận Mật khẩu</label>
          <input type="password" className="form-control" {...register("password_confirmation", { required: true })} />
          {errors.password_confirmation && <p className="text-danger">Password confirmation is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Trạng thái</label>
          <select className="form-select" {...register("active")} defaultValue="true">
            <option value="true">Hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success">Thêm Người Dùng</button>
      </form>
    </div>
  );
};

export default AddUser;
