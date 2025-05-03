import React, { useState, useEffect } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  message,
  Switch,
  Modal,
  Divider,
  Row,
  Col,
  Select,
} from "antd";
import { getUserProfile, changePassword, updateSystemSettings, getMaintenanceStatus } from "../../services/homeService";
import axios from "axios";

const { Option } = Select;
const { TabPane } = Tabs;

const Settings = () => {
  const [form] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [user, setUser] = useState({});
  const [site, setSite] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const maintenance = await getMaintenanceStatus();
        const response = await getUserProfile();
        const data = response.data.data;
        form.setFieldsValue(data);
        setUser(data);
        setTwoFactorEnabled(data.two_factor_enabled || false);
      } catch (error) {
        message.error("Không thể tải thông tin.");
      }
    };
    fetchUserInfo();
  }, [form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/site-setting", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
         
        });
        const siteData = response.data.data;
        console.log("Site settings:", siteData);
        console.log('Lang', response.data.language);
        setSite(siteData);
        setIsMaintenance(siteData.maintenance === "true");
        setMaintenanceMessage(siteData.maintenance_message || "");
        systemForm.setFieldsValue({
          site_name: siteData.site_name || "",
          support_email: siteData.support_email || "",
          hotline: siteData.hotline || "",
          language: siteData.language || "vi", 
          logo: siteData.logo || "",
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        message.error("Không thể tải cài đặt hệ thống.");
      }
    };
    fetchData();
  }, [systemForm]);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !passwordConfirmation) {
      return message.error("Vui lòng nhập đầy đủ thông tin.");
    }
    if (newPassword !== passwordConfirmation) {
      return message.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
    }
    try {
      setLoading(true);
      const response = await changePassword({
        old_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      message.success(response.data.message);
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đổi mật khẩu thất bại.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const data = {
        name: values.name,
        email: values.email,
        phone: values.phone || "",
        address: values.address || "",
        city: values.city || "",
        district: values.district || "",
        ward: values.ward || "",
      };

      const response = await axios.put("http://127.0.0.1:8000/api/users", data, { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } });;
      message.success(response.data.message || "Đã cập nhật thông tin cá nhân.");
      const userResponse = await getUserProfile();
      form.setFieldsValue(userResponse.data.data);
      setUser(userResponse.data.data);
    } catch (error) {
      console.error("Profile update error:", error.response);
      const errorMessage = error.response?.data?.message || "Cập nhật thông tin thất bại.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemSettings = async (values) => {
    console.log("Form values:", values);
    try {
      setLoading(true);
      const data = {
        ...values,
        maintenance: isMaintenance,
        maintenance_message: maintenanceMessage,
      };
      console.log("Data sent to backend:", data);
  
      const response = await updateSystemSettings(data);
      message.success(response.data.message || "Đã cập nhật cài đặt hệ thống!");
  
      if (values.language && values.language !== site.language) {
        site.language = values.language;
        window.location.reload();
      }
    } catch (error) {
      if(error.response.status == 403) {
        window.location.href = '/403';
      }
      console.error("System settings update error:", error.response);
      const errorMessage = error.response?.data?.message || "Lỗi khi cập nhật cài đặt hệ thống.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container mt-4">
      <h2>Cài đặt hệ thống</h2>
      <Divider />

      <Tabs defaultActiveKey="account">
        <TabPane tab="Tài khoản" key="account">
          <Row gutter={24}>
            <Col span={18}>
              <Form
                
                form={form}
                layout="vertical"
                onFinish={handleUpdateProfile}
              >
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { max: 20, message: "Số điện thoại không được vượt quá 20 ký tự" },
                    { pattern: /^[0-9]*$/, message: "Số điện thoại chỉ được chứa số" },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="address"
                  label="Địa chỉ"
                  rules={[{ max: 500, message: "Địa chỉ không được vượt quá 500 ký tự" }]}
                >
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="city"
                  label="Thành phố"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="district"
                  label="Quận/Huyện"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="ward"
                  label="Phường/Xã"
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Cập nhật
                  </Button>
                  <Button
                    className="ms-2"
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </TabPane>

      
        <TabPane tab="Cấu hình hệ thống" key="system">
          <Form
            form={systemForm}
            layout="vertical"
            onFinish={handleUpdateSystemSettings}
          >
            <Form.Item label="Tên website" name="site_name">
              <Input />
            </Form.Item>
            <Form.Item
              label="Ngôn ngữ"
              name="language"
          
              rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ" }]}
            >
              <Select>
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">Tiếng Anh</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Email hỗ trợ" name="support_email">
              <Input />
            </Form.Item>
            <Form.Item label="Hotline" name="hotline">
              <Input />
            </Form.Item>
            <Form.Item label="Bảo trì hệ thống">
              <Switch
                checked={isMaintenance}
                onChange={setIsMaintenance}
              />
            </Form.Item>
            {isMaintenance && (
              <Form.Item label="Thông báo bảo trì">
                <Input.TextArea
                  rows={4}
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>

      <Modal
        title="Thay đổi mật khẩu"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        onOk={handleChangePassword}
        confirmLoading={loading}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form layout="vertical">
          <Form.Item label="Mật khẩu hiện tại">
            <Input.Password
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới">
            <Input.Password
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;