import React, { useState, useEffect } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Upload,
  Switch,
  Modal,
  Divider,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getUserProfile, changePassword, updateSystemSettings, getMaintenanceStatus } from "../../services/homeService";
import type { RcFile } from "antd/es/upload";

const { TabPane } = Tabs;

const Settings = () => {
  const [form] = Form.useForm();
  const [systemForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const maintaince = await getMaintenanceStatus()
        const response = await getUserProfile();
        const data = response.data.data;
        form.setFieldsValue(data);
        setAvatarUrl(data.avatar || "");
        setTwoFactorEnabled(data.two_factor_enabled || false);
        setIsMaintenance(data.maintenance || false);
        setMaintenanceMessage(data.maintenance_message || "");
        systemForm.setFieldsValue({
          site_name: data.site_name,
          support_email: data.support_email,
          hotline: data.hotline,
        });
      } catch (error) {
        message.error("Không thể tải thông tin.");
      }
    };
    fetchUserInfo();
  }, [form, systemForm]);

  const handleUpload = (file: RcFile) => {
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    return false;
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      return message.error("Vui lòng nhập đầy đủ thông tin.");
    }

    try {
      setLoading(true);
      await changePassword({ currentPassword, newPassword });
      message.success("Đổi mật khẩu thành công!");
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      message.error("Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSystemSettings = async (values: any) => {
    try {
      setLoading(true);
      await updateSystemSettings({
        ...values,
        maintenance: isMaintenance,
        maintenance_message: maintenanceMessage,
      });
      message.success("Đã cập nhật cài đặt hệ thống!");
    } catch (error) {
      message.error("Lỗi khi cập nhật.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Cài đặt hệ thống</h2>
      <Divider />

      <Tabs defaultActiveKey="account">
        {/* TAB: Thông tin tài khoản */}
        <TabPane tab="Tài khoản" key="account">
          <Row gutter={24}>
            <Col span={6}>
              <Avatar size={120} src={avatarUrl} />
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                {/* <Button icon={<UploadOutlined />} className="mt-2">Tải ảnh đại diện</Button> */}
              </Upload>
            </Col>

            <Col span={18}>
              <Form
                form={form}
                layout="vertical"
                onFinish={(values) => message.success("Đã cập nhật thông tin cá nhân.")}
              >
                <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="email" label="Email">
                  <Input disabled />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại">
                  <Input />
                </Form.Item>
                <Form.Item name="city" label="Thành phố">
                  <Input />
                </Form.Item>
                <Form.Item name="district" label="Quận/Huyện">
                  <Input />
                </Form.Item>
                <Form.Item name="ward" label="Phường/Xã">
                  <Input />
                </Form.Item>

                {/* <Form.Item label="Xác thực 2 yếu tố">
                  <Switch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                </Form.Item> */}

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>Cập nhật</Button>
                  <Button className="ms-2" onClick={() => setPasswordModalVisible(true)}>
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </TabPane>

        {/* TAB: Cài đặt bảo mật */}
        <TabPane tab="Bảo mật" key="security">
          <Form layout="vertical">
            <Form.Item label="Xác thực 2 yếu tố">
              <Switch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
            </Form.Item>
            <Button type="primary" onClick={() => setPasswordModalVisible(true)}>
              Thay đổi mật khẩu
            </Button>
          </Form>
        </TabPane>

        {/* TAB: Cấu hình hệ thống */}
        <TabPane tab="Cấu hình hệ thống" key="system">
          <Form form={systemForm} layout="vertical" onFinish={handleUpdateSystemSettings}>
            <Form.Item label="Tên website" name="site_name">
              <Input />
            </Form.Item>
            <Form.Item label="Email hỗ trợ" name="support_email">
              <Input />
            </Form.Item>
            <Form.Item label="Hotline" name="hotline">
              <Input />
            </Form.Item>

            <Form.Item label="Bảo trì hệ thống">
              <Switch checked={isMaintenance} onChange={setIsMaintenance} />
            </Form.Item>
            {isMaintenance && (
              <Form.Item label="Thông báo bảo trì">
                <Input.TextArea rows={4} value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)} />
              </Form.Item>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        {/* TAB: Cài đặt Email */}
        <TabPane tab="Gửi Email" key="email">
          <p>👉 Phần này bạn có thể mở rộng theo nhu cầu như SMTP config, test mail, Mailgun, v.v.</p>
        </TabPane>
      </Tabs>

      {/* Modal đổi mật khẩu */}
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
            <Input.Password value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Form.Item>
          <Form.Item label="Mật khẩu mới">
            <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
