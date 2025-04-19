import axios from "axios";
import { useEffect, useState } from "react";
import { IUsers } from "../../../interfaces/User";
import {
  Input,
  Table,
  Pagination,
  Typography,
  Space,
  message,
  Button,
  Popconfirm,
  Modal,
} from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import EditUserForm from "./EditUser";

const { Search } = Input;

const Users = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);

  const handleEdit = (id: string) => {
    setSelectedUserId(id);
    setEditVisible(true);
  };
  const [users, setUsers] = useState<IUsers[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUsers | null>(null);
  const showUserDetail = (user: IUsers) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };
  const usersPerPage = 10;
  const navigate = useNavigate();

  const getAll = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/listUsers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUsers(response.data.data.filter((user: IUsers) => !user.role.includes("admin")));
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi lấy danh sách người dùng");
    }
  };

  useEffect(() => {
    getAll();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      message.success("Xóa người dùng thành công");
      getAll();
    } catch (error) {
      console.log(error);
      message.error("Xóa người dùng thất bại");
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
      render: (_: any, __: IUsers, index: number) => (currentPage - 1) * usersPerPage + index + 1,
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
      title: "Địa chỉ chi tiết",  // Gộp 3 cột thành 1
      key: "fullAddress",
      render: (_: any, record: IUsers) => {
        const { address, ward, district, city } = record;
        const fullAddress = `${address || ""}, ${ward || ""}, ${district || ""}, ${city || ""}`;
        return (
          <div className="address-column">{fullAddress}</div>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: IUsers) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => showUserDetail(record)} />
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)} />
          <Popconfirm
            title="Bạn có chắc muốn xóa người dùng này?"
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
      <Typography.Title level={3}>Danh sách Users</Typography.Title>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email..."
          allowClear
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 400 }}
        />
      </Space>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
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
      <EditUserForm
        visible={editVisible}
        userId={selectedUserId}
        onCancel={() => setEditVisible(false)}
        onUpdate={() => {
          // call API để reload lại danh sách user sau khi cập nhật
        }}
      />
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
            {/* <p><strong>Mã Zip:</strong> {selectedUser.zipCode}</p>
            <p><strong>Vai trò:</strong> {selectedUser.role}</p> */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
