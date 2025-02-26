import axios from "axios";

const API_URL = "http://localhost:8000/api";

// Lấy token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};   //Gui token xac thuc nguoi dung xem la ai
};

// Lấy danh sách vai trò
export const getRoles = async (params?: { search?: string }) => {   // Lay ra tat ca roles //api/roles
  try {
    return await axios.get(`${API_URL}/roles`, { params, headers: getAuthHeader() });
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};

// Lấy danh sách quyền
export const getPermissions = async () => {        //api/permissions
  try {
    return await axios.get(`${API_URL}/permissions`, { headers: getAuthHeader() });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

// Lấy quyền của một vai trò
export const getRolePermissions = async (roleId: number) => {   // can truyen vao 1 id
  try {
    return await axios.get(`${API_URL}/roles/${roleId}/permissions`, { headers: getAuthHeader() });
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }
};

// Cập nhật quyền cho vai trò
export const updateRolePermissions = async (roleId: number, permissions: number[]) => {
  try {
    return await axios.post(
      `${API_URL}/roles/${roleId}/update-permissions`,
      { permissions },
      { headers: getAuthHeader() }
    );
  } catch (error) {
    console.error(`Error updating permissions for role ${roleId}:`, error);
    throw error;
  }
};

// Xóa vai trò
export const deleteRole = async (id: number) => {
  try {
    return await axios.delete(`${API_URL}/roles/${id}`, { headers: getAuthHeader() });
  } catch (error) {
    console.error(`Error deleting role ${id}:`, error);
    throw error;
  }
};

// Gán toàn bộ quyền cho vai trò
export const assignAllPermissionsToRole = async (roleId: number) => {
  try {
    return await axios.post(
      `${API_URL}/roles/${roleId}/assign-all-permissions`,
      {},
      { headers: getAuthHeader() }
    );
  } catch (error) {
    console.error(`Error assigning all permissions to role ${roleId}:`, error);
    throw error;
  }
};
export const removeAllPermissionsFromRole = async (roleId: number) => {
  return axios.post(
    `${API_URL}/roles/remove-all-permissions`,
    { role_id: roleId },
    { headers: getAuthHeader() }
  );
};
