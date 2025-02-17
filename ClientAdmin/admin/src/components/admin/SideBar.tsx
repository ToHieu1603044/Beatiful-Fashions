import { NavLink } from "react-router-dom";
import {
  RiHome2Line, RiInstanceLine, RiFlashlightLine, RiSettings2Line,
  RiListSettingsLine, RiShoppingCart2Line, RiUser3Line
} from "react-icons/ri";

const menuItems = [
  { to: "/", icon: <RiHome2Line />, label: "Dashboard" },
  { to: "/admin/categories", icon: <RiInstanceLine />, label: "Danh Mục" },
  { to: "/admin/products", icon: <RiFlashlightLine />, label: "Sản Phẩm" },
  { to: "/admin/attributes", icon: <RiListSettingsLine />, label: "Thuộc Tính" },
  { to: "/admin/orders", icon: <RiShoppingCart2Line />, label: "Đơn Hàng" },
  { to: "/admin/brands", icon: <RiShoppingCart2Line />, label: "Brands" },
  { to: "/admin/users", icon: <RiUser3Line />, label: "Thành Viên" },
  { to: "/admin/settings", icon: <RiSettings2Line />, label: "Cài Đặt" },
];

const Sidebar = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  return (
    <aside
      className="position-fixed top-0 start-0 bg-dark text-white p-3 vh-100 overflow-y-auto"
      style={{ width: isSidebarOpen ? "220px" : "60px", transition: "width 0.3s" }}
    >
      <div className="d-flex align-items-center pb-3 border-bottom border-secondary">
        <img src="https://placehold.co/32x32" alt="Logo" className="rounded-circle" />
        {isSidebarOpen && <span className="fw-bold ms-2" style={{ fontSize: "12px" }}>Admin Dashboard</span>}
      </div>

      <ul className="list-unstyled mt-3">
        {menuItems.map(({ to, icon, label }, index) => (
          <li className="mb-2" key={index}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`
              }
            >
              <span className="me-2">{icon}</span>
              {isSidebarOpen && <span>{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
