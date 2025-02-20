import { Outlet } from "react-router-dom";
import Footer from "../../components/clients/Footer";
import Header from "../../components/clients/Header";


const Clients = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="mt-3 flex-grow-1">
                    <Outlet />
                  </div>
            <footer className="bg-dark text-light shadow-sm">
                <Footer />
            </footer>
        </div>
    );
};

export default Clients;
