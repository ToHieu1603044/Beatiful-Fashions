import React, { useState, useEffect } from "react";
import { Table, Button, Popconfirm, message, Modal, Input, Switch } from "antd";
import { BsEye, BsPencilSquare, BsTrash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { getCategories, deleteCategory, updateCategoryStatus } from "../../../services/categoryService";
import CategoriesAdd from "./CategoriesAdd";
import axios from "axios";
import DeleteButton from "../../../components/DeleteButton ";


type CategoryType = {
  id: number;
  name: string;
  slug: string;
  active: boolean;
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
      if (error.response.status === 401) {
        navigate("/login");
      }
      if (error.response.status === 403) {
        navigate("/403");
      }
      message.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    console.log("ID:", id, " New Status:", newStatus); // Log để kiểm tra giá trị

    try {
    const resStatus =  await updateCategoryStatus(id, newStatus);
      message.success(resStatus.data.message);
      fetchCategories(); // reload lại dữ liệu
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error(error.response.data.message);
    }
  };


  const getParentName = (parentId: number | null) => {
    if (!parentId) return "Không có danh mục cha ";
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Không có danh mục cha ";
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteCategory(id);
      message.success(response.data.message);

      console.log("Response:", response);

      fetchCategories();
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      message.error("Không thể xóa danh mục. Vui lòng thử lại.");
    }
  };


  const renderCategories = (categories: CategoryType[], level: number = 0): any[] => {
    return categories.flatMap((category) => [
      {
        key: category.id,
        id: category.id,
        name: category.name,
        slug: category.slug,
        active: category.active,
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
        level: level,
      },
      // ...renderCategories(category.children, level + 1), 
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
      render: (image: string) => <img src={`http://127.0.0.1:8000/storage/${image}`} alt="Hình ảnh" width={50} height={50} />,
    },
    {
      title: "Danh mục cha",
      dataIndex: "parent_id",
      render: (parentId: number) => getParentName(parentId),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      render: (active: any, record: CategoryType) => (
        <Switch
          checked={active === 1} 
          onChange={(checked) => handleToggleStatus(record.id, checked)} 
        />
      ),
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
        dataSource={renderCategories(categories)}
        rowKey="id"
        loading={loading}
        pagination={true}

        childrenColumnName="children"
      />

      <DeleteButton
        label="Đã xóa"
        navigateTo="/admin/categories/trashed"
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
