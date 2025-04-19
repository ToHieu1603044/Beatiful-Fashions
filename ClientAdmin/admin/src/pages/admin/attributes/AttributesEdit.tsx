import { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { Form, Input, Button, Spin, Alert, message, Card, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const AttributesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const handleUpdate = outletContext?.handleUpdate || (() => {});
  const [attribute, setAttribute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [form] = Form.useForm();

  useEffect(() => {
    if (!id) {
      setErrorMessage("ID không hợp lệ!");
      setLoading(false);
      return;
    }

    axios.get(`http://127.0.0.1:8000/api/attributes/${id}`)
      .then((response) => {
        if (response.data) {
          setAttribute(response.data);

          const options = response.data.values?.map(v => v.value) || [];

          form.setFieldsValue({
            name: response.data.name,
            values: options
          });
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
  }, [id, form]);

  const handleSubmit = async (values) => {
    if (!attribute) return;

    try {
      const updatedAttribute = {
        name: values.name,
        options: values.values || [],
      };
      console.log("updatedAttribute", updatedAttribute);
      
      const response = await axios.put(`http://127.0.0.1:8000/api/attributes/${id}`, updatedAttribute);
      if (response.status== 200) {
        message.success("Cập nhật thành cong");
      }
      if (typeof handleUpdate === "function") {
        handleUpdate(updatedAttribute);
      }

      message.success("Cập nhật thành công!");
      
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      message.error("Lỗi khi cập nhật dữ liệu!");
    }
  };

  if (loading) {
    return <Spin tip="Đang tải..." style={{ display: "flex", justifyContent: "center", marginTop: 50 }} />;
  }

  if (errorMessage) {
    return <Alert message={errorMessage} type="error" showIcon style={{ maxWidth: 500, margin: "2rem auto" }} />;
  }

  return (
    <Card title="Chỉnh Sửa Thuộc Tính" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên thuộc tính"
          name="name"
          rules={[{ required: true, message: "Tên không được để trống!" }]}
        >
          <Input placeholder="Nhập tên thuộc tính" />
        </Form.Item>

        <Form.List name="values">
          {(fields, { add, remove }) => (
            <>
              <label>Giá trị (options)</label>
              {fields.map((field, index) => (
                <Space key={field.key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...field}
                    name={[field.name]}
                    rules={[{ required: true, message: "Không được để trống" }]}
                  >
                    <Input placeholder={`Option ${index + 1}`} />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Thêm giá trị
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AttributesEdit;
