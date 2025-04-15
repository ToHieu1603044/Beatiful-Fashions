import React, { useEffect, useState } from "react";
import { getMaintenanceStatus } from "../../services/homeService";
import { Spin, Result } from "antd";

const MaintenancePage = () => {
  const [loading, setLoading] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await getMaintenanceStatus();
        const { maintenance, maintenance_message } = response.data.data;

        if (maintenance === true || maintenance === "true") {
          setMaintenanceMessage(maintenance_message || "Chúng tôi đang bảo trì hệ thống.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái bảo trì:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (maintenanceMessage) {
    return (
      <Result
        status="warning"
        title="🚧 Hệ thống đang bảo trì"
        subTitle={maintenanceMessage}
      />
    );
  }

  return null;
};

export default MaintenancePage;
