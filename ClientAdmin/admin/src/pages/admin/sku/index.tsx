import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, InputNumber, message } from 'antd';
import { getsku } from '../../../services/productService'; // goi api get sku 

const SkuTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);  // data select
  const [modalVisible, setModalVisible] = useState(false);  //modal
  const [updatedVariants, setUpdatedVariants] = useState([]);

  useEffect(() => {
    const fetchSkuData = async () => {
      setLoading(true);
      try {
        const response = await getsku();   // Lay danh sach sku 
        setData(response.data.data);
      } catch (error) {
        console.error('Lỗi khi lấy SKU:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkuData();
  }, []);

  // Khi click "Cập nhật"
  const handleUpdateClick = (product) => {
    setSelectedProduct(product);
    setUpdatedVariants([...product.variants]); 
    setModalVisible(true);
  };

  const handleCloseModal = () => {   // dong modal
    setModalVisible(false);
    setSelectedProduct(null);
    setUpdatedVariants([]);
  };

  const handleStockChange = (value, sku_id) => {
    const newVariants = updatedVariants.map(variant =>
      variant.sku_id === sku_id ? { ...variant, stock: value } : variant
    );
    setUpdatedVariants(newVariants);
  };

  const handleSave = () => {
    // Gọi API lưu nếu muốn
    console.log('Dữ liệu lưu:', updatedVariants);
    message.success('Đã lưu');
    handleCloseModal();
  };

  // Cột bảng chính
  const columns = [   // cac cot du lieu
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleUpdateClick(record)}>
          Cập nhật
        </Button>
      ),
    },
  ];

  // Cột bảng SKU trong Modal
  const skuColumns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: price => `${price.toLocaleString()} VND`,
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.stock}
          onChange={(value) => handleStockChange(value, record.sku_id)}
        />
      ),
    },
    {
      title: 'Thuộc tính',
      key: 'attributes',
      render: (_, variant) =>
        variant.attributes?.map(attr => (
          <div key={attr.name}>
            {attr.name}: {attr.value}
          </div>
        )),
    },
  ];

  return (
    <div className="sku-table container">
      <h2>Danh sách sản phẩm</h2>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`Cập nhật tồn kho: ${selectedProduct?.name}`}
        open={modalVisible}
        onCancel={handleCloseModal}
        onOk={handleSave}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Table
          dataSource={updatedVariants}
          columns={skuColumns}
          rowKey="sku_id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default SkuTable;