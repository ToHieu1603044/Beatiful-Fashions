import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { IUsers } from "../../../interfaces/User";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IUsers>();

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        reset(response.data);
      } catch (error) {
        console.error("Error fetching user", error);
      }
    };
    getUser();
  }, [id, reset]);

  const onSubmit = async (data:IUsers) => {
    // console.log(data);
    try {
      await axios.put(`http://localhost:3000/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      navigate("/admin/users/staff");
    } catch (error) {
      console.error("Error updating user", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Edit User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-50">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" {...register("name")}/>
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
          <label className="form-label">Role</label>
          <select className="form-control" {...register("role")}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-success">Update User</button>
      </form>
    </div>
  );
};

export default EditUser;
