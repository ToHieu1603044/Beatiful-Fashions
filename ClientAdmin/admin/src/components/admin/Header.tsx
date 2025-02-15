import { NavLink } from "react-router-dom";
import { RiMenuLine } from "react-icons/ri";

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <div className="py-2 px-4 bg-white d-flex align-items-center shadow-sm position-sticky top-0">
      <button type="button" className="btn btn-outline-secondary" onClick={toggleSidebar}>
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
  );
};

export default Header;
