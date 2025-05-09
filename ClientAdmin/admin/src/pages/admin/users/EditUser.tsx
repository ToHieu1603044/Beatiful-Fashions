import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Checkbox, message } from "antd";
import axios from "axios";
import { getRoles } from "../../../services/roleService";
import { IUsers } from "../../../interfaces/User";

interface Props {
  visible: boolean;
  userId: string | null;
  onCancel: () => void;
  onUpdate: () => void;
}

const EditUserForm: React.FC<Props> = ({ visible, userId, onCancel, onUpdate }) => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  console.log("selectedRoles:", selectedRoles);
  
  // Hàm lấy thông tin người dùng
  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.data;
      console.log("user:", user); 
      
      const userRoles = user.role.map((r: any) => r.name);
      console.log("userRoles:", userRoles);

    
      form.setFieldsValue({
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        district: user.district,
        ward: user.ward,
        zip_code: user.zip_code,
        role: userRoles,
        active: user.active,
      });

      setSelectedRoles(userRoles); 
      console.log("selectedRoles set to:", userRoles);
    } catch (error) {
      
      message.error("Lỗi khi lấy thông tin người dùng");
    }
  };

  // Hàm lấy danh sách các vai trò
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userId && visible) {
      fetchUser();
      fetchRoles();
    }
  }, [userId, visible]);

  const onFinish = async (values: IUsers) => {
    console.log(values);
    
    const token = localStorage.getItem("access_token");
    try {
      await axios.put(`http://127.0.0.1:8000/api/users/${userId}`, {
        ...values,
        roles: selectedRoles,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Cập nhật thành công");
      onUpdate();
      onCancel();
    } catch (error) {
      if(error.response.status == 403) {
        window.location.href = '/403';
    }
      message.error("Cập nhật thất bại");
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      title="Chỉnh sửa người dùng"
      okText="Cập nhật"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="name" label="Tên">
          <Input />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
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

        <Form.Item name="zip_code" label="Mã bưu điện">
          <Input />
        </Form.Item>

        <Form.Item name="roles" label="Vai trò">
          <Checkbox.Group
            options={roles.map(r => ({ label: r.name, value: r.name }))}
            onChange={(val) => {
              setSelectedRoles(val as string[]);
              console.log("selectedRoles updated to:", val); 
            }}
            value={selectedRoles} 
          />
        </Form.Item>

        <Form.Item name="active" label="Trạng thái">
          <Select>
            <Select.Option value={true}>Active</Select.Option>
            <Select.Option value={false}>Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserForm;