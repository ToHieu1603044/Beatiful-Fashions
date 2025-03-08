import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { permission } from '../../../interfaces/Permissions';
const Permission = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const getAll = async () => {
    try {
      const response = await axios.get("http://localhost:3000/permissions");
      console.log(response.data);
      setPermissions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAll();
  }, []);
  const handleDelete = async (id: string) => {
    console.log(id);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/permissions/${id}`);
        await Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });
        getAll(); // Cập nhật danh sách sau khi xóa
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: "Something went wrong.",
          icon: "error",
        });
      }
    }
  };

  const filteredUsers = permissions.filter(
    (item) =>
    (item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  return (
    <>
      <div className="container mt-4">

        <>
          <div className="d-flex align-items-center mb-3">
            <h2 className="mb-0">Danh sách Permissions</h2>
            <button className="btn btn-success ms-3" onClick={() => navigate("/admin/permissions/create")}>
              Thêm mới
            </button>
          </div>

          <div className="mb-3 w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Guard_name</th>
                  <th>Ngày tạo</th>
                  <th>Ngày cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((permission: any) => (
                  <tr key={permission.id}>
                    <td>{permission.id}</td>
                    <td>{permission.name}</td>
                    <td>{permission.guard_name}</td>
                    <td>{permission.created_at}</td>
                    <td>{permission.updated_at}</td>
                    <td>
                      <Link to={`/admin/permissions/${permission.id}/edit`} className="btn btn-sm btn-primary me-2" >Sửa</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(permission.id)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      </div>
    </>
  )
}

export default Permission
