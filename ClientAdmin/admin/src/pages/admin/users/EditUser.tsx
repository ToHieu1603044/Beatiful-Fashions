import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { IUsers } from "../../../interfaces/User";
import { getRoles } from "../../../services/roleService";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IUsers>();

  const [formData, setFormData] = useState<IUsers>({
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
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (!userRole || userRole !== "admin") {
      alert("Bạn không có quyền truy cập!");
      navigate("/");
      return;
    }
    
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách roles:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          alert("Bạn chưa đăng nhập!");
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.data;
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
          city: userData.city || "",
          district: userData.district || "",
          ward: userData.ward || "",
          zip_code: userData.zip_code || "",
          password: "",
          password_confirmation: "",
          active: userData.active ?? true,
        });

        // Load roles of the user correctly
        setSelectedRoles(Array.isArray(userData.roles) ? userData.roles.map((r: any) => String(r.name).trim()) : []);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchRoles();
    fetchUser();
  }, [id, navigate]);

  const onSubmit = async (data: IUsers) => {
    try {
      const userData = {
        ...data,
        roles: selectedRoles.map((role) => String(role).trim()), // Ensure roles are strings
      };

      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      await axios.put(`http://127.0.0.1:8000/api/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Cập nhật người dùng thành công!");
      navigate("/admin/users");

    } catch (error) {
      alert("Cập nhật người dùng thất bại!");
      console.error("Lỗi khi cập nhật user:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === "active" ? value === "true" : value,
    }));
  };

  const handleRoleChange = (roleName: string) => {
    setSelectedRoles(prevRoles =>
      prevRoles.includes(roleName)
        ? prevRoles.filter(r => r !== roleName)
        : [...prevRoles, roleName]
    );
  };

  // If user is not admin, don't render form
  if (!isAdmin) return null;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Edit User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-50">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" {...register("name")} />
          {errors.name && <p className="text-danger">Name is required</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" {...register("email")} disabled />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input type="text" className="form-control" {...register("phone")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <input type="text" className="form-control" {...register("address")} />
        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input type="text" className="form-control" {...register("city")} />
        </div>

        <div className="mb-3">
          <label className="form-label">District</label>
          <input type="text" className="form-control" {...register("district")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Ward</label>
          <input type="text" className="form-control" {...register("ward")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Zip Code</label>
          <input type="text" className="form-control" {...register("zip_code")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Roles</label>
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
          <label className="form-label">Password</label>
          <input type="password" className="form-control" {...register("password")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-control" {...register("password_confirmation")} />
        </div>

        <div className="mb-3">
          <label className="form-label">Active</label>
          <select className="form-select" name="active" value={formData.active ? "true" : "false"} onChange={handleChange}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <button type="submit" className="btn btn-success">Update User</button>
      </form>
    </div>
  );
};

export default EditUser;
