import Footer from "../../components/clients/Footer";
import Header from "../../components/clients/Header";
import Main from "../../components/clients/MainContent";

const Clients = () => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1">
                <Main />
            </div>
            <footer className="bg-dark text-light shadow-sm">
                <Footer />
            </footer>
        </div>
    );
};

export default Clients;
