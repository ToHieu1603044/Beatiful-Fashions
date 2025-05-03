import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IUsers } from "../../../interfaces/User";
import {
  Input,
  Button,
  Table,
  Space,
  Pagination,
  message,
  Popconfirm,
  Typography,
  Modal,
  Select,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { getRoles } from "../../../services/roleService";

const { Search } = Input;

const Staff = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUsers | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const usersPerPage = 5;
  const navigate = useNavigate();
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const showUserDetail = (user: IUsers) => {
    setSelectedUser(user);
    setIsModalVisible(true);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      district: user.district,
      ward: user.ward,
      zipCode: user.zipCode,
      role: user.role && user.role.length > 0 ? user.role[0].name : "",
    });
  };

  const getAll = async (page: number = 1, type: string = "") => {
    try {
      setLoading(true);
      const response = await axios.get("http://127.0.0.1:8000/api/listUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          page,
          type,
        },
      });
         const resRole = await getRoles();
         setRoles(resRole.data);
      setUsers(response.data.data);
      setTotalUsers(response.data.page.total);
    } catch (error) {
      if(error.response.status == 403) {
        window.location.href = '/403';
    }
      console.log(error);
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };
 useEffect(() => {
   
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách roles:", error);
      }
    };

    fetchRoles();
  }, [navigate]);
  useEffect(() => {
    getAll(currentPage, filterType);
  }, [currentPage, filterType]);

  const handleDelete = async (id: string) => {
    try {
     const response = await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      message.success(response.data.message || "Xóa người dùng thành công!");
      getAll(currentPage, filterType);
    } catch (error) {
      if(error.response.status == 403) {
        window.location.href = '/403';
    }
      console.log(error);
      message.error(error.response.data.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
     
      const payload = {
        ...values,
        role: values.role ? [{ id: values.role, name: roles.find((r) => r.id === values.role)?.name }] : [],
      };
   const response =   await axios.put(
        `http://127.0.0.1:8000/api/users/${selectedUser?.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      message.success(response.data.message || "Cập nhật người dùng thanh cong!");
      setIsModalVisible(false);
      getAll(currentPage, filterType);
    } catch (error) {
      if(error.response.status == 403) {
        window.location.href = '/403';
    }
      console.log(error);
      message.error(error.response.data.message);
    }
  };
  

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: IUsers, index: number) =>
        (currentPage - 1) * usersPerPage + index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "SĐT",
      dataIndex: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
    },
    {
      title: "Tỉnh / Thành phố",
      dataIndex: "city",
    },
    {
      title: "Quận / Huyện",
      dataIndex: "district",
    },
    {
      title: "Phường / Xã",
      dataIndex: "ward",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role: any[]) => {
        return role.length > 0 ? role.map((r) => r.name).join(", ") : "N/A";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: IUsers) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetail(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => showUserDetail(record)} // Open modal with details
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <Typography.Title level={3}>Danh sách người dùng</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email..."
          allowClear
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />

        <Select
          value={filterType}
          onChange={(value) => {
            setCurrentPage(1);
            setFilterType(value);
          }}
          style={{ width: 200 }}
        >
          <Select.Option value="">Tất cả</Select.Option>
          <Select.Option value="staff">Nhân viên</Select.Option>
          <Select.Option value="customer">Khách hàng</Select.Option>
        </Select>

        <Link to="/admin/users/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Staff
          </Button>
        </Link>
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredUsers}
        pagination={false}
        loading={loading}
      />

      <div className="flex justify-center mt-4">
        <Pagination
          current={currentPage}
          pageSize={usersPerPage}
          total={totalUsers}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title="Chi tiết người dùng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="edit" type="primary" onClick={handleEditSubmit}>
            Cập nhật
          </Button>,
        ]}
      >
        {selectedUser && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name: selectedUser.name,
              email: selectedUser.email,
              phone: selectedUser.phone,
              address: selectedUser.address,
              city: selectedUser.city,
              district: selectedUser.district,
              ward: selectedUser.ward,
              zipCode: selectedUser.zipCode,
              role: selectedUser.role.length > 0 ? selectedUser.role[0].id : undefined, 
            }}
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="SĐT"
              rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
            <Form.Item name="city" label="Thành phố">
              <Input />
            </Form.Item>
            <Form.Item name="district" label="Quận / Huyện">
              <Input />
            </Form.Item>
            <Form.Item name="ward" label="Phường / Xã">
              <Input />
            </Form.Item>
            {/* <Form.Item name="zipCode" label="Mã Zip">
              <Input />
            </Form.Item> */}
            {roles.length > 0 ? (
              <Select
              value={selectedUser?.role?.[0]?.id || ""} 
                onChange={(value) => {
                  if (selectedUser) {
                    setSelectedUser({
                      ...selectedUser,
                      role: [{ id: value, name: roles.find((r) => r.id === value)?.name || "" }],
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <Typography.Text type="danger">Chưa có vai trò</Typography.Text>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Staff;
