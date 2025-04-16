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
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

const { Search } = Input;

const Staff = () => {
  const [users, setUsers] = useState<IUsers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUsers | null>(null);
  const usersPerPage = 10;
  const navigate = useNavigate();
  const showUserDetail = (user: IUsers) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const getAll = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(response.data.data.filter((user: IUsers) => user.role.includes("manager")));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${id}`);
      message.success("Xóa thành công!");
      getAll();
    } catch (error) {
      console.log(error);
      message.error("Xóa thất bại!");
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
      title: "Mã Zip",
      dataIndex: "zipCode",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: IUsers) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetail(record)} />
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/users/${record.id}/edit`)}
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
      <Typography.Title level={3}>Danh sách Staff</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email..."
          allowClear
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
        />
        <Link to="/admin/users/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm Staff
          </Button>
        </Link>
      </Space>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
      />

      <div className="flex justify-center mt-4">
        <Pagination
          current={currentPage}
          pageSize={usersPerPage}
          total={filteredUsers.length}
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
        ]}
      >
        {selectedUser && (
          <div>
            <p><strong>Tên:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>SĐT:</strong> {selectedUser.phone}</p>
            <p><strong>Địa chỉ:</strong> {selectedUser.address}</p>
            <p><strong>Thành phố:</strong> {selectedUser.city}</p>
            <p><strong>Quận / Huyện:</strong> {selectedUser.district}</p>
            <p><strong>Phường / Xã:</strong> {selectedUser.ward}</p>
            <p><strong>Mã Zip:</strong> {selectedUser.zipCode}</p>
            <p><strong>Vai trò:</strong> {selectedUser.role}</p>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Staff;
