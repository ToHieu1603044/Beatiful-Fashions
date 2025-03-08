
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { permission } from '../../../interfaces/Permissions';
import axios from 'axios';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
const PermissionsEdit = () => {
  const navigate = useNavigate();
  const {id}=useParams();
  const [loading, setLoading] = useState(false);
  const {register,handleSubmit,formState:{errors},reset}= useForm<permission>();
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const getDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/permissions/${id}`);
      console.log(response.data);
      reset(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
      getDetail()
  }, [id]);
  const onSubmit = async (data: permission) => {
    try {
      const timestamp = dayjs().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm:ss[Z]");
  
      const newData = {
        ...data,
        created_at: timestamp,
        updated_at: timestamp,
      };
  
      await axios.put(`http://localhost:3000/permissions/${id}`, newData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      navigate("/admin/permissions");
    } catch (error) {
      console.error("Error adding permission", error);
    }
  };
  
  return (
    <>
       <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Thêm Permissions</h2>
        <button className="btn btn-secondary ms-3" onClick={() => navigate("/admin/permissions")}>
          Quay lại
        </button>
      </div>

      <div className="card p-4 shadow w-50 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Nhập tên danh mục */}
          <div className="mb-3">
            <label className="form-label">Tên Permissions</label>
            <input
              type="text"
              className={`form-control`}
              {...register('name')}
            />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>

          {/* Nhập Slug */}
          <div className="mb-3">
            <label className="form-label">guard_name</label>
            <input
              type="text"
              className={`form-control`}
              {...register('guard_name')}
            />
            {errors.guard_name && <div className="invalid-feedback">{errors.guard_name.message}</div>}
          </div>
          {/* Nút Submit */}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang thêm..." : "Sua permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

export default PermissionsEdit
