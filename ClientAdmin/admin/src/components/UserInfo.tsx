import { useEffect, useState } from "react";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const UserInfo = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      })
      .then((response) => {
        setUser(response.data.data);
      })
      .catch((error) => {
        console.error("Lỗi lấy thông tin user:", error);
        setUser(null);
      });
  }, []);

  return (
    <div>
      {user ? (
        <a className="text-decoration-none" href="/account">
          <span>{user.name}</span>
        </a>
      ) : (
        <a href="/login">
          <FaUser size={20} />
        </a>
      )}
    </div>
  );
};

export default UserInfo;
