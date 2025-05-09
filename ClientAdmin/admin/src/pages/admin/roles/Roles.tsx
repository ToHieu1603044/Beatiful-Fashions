import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  getRoles,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  removeAllPermissionsFromRole,
} from "../../../services/roleService";
import {
  Modal,
  Button,
  Table,
  Input,
  Spin,
  Collapse,
  Checkbox,
  message,
  Space,
  Popconfirm,
} from "antd";
import axios from "axios";

const { Panel } = Collapse;

const getAuthToken = () => localStorage.getItem("access_token");

const Roles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesRes, permissionsRes] = await Promise.all([
          getRoles({ search: searchTerm }),
          getPermissions(),
        ]);
        setRoles(rolesRes.data);
        setPermissions(permissionsRes.data);

        // Nhóm quyền theo model
        const grouped = permissionsRes.data.reduce((acc, perm) => {
          const model = perm.model || "Other";
          if (!acc[model]) acc[model] = [];
          acc[model].push(perm);
          return acc;
        }, {});
        setGroupedPermissions(grouped);
      } catch (error) {
        if (error.response?.status === 403) {
          window.location.href = "/403";
        } else {
          console.error("Lỗi khi tải dữ liệu:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm]);

  const handleShowPermissions = async (role) => {
    setSelectedRole(role);
    setShowModal(true);
    try {
      const response = await getRolePermissions(role.id);
      setSelectedPermissions(response.data.map((perm) => perm.id));
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (model) => {
    const modelPermissions = groupedPermissions[model].map((p) => p.id);
    const isAllSelected = modelPermissions.every((id) =>
      selectedPermissions.includes(id)
    );
    setSelectedPermissions((prev) =>
      isAllSelected
        ? prev.filter((id) => !modelPermissions.includes(id))
        : [...new Set([...prev, ...modelPermissions])]
    );
  };

  const handleSelectAllPermissions = () => {
    setSelectedPermissions(permissions.map((p) => p.id));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleDelete = async (id) => {
    const token = getAuthToken();
    try {
      await axios.delete(`http://127.0.0.1:8000/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== id));
      message.success("Xóa vai trò thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa vai trò:", error);
      message.error("Xóa thất bại. Vui lòng thử lại!");
    }
  };

  const handleRemoveAllPermissions = async (roleId) => {
    try {
      await removeAllPermissionsFromRole(roleId);
      message.success("Đã gỡ toàn bộ quyền!");
      setShowModal(false);
    } catch (error) {
      console.error("Error removing permissions:", error);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await updateRolePermissions(selectedRole.id, selectedPermissions);
      message.success("Cập nhật quyền thành công!");
      setShowModal(false);
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phân quyền",
      render: (_, role) => (
        <Button type="primary" onClick={() => handleShowPermissions(role)}>
          Phân quyền
        </Button>
      ),
    },
    {
      title: "Hành động",
      render: (_, role) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa vai trò này không?"
            onConfirm={() => handleDelete(role.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
          <Button onClick={() => navigate(`/admin/roles/${role.id}/edit`)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3 justify-content-between">
        <h2>Role Management</h2>
        <Link to="create">
          <Button type="primary">Thêm Mới</Button>
        </Link>
      </div>

      <Input
        placeholder="Tìm kiếm vai trò..."
        className="mb-3"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <Spin size="large" className="d-block text-center mt-5" />
      ) : (
        <Table rowKey="id" dataSource={roles} columns={columns} />
      )}

      <Modal
        title={`Phân quyền cho vai trò: ${selectedRole?.name}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Đóng
          </Button>,
          <Popconfirm
            key="remove-all"
            title="Bạn có chắc chắn muốn gỡ toàn bộ quyền?"
            onConfirm={() => handleRemoveAllPermissions(selectedRole?.id)}
            okText="Gỡ"
            cancelText="Hủy"
          >
            <Button danger>Gỡ toàn bộ quyền</Button>
          </Popconfirm>,
          <Button key="save" type="primary" onClick={handleSavePermissions}>
            Lưu
          </Button>,
        ]}
      >
        <Space className="mb-3">
          <Button onClick={handleSelectAllPermissions}>Chọn tất cả</Button>
          <Button onClick={handleClearAllPermissions}>Bỏ chọn tất cả</Button>
        </Space>

        <Collapse>
          {Object.keys(groupedPermissions).map((model) => (
            <Panel
              header={
                <div className="d-flex justify-content-between align-items-center">
                  <span>{model} Permissions</span>
                  <Checkbox
                    onChange={() => handleSelectAll(model)}
                    checked={groupedPermissions[model].every((perm) =>
                      selectedPermissions.includes(perm.id)
                    )}
                  >
                    Chọn tất cả {model}
                  </Checkbox>
                </div>
              }
              key={model}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                {groupedPermissions[model].map((perm) => (
                  <div key={perm.id} style={{ width: "33%" }}>
                    <Checkbox
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => handlePermissionChange(perm.id)}
                    >
                      {perm.name} {/* Hiển thị đầy đủ tên quyền như view_category */}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </Modal>

      <Outlet />
    </div>
  );
};

export default Roles;