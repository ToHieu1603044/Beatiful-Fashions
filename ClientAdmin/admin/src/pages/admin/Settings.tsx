import React, { useState, useEffect } from "react";
import { Button, Input, Form, message, Modal } from "antd";
import { getUserProfile, changePassword } from "../../services/homeService";

const Settings = () => {
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        district: "",
        ward: "",
    });
    const [loading, setLoading] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Fetch user info
    useEffect(() => {
        const fetchUserInfo = async () => {
            setLoading(true);
            try {
                // Fetch user data
                const response = await getUserProfile();
                setUserInfo(response.data.data);
                console.log(response.data);
            } catch (error) {
                message.error("Lỗi khi tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    // Cập nhật thông tin người dùng
    const handleUpdateUserInfo = async (values: any) => {
        setLoading(true);
        try {
            await updateUserInfo(values);  // Giả sử bạn có hàm API này để cập nhật thông tin người dùng
            message.success("Cập nhật thông tin thành công!");
        } catch (error) {
            message.error("Cập nhật thông tin thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị modal thay đổi mật khẩu
    const showPasswordModal = () => {
        setPasswordModalVisible(true);
    };

    const hidePasswordModal = () => {
        setPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
    };

    // Xử lý thay đổi mật khẩu
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            message.error("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới");
            return;
        }
        setLoading(true);
        try {
            await changePassword({ currentPassword, newPassword });
            message.success("Thay đổi mật khẩu thành công!");
            hidePasswordModal();
        } catch (error) {
            message.error("Thay đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Cài đặt</h2>

            <Form
                name="userInfo"
                initialValues={userInfo} 
                onFinish={handleUpdateUserInfo}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                <Form.Item label="Họ và tên" name="name" rules={[{ required: true, message: "Vui lồng nhập họ và tên" }]}>
                    <Input/>
                </Form.Item>
                <Form.Item label="Email" name="email">
                    <Input disabled />
                </Form.Item>
                <Form.Item label="Số điện thoại" name="phone">
                    <Input />
                </Form.Item>
                <Form.Item label="Thành phố" name="city">
                    <Input />
                </Form.Item>
                <Form.Item label="Quận/Huyện" name="district">
                    <Input />
                </Form.Item>
                <Form.Item label="Phường/Xã" name="ward">
                    <Input />
                </Form.Item>
                {/* Các trường khác */}
                <Form.Item wrapperCol={{ span: 24 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật thông tin
                    </Button>
                </Form.Item>
            </Form>

            {/* Cài đặt bảo mật */}
            <div className="mt-4">
                <h3>Cài đặt bảo mật</h3>
                <Button onClick={showPasswordModal} type="primary">
                    Thay đổi mật khẩu
                </Button>
            </div>

            {/* Modal thay đổi mật khẩu */}
            <Modal
                title="Thay đổi mật khẩu"
                visible={passwordModalVisible}
                onCancel={hidePasswordModal}
                footer={[
                    <Button key="cancel" onClick={hidePasswordModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleChangePassword} loading={loading}>
                        Cập nhật mật khẩu
                    </Button>,
                ]}
            >
                <Form>
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
                </Form>
            </Modal>
        </div>
    );
};

export default Settings;
