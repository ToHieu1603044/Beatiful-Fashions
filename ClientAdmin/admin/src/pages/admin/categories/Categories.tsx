import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Modal, Input } from "antd";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../../../services/categoryService";
import CategoriesAdd from "./CategoriesAdd";


type CategoryType = {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  parent_id?: number | null;
  children: CategoryType[];
  created_at?: string;
  updated_at?: string;
};

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false); // Show category detail modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal for adding new category

  const handleShowCategoryModal = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  const hideModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ search: searchTerm });
      setCategories(response.data);
    } catch (error) {
      if(error.response.status === 401){
        navigate("/login");
      }
      if(error.response.status === 403){
        navigate("/403");
      }
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return "Không có danh mục cha ";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Không có danh mục cha ";
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      message.error("Không thể xóa danh mục. Vui lòng thử lại.");
    }
  };

  // Hàm này trả về dữ liệu phù hợp cho Ant Design Table
  const renderCategories = (categories: CategoryType[], level: number = 0): any[] => {
    return categories.flatMap((category) => [
      {
        key: category.id,
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image || "https://placehold.co/50x50",
        parent_id: category.parent_id,
        children: category.children,
        actions: (
          <div>
            <Button icon={<BsEye />} onClick={() => handleShowCategoryModal(category)} size="small" />
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa danh mục này?"
              onConfirm={() => handleDelete(category.id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button icon={<BsTrash />} type="danger" size="small" />
            </Popconfirm>
            <Button icon={<BsPencilSquare />} onClick={() => navigate(`/admin/categories/${category.id}/edit`)} size="small" />
          </div>
        ),
        level: level, // Gán cấp độ cho mỗi danh mục
      },
      ...renderCategories(category.children, level + 1), // Lặp đệ quy cho danh mục con và tăng cấp lùi
    ]);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Tên",
      dataIndex: "name",
      render: (text: string, record: CategoryType) => (
        <div style={{ marginLeft: record.level * 20 }}>{text}</div> // Lùi tên danh mục con
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      render: (image: string) => <img src={image || "https://placehold.co/50x50"} alt="Hình ảnh" width={50} height={50} />,
    },
    {
      title: "Danh mục cha",
      dataIndex: "parent_id",
      render: (parentId: number) => getParentName(parentId),
    },
    {
      title: "Hành động",
      render: (text: any, record: CategoryType) => record.actions,
    },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Danh sách Danh Mục</h2>
        <Button type="primary" className="ms-3" onClick={showModal}>
          Thêm mới
        </Button>
      </div>

      <div className="mb-3">
        <Input
          type="text"
          className="form-control"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={renderCategories(categories)} // Dữ liệu truyền vào Table
        rowKey="id"
        loading={loading}
        pagination={true}
      
        childrenColumnName="children"
      />

      <CategoriesAdd visible={isModalVisible} onClose={hideModal} /> 

      {selectedCategory && (
        <Modal
          title="Chi tiết danh mục"
          visible={showCategoryModal}
          onCancel={handleCloseCategoryModal}
          footer={<Button onClick={handleCloseCategoryModal}>Đóng</Button>}
        >
          <p><strong>ID:</strong> {selectedCategory.id}</p>
          <p><strong>Tên:</strong> {selectedCategory.name}</p>
          <p><strong>Slug:</strong> {selectedCategory.slug}</p>
          <p><strong>Danh mục cha:</strong> {getParentName(selectedCategory.parent_id || null)}</p>
          <p><strong>Hình ảnh:</strong></p>
          <img
            src={selectedCategory.image || "https://placehold.co/100x100"}
            alt={selectedCategory.name}
            className="rounded mt-2"
            width={100}
            height={100}
          />
        </Modal>
      )}
    </div>
  );
};

export default Categories;
