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
        console.log(response.data); 
        setUser(response.data.data);
      })
      .catch((error) => {
        console.error("Lỗi lấy thông tin user:", error);
        setUser(null);
      });
  }, []);
  console.log(user);
  return <div>{user ? <a className="text-decoration-none" href="/account"> <span>{user.name}</span></a> : <FaUser size={20} />}  </div>;
};

export default UserInfo;
