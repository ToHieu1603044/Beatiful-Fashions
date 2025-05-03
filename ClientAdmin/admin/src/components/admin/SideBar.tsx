import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiFoldersLine,
  RiShoppingBag3Line,
  RiSettings3Line,
  RiFileList3Line,
  RiRefund2Line,
  RiTrademarkLine,
  RiFlashlightLine,
  RiCoupon3Line,
  RiImage2Line,
  RiUser3Line,
  RiChat3Line,
  RiSettings2Line,
} from "react-icons/ri";
import {
  TbUserShield,
  TbLockAccess,
} from "react-icons/tb";
import { Button, message, Popconfirm } from "antd";
import { getUserProfile } from "../../services/homeService";
import { FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

const menuItems = [
  { to: "/admin", icon: <RiDashboardLine />, label: "Dashboard" },
  { to: "/admin/categories", icon: <RiFoldersLine />, label: "Danh Mục" },
  { to: "/admin/products", icon: <RiShoppingBag3Line />, label: "Sản Phẩm" },
  { to: "/admin/attributes", icon: <RiSettings3Line />, label: "Thuộc Tính" },
  { to: "/admin/orders", icon: <RiFileList3Line />, label: "Đơn Hàng" },
  { to: "/admin/orders/returns", icon: <RiRefund2Line />, label: "Đơn Hàng Hoàn trả" },
  { to: "/admin/brands", icon: <RiTrademarkLine />, label: "Thương Hiệu" },
  { to: "/admin/roles", icon: <TbUserShield />, label: "Vai Trò" },
  { to: "/admin/permissions", icon: <TbLockAccess />, label: "Quyền" },
  { to: "/admin/index-sales", icon: <RiFlashlightLine />, label: "FlashSales" },
  { to: "/admin/discounts", icon: <RiCoupon3Line />, label: "Giảm Giá" },
  { to: "/admin/slider", icon: <RiImage2Line />, label: "Slide" },
  {
    to: "#", icon: <RiUser3Line />, label: "Người Dùng", subMenu: [
      { to: "/admin/users/staff", label: "Danh sách" },
    ]
  },
  { to: "/admin/comments", icon: <RiChat3Line />, label: "Đánh giá" },
  { to: "/admin/settings", icon: <RiSettings2Line />, label: "Cài Đặt" },
  
];

const Sidebar = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const toggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getUserProfile();
        const data = response.data.data;
        setUser(data);

      } catch (error) {
        message.error("Không thể tải thông tin.");
      }
    };
    fetchUserInfo();
  }, []);
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success(response.data.message);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
     
      localStorage.removeItem("access_token");
      localStorage.removeItem("access_token_expiry");
      localStorage.removeItem("userId");
      localStorage.removeItem("roles");

      navigate("/login");
    }
  };
  return (
    <aside
      className="position-fixed top-0 start-0 bg-dark text-white p-3 vh-100 overflow-y-auto"
      style={{ width: isSidebarOpen ? "220px" : "60px", transition: "width 0.3s" }}
    >
      <div className="d-flex align-items-center pb-3 border-bottom border-secondary">
        <img src="https://placehold.co/32x32" alt="Logo" className="rounded-circle" />
        {isSidebarOpen &&<span className="fw-bold ms-2" style={{ fontSize: "12px" }}>
  {user?.name}{" "}
  <Popconfirm
    title="Bạn có chắc muốn đăng xuất?"
    onConfirm={handleLogout}
    okText="Đăng xuất"
    cancelText="Hủy"
  >
    <button
      className="btn btn-link p-0 border-0 text-danger ms-auto"
      style={{ fontSize: "1.2rem" }}
    >
      <FaSignOutAlt title="Đăng xuất" />
    </button>
  </Popconfirm>
</span>}
      </div>

      <ul className="list-unstyled mt-3">
        {menuItems.map(({ to, icon, label, subMenu }, index) => (
          <li className="mb-2 cursor-pointer" key={index}>
            {subMenu ? (
              <div
                className="d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded cursor-pointer"
                onClick={() => toggleSubMenu(label)}
              >
                <span className="me-2">{icon}</span>
                {isSidebarOpen && <span >{label}</span>}
              </div>
            ) : (
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`
                }
              >
                <span className="me-2">{icon}</span>
                {isSidebarOpen && <span>{label}</span>}
              </NavLink>
            )}
            {subMenu && isSidebarOpen && openSubMenu === label && (
              <ul className="list-unstyled ps-4">
                {subMenu.map((item, subIndex) => (
                  <li key={subIndex}>
                    <NavLink to={item.to} className="d-block py-2 px-3 text-white text-decoration-none rounded">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;