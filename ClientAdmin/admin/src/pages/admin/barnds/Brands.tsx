// import { AxiosError } from "axios";
// import { useEffect, useState } from "react";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { deleteBrands, getBrands } from '../../../services/brandsService';

// type BrandsType = {
//     id: number;
//     name: string;
//     status: string;
//     children: BrandsType[];
//     created_at: string;
//     updated_at: string;


// }
// const Brands = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const isRootBrands = location.pathname === "/admin/brands";

//     const [brands, setBrands] = useState<BrandsType[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedBrands, setSelectedBrands] = useState<BrandsType | null>(null);
//     const [showModal, setShowModal] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");

//     useEffect(() => {
//         fetchBrands();
//     }, [searchTerm]);

//     const fetchBrands = async () => {
//         try {

//             const response = await getBrands({ name: searchTerm });

//             console.log("Dữ liệu ---:", response.data);
//             setBrands(response.data.data);
//         } catch (error) {
//             console.error("Lỗi khi lấy danh mục:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async (id: number) => {
//         if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;

//         try {
//             await deleteBrands(id);
//             alert("Xóa danh mục thành công!");
//             fetchBrands();
//         } catch (error) {
//             const axiosError = error as AxiosError<{ message: string }>;
//             console.error("Lỗi khi xóa danh mục:", axiosError);
//             alert("Không thể xóa danh mục. Vui lòng thử lại.");
//         }
//     };
//     const handleShowModal = (brands: BrandsType) => {
//         setSelectedBrands(brands);
//         setShowModal(true);
//     };

//     const handleCloseModal = () => {
//         setShowModal(false);
//         setSelectedBrands(null);
//     };

//     return (
//         <div className="container mt-4">
//             {isRootBrands && (
//                 <>
//                     <div className="d-flex align-items-center mb-3">
//                         <h2 className="mb-0">Danh sách Brands</h2>
//                         <button className="btn btn-success ms-3" onClick={() => navigate("/admin/brands/create")}>
//                             Thêm mới

//                         </button>
//                     </div>

//                     <div className="mb-3">
//                         <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Tìm kiếm danh muc..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>

//                     <div className="table-responsive">
//                         <table className="table table-bordered table-striped">
//                             <thead className="table-dark">
//                                 <tr>
//                                     <th>ID</th>
//                                     <th>Tên</th>
//                                     <th>Status</th>
//                                     <th>Ngày tạo</th>
//                                     <th>Ngày cập nhật</th>
//                                     <th>Thao tác</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {brands.map((brand) => (
//                                     <tr key={brand.id}>
//                                         <td>{brand.id}</td>
//                                         <td>{brand.name}</td>
//                                         <td>{brand.status ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
//                                         <td>{brand.created_at}</td>
//                                         <td>{brand.updated_at}</td>
//                                         <td>
//                                             <button className="btn btn-warning" onClick={() => handleShowModal(brand)}>
//                                                 Xem
//                                             </button>
//                                             <button className="btn btn-danger ms-2" onClick={() => handleDelete(brand.id)}>
//                                                 Xóa
//                                             </button>
//                                             <button className="btn btn-info ms-2" onClick={() => navigate(`/admin/brands/${brand.id}/edit`)}>
//                                                 Sửa
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>

//                         </table>
//                     </div>
//                 </>
//             )}

//             {selectedBrands && (
//                 <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
//                     <div className="modal-dialog">
//                         <div className="modal-content">
//                             <div className="modal-header">
//                                 <h5 className="modal-title">Chi tiết danh mục</h5>
//                                 <button type="button" className="btn-close" onClick={handleCloseModal}></button>
//                             </div>
//                             <div className="modal-body">
//                                 <p><strong>ID:</strong> {selectedBrands.id}</p>
//                                 <p><strong>Tên:</strong> {selectedBrands.name}</p>
//                                 <p><strong>Status:</strong> {selectedBrands.status}</p>
//                             </div>
//                             <div className="modal-footer">
//                                 <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <Outlet />
//         </div>
//     )
// }

// export default Brands




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
  deleteBrands,
  getBrands,
  // createBrands,
  // updateBrands,
} from "../../../services/brandsService";

const { Option } = Select;

type BrandsType = {
  id: number;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

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
          await deleteBrands(id);
          message.success("Đã xóa thương hiệu thành công");
          fetchBrands();
        } catch {
          message.error("Xóa không thành công");
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
        await createBrands(values);
        message.success("Thêm thương hiệu thành công");
      } else if (formMode === "edit" && selectedBrand) {
        await updateBrands(selectedBrand.id, values);
        message.success("Cập nhật thương hiệu thành công");
      }

      setEditModalVisible(false);
      fetchBrands();
    } catch (error) {
      message.error("Có lỗi xảy ra. Vui lòng thử lại.");
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
        status === 1 ? (
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
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="inactive">Ngừng hoạt động</Select.Option>
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
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Outlet />
    </div>
  );
};

export default Brands;
