import { useState } from "react";
import { Outlet } from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import Header from "../../components/admin/Header";
import Footer from "../../components/admin/Footer";
import Sidebar from "../../components/admin/SideBar";
import Notification from "../../components/Notification";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <main
    
        className="flex-grow-1 bg-light d-flex flex-column"
        style={{
          marginLeft: isSidebarOpen ? "220px" : "60px",
          minHeight: "100vh",
          transition: "margin-left 0.3s",
        }}
      >
       
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Nội dung chính */}
        <div className="mt-3 flex-grow-1">
       
          <Outlet />
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;
