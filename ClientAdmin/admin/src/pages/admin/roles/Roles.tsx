import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRoles,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  removeAllPermissionsFromRole,
} from "../../../services/roleService";
import { Modal, Button, Table, Form, Accordion, Spinner } from "react-bootstrap";

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

        const grouped = permissionsRes.data.reduce((acc, perm) => {
          const model = perm.model || "Other";
          if (!acc[model]) acc[model] = [];
          acc[model].push(perm);
          return acc;
        }, {});
        setGroupedPermissions(grouped);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm]);

  // Mở modal phân quyền
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

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRole(null);
    setSelectedPermissions([]);
  };

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  // Chọn tất cả quyền trong một nhóm
  const handleSelectAll = (model) => {
    const modelPermissions = groupedPermissions[model].map((p) => p.id);
    const isAllSelected = modelPermissions.every((id) => selectedPermissions.includes(id));
    setSelectedPermissions((prev) =>
      isAllSelected ? prev.filter((id) => !modelPermissions.includes(id)) : [...prev, ...modelPermissions]
    );
  };

  // Chọn tất cả quyền
  const handleSelectAllPermissions = () => {
    setSelectedPermissions(permissions.map((p) => p.id));
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleRemoveAllPermissions = async (roleId) => {
    if (!window.confirm("Are you sure you want to remove all permissions?")) return;

    try {
      await removeAllPermissionsFromRole(roleId);
      alert("All permissions removed successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error removing permissions:", error);
    }
  };

  // Lưu quyền
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    if (!window.confirm("Are you sure you want to update permissions?")) return;

    try {
      await updateRolePermissions(selectedRole.id, selectedPermissions);
      alert("Permissions updated successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Role Management</h2>
        <Button variant="success" className="ms-3" onClick={() => navigate("/admin/roles/create")}>
          Add New
        </Button>
      </div>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search roles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowPermissions(role)}>Assign Permissions</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for Assigning Permissions */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Assign Permissions to {selectedRole?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 d-flex gap-2">
            <Button variant="warning" onClick={handleSelectAllPermissions}>Select All</Button>
            <Button variant="danger" onClick={handleClearAllPermissions}>Clear All</Button>
          </div>

          <Accordion defaultActiveKey="0">
            {Object.keys(groupedPermissions).map((model, index) => (
              groupedPermissions[model].length > 0 && (
                <Accordion.Item eventKey={index.toString()} key={model}>
                  <Accordion.Header>
                    {model}
                    <Button size="sm" className="ms-3" onClick={() => handleSelectAll(model)}>Select All</Button>
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="d-flex flex-wrap">
                      {groupedPermissions[model].map((permission) => (
                        <Form.Check
                          key={permission.id}
                          type="checkbox"
                          label={permission.name}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                          className="m-2"
                        />
                      ))}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              )
            ))}
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="danger" onClick={() => handleRemoveAllPermissions(selectedRole.id)}>Remove All</Button>
          <Button variant="primary" onClick={handleSavePermissions}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;
