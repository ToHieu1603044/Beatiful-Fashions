import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  RiHome2Line, RiInstanceLine, RiFlashlightLine, RiSettings2Line, 
  RiMenuLine, RiListSettingsLine, RiShoppingCart2Line, RiUser3Line 
} from "react-icons/ri";
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside 
        className="position-fixed top-0 start-0 bg-dark text-white p-3 vh-100 overflow-y-auto"
        style={{ width: isSidebarOpen ? "220px" : "60px", transition: "width 0.3s" }}
      >
        <div className="d-flex align-items-center pb-3 border-bottom border-secondary">
          <img src="https://placehold.co/32x32" alt="Logo" className="rounded-circle" />
          {isSidebarOpen && <span className="fw-bold ms-2" style={{ fontSize: "12px" }}>Admin Dashboard</span>}
        </div>

        <ul className="list-unstyled mt-3">
          <li className="mb-2">
            <NavLink to="/admin" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiHome2Line className="me-2" />
              {isSidebarOpen && <span>Dashboard</span>}
            </NavLink>
          </li>
            <li className="mb-2">
              <NavLink to="/admin/categories" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
                <RiInstanceLine className="me-2" />
                {isSidebarOpen && <span>Danh Mục</span>}
              </NavLink>
            </li>
          <li className="mb-2">
            <NavLink to="/admin/products" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiFlashlightLine className="me-2" />
              {isSidebarOpen && <span>Sản Phẩm</span>}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/admin/attributes" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiListSettingsLine className="me-2" />
              {isSidebarOpen && <span>Thuộc Tính</span>}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/admin/orders" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiShoppingCart2Line className="me-2" />
              {isSidebarOpen && <span>Đơn Hàng</span>}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/admin/users" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiUser3Line className="me-2" />
              {isSidebarOpen && <span>Thành Viên</span>}
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/settings" className={({ isActive }) => `d-flex align-items-center py-2 px-3 text-white text-decoration-none rounded ${isActive ? "bg-primary" : ""}`}>
              <RiSettings2Line className="me-2" />
              {isSidebarOpen && <span>Cài Đặt</span>}
            </NavLink>
          </li>
        </ul>
      </aside>

      {/* Main Content - Phải chứa <Outlet /> để hiển thị nội dung */}
      <main className="flex-grow-1 bg-light p-3" style={{ marginLeft: isSidebarOpen ? "220px" : "60px", minHeight: "100vh", transition: "margin-left 0.3s" }}>
        <div className="py-2 px-4 bg-white d-flex align-items-center shadow-sm position-sticky top-0">
          <button type="button" className="btn btn-outline-secondary" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <RiMenuLine />
          </button>
          <ul className="d-flex align-items-center ms-3 mb-0 list-unstyled small">
            <li className="me-2">
              <NavLink to="/" className="text-muted text-decoration-none">Dashboard</NavLink>
            </li>
            <li className="me-2 text-muted">/</li>
            <li className="text-dark fw-medium">Analytics</li>
          </ul>
        </div>
        {/* Nơi chứa nội dung */}
        <div className="mt-3">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
