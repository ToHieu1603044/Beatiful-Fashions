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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

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
  const usersPerPage = 5;
  const navigate = useNavigate();

  const showUserDetail = (user: IUsers) => {
    setSelectedUser(user);
    setIsModalVisible(true);
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

      setUsers(response.data.data);
      setTotalUsers(response.data.page.total);
    } catch (error) {
      console.log(error);
      message.error("Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAll(currentPage, filterType);
  }, [currentPage, filterType]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      message.success("Xóa thành công!");
      getAll(currentPage, filterType);
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
            <p><strong>Vai trò:</strong> {selectedUser.role && selectedUser.role.length > 0 ? selectedUser.role.map((r) => r.name).join(", ") : "N/A"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Staff;
