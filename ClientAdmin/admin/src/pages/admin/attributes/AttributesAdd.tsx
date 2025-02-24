import { useState } from "react";
import { TextField, Button, Box, Typography, Snackbar, Alert } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";


const getAuthToken = () => localStorage.getItem("access_token");
const AttributesAdd = () => {
  const [attribute, setAttribute] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);
  const navigate = useNavigate();
  const { handleAdd } = useOutletContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attribute.trim()) return;

    try {
      const newAttribute = { 
        name: attribute, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      const token = getAuthToken();
      const response = await axios.post("http://127.0.0.1:8000/api/attributes", newAttribute,{
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      handleAdd(response.data); 

      setAttribute("");
      setSuccessMessage(true); 

      setTimeout(() => {
        navigate("/admin/attributes");
      }, 1500);
      
    } catch (error) {
      console.error("Error adding attribute:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>Thêm Thuộc Tính</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="NAME"
          variant="outlined"
          fullWidth
          value={attribute}
          onChange={(e) => setAttribute(e.target.value)}
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
          Thêm sản phẩm thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttributesAdd;
