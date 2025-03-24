import { useState } from "react";
import { TextField, Button, Box, Typography, Snackbar, Alert } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import { MuiChipsInput } from "mui-chips-input"; // Import tag input
import axios from "axios";

const getAuthToken = () => localStorage.getItem("access_token");

const AttributesAdd = () => {
  const [attribute, setAttribute] = useState("");
  const [options, setOptions] = useState([]); // Lưu danh sách options
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const { handleAdd } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attribute.trim()) return;

    try {
      const newAttribute = {
        name: attribute,
        options, // Gửi luôn danh sách options
      };

      const token = getAuthToken();
      const response = await axios.post("http://127.0.0.1:8000/api/attributes", newAttribute, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      handleAdd(response.data);
      setAttribute("");
      setOptions([]); // Reset options sau khi thêm thành công
      setSuccessMessage(true);
    } catch (error) {
      console.error("Lỗi khi thêm thuộc tính:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Thêm Thuộc Tính</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tên Thuộc Tính"
          variant="outlined"
          fullWidth
          value={attribute}
          onChange={(e) => setAttribute(e.target.value)}
          sx={{ mb: 2 }}
        />

        <MuiChipsInput
          label="Options"
          value={options}
          onChange={setOptions} // Tự động cập nhật danh sách options
          sx={{ mb: 2 }}
        />

        <Button type="submit" variant="contained" color="primary" fullWidth>
          Thêm
        </Button>
      </form>

      {/* Thông báo thêm thành công */}
      <Snackbar
        open={successMessage}
        autoHideDuration={1500}
        onClose={() => setSuccessMessage(false)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(false)}>
          Thêm thuộc tính thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttributesAdd;
