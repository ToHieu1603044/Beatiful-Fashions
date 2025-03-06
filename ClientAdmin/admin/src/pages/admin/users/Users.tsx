import axios from "axios";
import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { IUsers } from "../../../interfaces/Users";

const Users = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const navigate = useNavigate();

  const getAll = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure??")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/users/${id}`);
        getAll();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "" || user.role === roleFilter)
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Danh sách Users</h2>
      <div className="mb-3 d-flex gap-2 w-75">
        <input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="form-control w-50" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Tất cả vai trò</option>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Link to="/admin/users/add" className="btn btn-primary mb-3" >
      <i className="fa-solid fa-user-plus"></i> Add User
      </Link>
        
     

      <div className="table-responsive">
        <table className="table table-bordered table-striped table-sm text-center">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Email Verified At</th>
              <th>Phone</th>
              <th>Address</th>
              <th>City</th>
              <th>District</th>
              <th>Ward</th>
              <th>Zip Code</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstUser + index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.emailVerifiedAt}</td>
                <td>{item.phone}</td>
                <td>{item.address}</td>
                <td>{item.city}</td>
                <td>{item.district}</td>
                <td>{item.ward}</td>
                <td>{item.zipCode}</td>
                <td>{item.role}</td>
                <td className="text-center flex">
                  <button className="btn btn-warning " >
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button className="btn btn-primary mx-2" onClick={() => navigate(`/admin/users/${item.id}/edit`)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button className="btn btn-danger  " onClick={() => handleDelete(item.id)}>

                    <i className="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Trước</button>
          </li>
          {[...Array(totalPages).keys()].map((number) => (
            <li key={number} className={`page-item ${currentPage === number + 1 ? "active" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(number + 1)}>{number + 1}</button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Tiếp</button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Users;
