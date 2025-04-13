import React, { useEffect, useState } from "react";
import { message, Button } from "antd";
import axios from "axios";

const Maintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = axios.get("http://127.0.0.1:8000/api/maintenance");
        console.log("Trạng thái bảo trì:", response.data.maintenance_mode);
        setIsMaintenance(response.data.maintenance_mode); 
        setMaintenanceMessage(response.data.maintenance_message || "Hệ thống đang bảo trì, vui lòng quay lại sau.");
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái bảo trì:", error);
        message.error("Không thể tải thông tin bảo trì.");
      }
    };

    checkMaintenanceStatus();
  }, []);

  if (isMaintenance) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <h1>{maintenanceMessage}</h1>
        <Button type="primary" onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    );
  }

  return null; 
};

export default Maintenance;
