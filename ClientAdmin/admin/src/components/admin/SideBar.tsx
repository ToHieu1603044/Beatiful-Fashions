import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  RiHome2Line, RiInstanceLine, RiFlashlightLine, RiSettings2Line,
  RiListSettingsLine, RiShoppingCart2Line, RiUser3Line,
} from "react-icons/ri";
import { TbBrandDiscord, TbShieldLock } from "react-icons/tb";

const menuItems = [
  { to: "/", icon: <RiHome2Line />, label: "Dashboard" },
  { to: "/admin/categories", icon: <RiInstanceLine />, label: "Danh Mục" },
  { to: "/admin/products", icon: <RiFlashlightLine />, label: "Sản Phẩm" },
  { to: "/admin/attributes", icon: <RiListSettingsLine />, label: "Thuộc Tính" },
  { to: "/admin/orders", icon: <RiShoppingCart2Line />, label: "Đơn Hàng" },
  { to: "/admin/brands", icon: <TbBrandDiscord />, label: "Brands" },
  { to: "/admin/roles", icon: <TbShieldLock />, label: "Roles" },
  { to: "/admin/permissions", icon: <TbShieldLock />, label: "Permission" },
  { to: "#", icon: <RiUser3Line />, label: "User", subMenu: [
    { to: "/admin/users/staff", label: "Staff" },
    { to: "/admin/users/customers", label: "Customers" }
  ] },
  { to: "/admin/settings", icon: <RiSettings2Line />, label: "Cài Đặt" },
];

const Sidebar = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

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