
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  Input,
  Button,
  Modal,
  Space,
  Tag,
  message,
  Descriptions,
  Form,
  Select,
} from "antd";
import {
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  createBrand,
  deleteBrands,
  getBrands,
  updateBrand,
  // createBrands,
  // updateBrands,
} from "../../../services/brandsService";
const { Option } = Select;

type BrandsType = {
    id: number;
    name: string;
    status: string;
    children: BrandsType[];
    created_at: string;
    updated_at: string;

}
const Brands = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isRootBrands = location.pathname === "/admin/brands";

  const [brands, setBrands] = useState<BrandsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string>("active");
  const [selectedBrand, setSelectedBrand] = useState<BrandsType | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);


  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const [form] = Form.useForm();

  useEffect(() => {
    fetchBrands();
  }, [searchTerm]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await getBrands({ name: searchTerm });
      setBrands(response.data.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách thương hiệu");
      if (error.response?.status === 403) {
        navigate("/403");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa thương hiệu này?",
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
        const response =  await deleteBrands(id);
          message.success(response.data.message);
          fetchBrands();
        } catch(error) {
          console.error("Lỗi khi xóa thương hiệu:", error);
          message.error(error.response.data.message);
        }
      },
    });
  };

  const handleView = (brand: BrandsType) => {
    setSelectedBrand(brand);
    setViewModalVisible(true);
  };

  const handleEdit = (brand: BrandsType) => {
    setFormMode("edit");
    form.setFieldsValue(brand);
    setSelectedBrand(brand);
    setEditModalVisible(true);
  };

  const handleCreate = () => {
    setFormMode("create");
    form.resetFields();
    setSelectedBrand(null);
    setEditModalVisible(true);
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (formMode === "create") {
     const response = await createBrand(values);
        message.success(response.data.message);
      } else if (formMode === "edit" && selectedBrand) {
       const responseUpdate = await updateBrand(selectedBrand.id, values);
        message.success(responseUpdate.data.message);
      }

      setEditModalVisible(false);
      fetchBrands();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.response.data.message);
    }
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
      title: "Trạng thái",
      dataIndex: "status",
      render: (status: string) =>

        status == 1 ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
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
      render: (_: any, record: BrandsType) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button> 

          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa

          </Button>

          <Button

            icon={<DeleteOutlined />}

            danger
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 container">
      {isRootBrands && (
        <>
          <Space className="mb-4" style={{ justifyContent: "space-between", width: "100%" }}>

            <h2>Danh sách thương hiệu</h2>

            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Thêm mới
              
            </Button>

          </Space>

          <Input.Search

            placeholder="Tìm kiếm thương hiệu..."

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

            allowClear

            enterButton="Tìm kiếm"

            className="mb-4"

          />
          <Select>
            <Select.Option value="0">Đang hoạt động</Select.Option>
            <Select.Option value="1">Ngừng hoạt động</Select.Option>
          </Select>

          <Table
            loading={loading}
            columns={columns}
            dataSource={brands}
            rowKey="id"
            bordered
          />
        </>
      )}

      {/* Modal xem chi tiết */}
      <Modal
        title="Chi tiết thương hiệu"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={<Button onClick={() => setViewModalVisible(false)}>Đóng</Button>}
      >
        {selectedBrand && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{selectedBrand.id}</Descriptions.Item>
            <Descriptions.Item label="Tên">{selectedBrand.name}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">

              {selectedBrand.status === "status" ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{selectedBrand.created_at}</Descriptions.Item>
            <Descriptions.Item label="Ngày cập nhật">{selectedBrand.updated_at}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal thêm/sửa */}
      <Modal
        title={formMode === "create" ? "Thêm thương hiệu" : "Chỉnh sửa thương hiệu"}
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleFormSubmit}
        okText={formMode === "create" ? "Thêm" : "Lưu"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên thương hiệu"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên thương hiệu" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Trạng thái"
            name="status"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="1">Đang hoạt động</Option>
              <Option value="0">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Outlet />
    </div>
  );
};

export default Brands;