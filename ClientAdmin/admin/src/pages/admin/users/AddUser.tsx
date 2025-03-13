import axios from "axios";

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { IUsers } from "../../../interfaces/User";

dayjs.extend(utc);
dayjs.extend(timezone);

const AddUser = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IUsers>({
    defaultValues: {
      role: "admin",
      createDate: dayjs().tz("Asia/Ho_Chi_Minh").format(),
    },
  });
  const navigate = useNavigate();

  const onSubmit = async (data: IUsers) => {
    console.log(data);

    try {
      data.createDate = dayjs().tz("Asia/Ho_Chi_Minh").format();
      await axios.post("http://localhost:3000/users", data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      navigate("/admin/users/staff");

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoles } from "../../../services/roleService";

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
    active: true,
  });

  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // Lưu tên role
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Lấy role từ localStorage để kiểm tra quyền
    const userRole = localStorage.getItem("role");
    if (!userRole || userRole !== "admin") {
      alert("Bạn không có quyền truy cập!");
      navigate("/"); // Chuyển hướng nếu không phải admin
      return;
    }
    setIsAdmin(true);

    // Gọi API lấy danh sách roles
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    setFormData({
      ...formData,
      [name]: name === "active" ? value === "true" : value, // Chuyển đổi thành boolean
    });
  };
  

  const handleRoleChange = (roleName: string) => {
    setSelectedRoles((prevRoles) =>
      prevRoles.includes(roleName) ? prevRoles.filter((r) => r !== roleName) : [...prevRoles, roleName]
    );
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedRoles.length === 0) {
      alert("Vui lòng chọn ít nhất một vai trò!");
      return;
    }

    try {
      const userData = {
        ...formData,
        roles: selectedRoles, 
      };

      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      await axios.post("http://127.0.0.1:8000/api/users", userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Thêm người dùng thành công!");
      navigate("/admin/users");

    } catch (error) {
      alert("Thêm người dùng thất bại!");
      console.error("Lỗi khi thêm user:", error);
    }
  };


  if (!isAdmin) return null; // Không render nếu không có quyền

  return (
    <div className="container mt-4">

      <h2 className="mb-3">Add New User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-50">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" {...register("name", { required: true })} />
          {errors.name && <p className="text-danger">Name is required</p>}

      <h2 className="mb-3">Thêm Người Dùng Mới</h2>
      <form onSubmit={handleSubmit} className="w-50">
        <div className="mb-3">
          <label className="form-label">Tên</label>
          <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />

        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" {...register("email", { required: true })} />
          {errors.email && <p className="text-danger">Email is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input type="text" className="form-control" {...register("phone")} />

          <label className="form-label">Số Điện Thoại</label>
          <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} />

        </div>

        <div className="mb-3">

          <label className="form-label">Address</label>
          <input type="text" className="form-control" {...register("address")} />
        </div>
        <div className="mb-3">
          <label className="form-label">City</label>
          <input type="text" className="form-control" {...register("city", { required: true })} />
          {errors.city && <p className="text-danger">City is required</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">District</label>
          <input type="text" className="form-control" {...register("district", { required: true })} />
          {errors.district && <p className="text-danger">District is required</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Ward</label>
          <input type="text" className="form-control" {...register("ward", { required: true })} />
          {errors.ward && <p className="text-danger">Ward is required</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Zip Code</label>
          <input type="number" className="form-control" {...register("zipCode", { required: true })} />
          {errors.zipCode && <p className="text-danger">Zip Code is required</p>}
          <label className="form-label">Địa Chỉ</label>
          <input type="text" className="form-control" name="address" value={formData.address} onChange={handleChange} />

        </div>

        <div className="mb-3">

          <label className="form-label">Role</label>
          <select className="form-control" {...register("role")} defaultValue="admin">
            {/* <option value="member">Member</option> */}
            <option value="admin">Admin</option>
          </select>

          <label className="form-label">Tỉnh/Thành Phố</label>
          <input type="text" className="form-control" name="city" value={formData.city} onChange={handleChange} />

        </div>

        <div className="mb-3">
          <label className="form-label">Quận/Huyện</label>
          <input type="text" className="form-control" name="district" value={formData.district} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Phường/Xã</label>
          <input type="text" className="form-control" name="ward" value={formData.ward} onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Mã Bưu Điện</label>
          <input type="text" className="form-control" name="zip_code" value={formData.zip_code} onChange={handleChange} />
        </div>

        <div className="mb-3">

          <label className="form-label">Password</label>
          <input type="password" className="form-control" {...register("password", { required: true })} />
          {errors.password && <p className="text-danger">Password is required</p>}
        </div>

        <button type="submit" className="btn btn-success">Add User</button>

          <label className="form-label">Vai trò</label>
          <div>
            {roles.map((role) => (
              <label key={role.id} className="me-3">
                <input
                  type="checkbox"
                  value={role.name} // ✅ Sử dụng role.name
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
          <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Xác Nhận Mật khẩu</label>
          <input type="password" className="form-control" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Trạng thái</label>
          <select className="form-select" name="active" value={formData.active ? "true" : "false"} onChange={handleChange}>
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

