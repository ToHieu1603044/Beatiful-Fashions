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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    options: [] as string[],
  });
  const [editingId, setEditingId] = useState<number | null>(null);

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
  const handleEdit = async (id: number) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/attributes/${id}`
      );
      const data = response.data;

      setEditForm({
        name: data.name,
        options: data.values.map((item: any) => item.value),
      });

      setEditingId(data.id);
      setEditModalOpen(true);
    } catch (err) {
      message.error("Lỗi khi tải thông tin để chỉnh sửa.");
    }
  };

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
            message.success("Xóa thành công.");
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
          {/* <Button type="primary" onClick={() => handleEdit(record.id)}>
  Sửa
</Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 container">
      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          {error && (
            <Alert type="error" message={error} showIcon className="mb-4" />
          )}
          {isRootAttributes && (
            <>
              <div className="d-flex justify-between items-center mb-4">
                <Title level={3}>Danh sách thuộc tính</Title>
               
              </div>
              <Link  to="/admin/attributes/create">
                  <Button className="mb-5" type="primary">Thêm thuộc tính</Button>
                </Link>
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
                <p>
                  <Text strong>ID:</Text> {selectedAttribute.id}
                </p>
                <p>
                  <Text strong>Tên:</Text> {selectedAttribute.name}
                </p>
                <p>
                  <Text strong>Ngày tạo:</Text> {selectedAttribute.created_at}
                </p>
                <p>
                  <Text strong>Ngày cập nhật:</Text>{" "}
                  {selectedAttribute.updated_at}
                </p>

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
          <Modal
            title="Chỉnh sửa thuộc tính"
            open={editModalOpen}
            onCancel={() => setEditModalOpen(false)}
            onOk={async () => {
              try {
                const token = getAuthToken();
                await axios.put(
                  `http://127.0.0.1:8000/api/attributes/${editingId}`,
                  {
                    name: editForm.name,
                    options: editForm.options,
                  },
                  {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  }
                );

                message.success("Cập nhật thành công!");
                setEditModalOpen(false);
                fetchAttributes(); // reload lại bảng
              } catch (err) {
                console.error(err);
                message.error("Lỗi khi cập nhật.");
              }
            }}
            okText="Lưu"
            cancelText="Hủy"
          >
            <div style={{ marginBottom: 16 }}>
              <label>Tên:</label>
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="ant-input"
              />
            </div>

            <div>
              <label>Giá trị (options):</label>
              {editForm.options.map((opt, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", marginBottom: 8, gap: 8 }}
                >
                  <input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...editForm.options];
                      newOptions[idx] = e.target.value;
                      setEditForm({ ...editForm, options: newOptions });
                    }}
                    className="ant-input"
                  />
                  <Button
                    danger
                    onClick={() => {
                      const newOptions = editForm.options.filter(
                        (_, i) => i !== idx
                      );
                      setEditForm({ ...editForm, options: newOptions });
                    }}
                  >
                    X
                  </Button>
                </div>
              ))}
              <Button
                onClick={() =>
                  setEditForm({
                    ...editForm,
                    options: [...editForm.options, ""],
                  })
                }
              >
                + Thêm giá trị
              </Button>
            </div>
          </Modal>

          <Outlet context={{ handleAdd }} />
        </>
      )}
    </div>
  );
};

export default Attributes;
