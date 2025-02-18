import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { TextField, Button, Box, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import axios from "axios";

const AttributesEdit = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const handleUpdate = outletContext?.handleUpdate || (() => {}); // Tránh lỗi nếu không có handleUpdate
  const [attributes, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (!id) {
      setErrorMessage("ID không hợp lệ!");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:3000/data/${id}`)
      .then((response) => {
        console.log("Fetched data:", response.data);
        if (response.data) {
          setAttribute(response.data);
        } else {
          setErrorMessage("Không tìm thấy dữ liệu!");
        }
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu:", error);
        setErrorMessage("Lỗi khi tải dữ liệu từ API!");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attributes || !attributes.name.trim()) {
      setErrorMessage("Tên không được để trống!");
      return;
    }

    try {
      const updatedAttribute = {
        ...attributes,
        updated_at: new Date().toISOString(),
      };

      await axios.put(`http://localhost:3000/data/${id}`, updatedAttribute);
      
      if (typeof handleUpdate === "function") {
        handleUpdate(updatedAttribute); // Gọi để cập nhật danh sách
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/admin/attributes"); // Quay về danh sách sau khi cập nhật
      }, 1500);
      
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setErrorMessage("Lỗi khi cập nhật dữ liệu!");
    }
  };

  // Nếu đang tải dữ liệu, hiển thị loading
  if (loading) {
    return <Box sx={{ textAlign: "center", mt: 4 }}><CircularProgress /></Box>;
  }

  // Nếu có lỗi, hiển thị thông báo lỗi
  if (errorMessage) {
    return <Typography variant="h6" color="error" align="center">{errorMessage}</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Chỉnh Sửa Thuộc Tính</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="NAME"
          variant="outlined"
          fullWidth
          value={attributes?.name || ""}
          onChange={(e) => setAttribute({ ...attributes, name: e.target.value })}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Cập nhật
        </Button>
      </form>

      {/* Thông báo thành công */}
      <Snackbar open={successMessage} autoHideDuration={1500} onClose={() => setSuccessMessage(false)}>
        <Alert severity="success" onClose={() => setSuccessMessage(false)}>
          Cập nhật thành công!
        </Alert>
      </Snackbar>

      {/* Thông báo lỗi */}
      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage("")}>
        <Alert severity="error" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttributesEdit;
