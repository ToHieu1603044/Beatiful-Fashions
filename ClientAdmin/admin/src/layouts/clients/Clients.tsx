import Footer from "../../components/clients/Footer";
import Header from "../../components/clients/Header";
import { Outlet, useLocation } from "react-router-dom"; 
import MainContent from "../../components/clients/MainContent";

const Clients = () => {
    const location = useLocation();
    const isHome = location.pathname === "/"; 

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1">
                {isHome && <MainContent />} {/* Chỉ hiển thị MainContent nếu là trang chủ */}
                <Outlet /> {/* Hiển thị trang con */}
            </div>
            <footer className="bg-dark text-light shadow-sm">
                <Footer />
            </footer>
        </div>
    );
};

export default Clients;
