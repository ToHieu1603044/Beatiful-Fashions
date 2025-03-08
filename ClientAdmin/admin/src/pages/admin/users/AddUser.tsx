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
    } catch (error) {
      console.error("Error adding user", error);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Add New User</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="w-50">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input type="text" className="form-control" {...register("name", { required: true })} />
          {errors.name && <p className="text-danger">Name is required</p>}
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" {...register("email", { required: true })} />
          {errors.email && <p className="text-danger">Email is required</p>}
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
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select className="form-control" {...register("role")} defaultValue="admin">
            {/* <option value="member">Member</option> */}
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" {...register("password", { required: true })} />
          {errors.password && <p className="text-danger">Password is required</p>}
        </div>

        <button type="submit" className="btn btn-success">Add User</button>
      </form>
    </div>
  );
};

export default AddUser;