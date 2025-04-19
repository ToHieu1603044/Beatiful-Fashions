import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  message,
  Space,
  Typography,
  Spin,
  Alert,
} from "antd";

const { Title, Text } = Typography;

// Hàm lấy token từ localStorage
const getAuthToken = () => localStorage.getItem("access_token");

const Attributes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootAttributes = location.pathname === "/admin/attributes";

  const [attributes, setAttributes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<any | null>(null);

  const fetchAttributes = () => {
    const token = getAuthToken();
    axios
      .get("http://127.0.0.1:8000/api/attributes", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        setAttributes(response.data);
        setError(null);
      })
      .catch((error) => {
        setError("Lỗi khi tải dữ liệu: " + error.message);
        console.error("Error fetching attributes:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận",
      content: "Bạn có chắc muốn xóa?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        const token = getAuthToken();
        axios
          .delete(`http://127.0.0.1:8000/api/attributes/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          .then(() => {
            setAttributes((prev) => prev.filter((attr) => attr.id !== id));
            message.success("Đã xóa thành công.");
          })
          .catch((error) => {
            console.error("Error deleting attribute:", error);
            message.error("Xóa thất bại.");
          });
      },
    });
  };

  const handleAdd = (newAttribute: any) => {
    setAttributes((prev) => [...prev, newAttribute]);
  };

  const handleShowModal = (attribute: any) => {
    setSelectedAttribute(attribute);
    setModalOpen(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updated_at",
    },
    {
      title: "Thao tác",
      render: (_: any, record: any) => (
        <Space>
          <Button type="default" onClick={() => handleShowModal(record)}>
            Xem
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/attributes/edit/${record.id}`)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          {error && <Alert type="error" message={error} showIcon className="mb-4" />}
          {isRootAttributes && (
            <>
              <div className="d-flex justify-between items-center mb-4">
                <Title level={3}>Danh sách Attributes</Title>
                <Link to="/admin/attributes/create">
                  <Button type="primary">Thêm thuộc tính</Button>
                </Link>
              </div>

              <Table
                columns={columns}
                dataSource={attributes}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </>
          )}

          <Modal
            title="Chi tiết thuộc tính"
            open={modalOpen}
            onCancel={() => setModalOpen(false)}
            footer={[
              <Button key="close" onClick={() => setModalOpen(false)}>
                Đóng
              </Button>,
            ]}
            width={800}
          >
            {selectedAttribute && (
              <>
                <p><Text strong>ID:</Text> {selectedAttribute.id}</p>
                <p><Text strong>Tên:</Text> {selectedAttribute.name}</p>
                <p><Text strong>Ngày tạo:</Text> {selectedAttribute.created_at}</p>
                <p><Text strong>Ngày cập nhật:</Text> {selectedAttribute.updated_at}</p>

                <Title level={4}>Danh sách giá trị</Title>
                {selectedAttribute.values.length > 0 ? (
                  <Table
                    columns={[
                      { title: "ID", dataIndex: "id" },
                      { title: "Giá trị", dataIndex: "value" },
                      { title: "Ngày tạo", dataIndex: "created_at" },
                      { title: "Ngày cập nhật", dataIndex: "updated_at" },
                    ]}
                    dataSource={selectedAttribute.values}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Text italic>Không có giá trị nào.</Text>
                )}
              </>
            )}
          </Modal>

          <Outlet context={{ handleAdd }} />
        </>
      )}
    </div>
  );
};

export default Attributes;
