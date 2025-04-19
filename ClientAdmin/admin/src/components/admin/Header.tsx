import { NavLink } from "react-router-dom";
import { RiMenuLine } from "react-icons/ri";
import Notifications from "../Notification";

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="py-2 px-4 bg-white d-flex align-items-center shadow-sm position-sticky top-0 w-100">
      <button type="button" className="btn btn-outline-secondary" onClick={toggleSidebar}>
        <RiMenuLine />
      </button>

      <ul className="d-flex align-items-center ms-3 mb-0 list-unstyled small">
        <li className="me-2">
          <NavLink to="/admin" className="text-muted text-decoration-none">Dashboard</NavLink>
        </li>
        <li className="me-2 text-muted">/</li>
        <li className="text-dark fw-medium d-flex"></li>
      </ul>

      {/* Đưa thông báo về góc phải */}
      <div className="ms-auto">
        <Notifications />
      </div>
    </div>
  );
};

export default Header;
