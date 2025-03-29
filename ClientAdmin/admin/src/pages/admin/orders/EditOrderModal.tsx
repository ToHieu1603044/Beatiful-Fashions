import React, { useEffect, useState } from "react";
import { Modal, Button, Select, Input, Table } from "antd";
import { updateOrder } from "../../../services/orderService";
import Swal from "sweetalert2";
import axios from "axios";

const getAuthToken = () => localStorage.getItem("access_token");
const EditOrderModal = ({ order, visible, onClose }) => {
  const [formData, setFormData] = useState({
    id: "",
    product_id: "",
    status: "",
    is_paid: false,
    payment_method: "",
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    ward: "",
    note: "",

    order_details: [],
  });
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [skus, setSkus] = useState([]);

  const openSkuModal = async (product) => {
    setSelectedProduct(product);
    setIsSkuModalOpen(true);

    const token = getAuthToken();
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/product-sku/${product.product_id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      console.log("Danh sách SKU nhận được:", response.data);
      setSkus(response.data.message);

    } catch (error) {
      console.error("Lỗi khi lấy SKU:", error);
      setSkus([]);
    }
  };
  useEffect(() => {
    console.log("Order:", order);
    if (order) {
      setFormData({
        id: order.id || "",
        product_id: order.product_id || "",
        status: order.status || "",
        is_paid: order.is_paid || false,
        payment_method: order.payment_method || "",
        name: order.name || "",
        phone: order.phone || "",
        email: order.email || "",
        city: order.city || "",
        district: order.district || "",
        ward: order.ward || "",
        note: order.note || "",
        order_details: order.orderdetails || [],
      });
    }
  }, [order]);
  const [attributes, setAttributes] = useState([]);


  useEffect(() => {
    const fetchAttributes = async () => {
      const token = getAuthToken();
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/attributes", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("Dữ liệu attributes từ API0--:", response.data);
        setAttributes(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu attributes:", error);
      }
    };

    fetchAttributes();
  }, []);
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleUpdateOrder = async () => {
    try {
      await updateOrder(order.id, formData);
      Swal.fire("Thành công!", "Cập nhật đơn hàng thành công.", "success");

      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật đơn hàng:", error);
      Swal.fire("Lỗi!", "Không thể cập nhật đơn hàng.", "error");
    }
  };

  return (
    <Modal
      title={`Chỉnh sửa đơn hàng #${order?.id}`}
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Đóng
        </Button>,
        <Button key="update" type="primary" onClick={handleUpdateOrder}>
          Cập nhật đơn hàng
        </Button>,
      ]}
    >
      <div>
        <h6>Thông tin khách hàng:</h6>
        <Input
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Tên khách hàng"
        />
        <Input
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          placeholder="Số điện thoại"
        />
        <Input
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="Email"
        />

        <h6>Địa chỉ giao hàng:</h6>
        <Input
          value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          placeholder="Thành phố"
        />
        <Input
          value={formData.district}
          onChange={(e) => handleInputChange("district", e.target.value)}
          placeholder="Quận/Huyện"
        />
        <Input
          value={formData.ward}
          onChange={(e) => handleInputChange("ward", e.target.value)}
          placeholder="Phường/Xã"
        />
        <Input
          value={order.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          placeholder="Địa chỉ "
        />

        <h6>Ghi chú:</h6>
        <Input.TextArea
          value={order.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
        />

        <h6>Trạng thái đơn hàng:</h6>
        <Select
          value={formData.status}
          onChange={(value) => handleInputChange("status", value)}
          className="w-100"
        >
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="processing">Đang xử lý</Select.Option>
          <Select.Option value="shipped">Đã gửi</Select.Option>
          <Select.Option value="delivered">Đã giao</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
          <Select.Option value="completed">Giao hàng thành công</Select.Option>
        </Select>

        <h6>Phương thức thanh toán:</h6>
        <Select
          value={formData.payment_method}
          onChange={(value) => handleInputChange("payment_method", value)}
          className="w-100"
        >
          <Select.Option value="cod">Thanh toán khi nhận hàng</Select.Option>
          <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
          <Select.Option value="momo">Ví Momo</Select.Option>
        </Select>

        <h6>Đã thanh toán:</h6>
        <Select
          value={formData.is_paid}
          onChange={(value) => handleInputChange("is_paid", value)}
          className="w-100"
        >
          <Select.Option value={true}>Đã thanh toán</Select.Option>
          <Select.Option value={false}>Chưa thanh toán</Select.Option>
        </Select>

        <h6>Danh sách sản phẩm:</h6>
        <Table
          dataSource={formData.order_details}
          rowKey="id"
          columns={[
            {
              title: "Tên sản phẩm",
              dataIndex: "product_name",
              key: "product_name",
            },
            {
              title: "Product ID",
              dataIndex: "product_id",
              key: "product_id",
              render: (product_id, record) => {
                console.log("Dữ liệu từng dòng trong Table:", record);
                return product_id || "Không có";
              },
            }
            ,
            {
              title: "SKU",
              dataIndex: "sku",
              render: (sku, record) => (
                <Button onClick={() => openSkuModal(record)}>Edit</Button>
              )
            }
            ,
            {
              title: "Biến thể",
              key: "variants",
              render: (item, record) => (
                <Select
                  disabled
                  mode="multiple"
                  value={Object.keys(record.variant_details || {}).map(
                    (key) => `${key}: ${record.variant_details[key]}`
                  )}
                  onChange={(values) => {
                    const updatedVariants = values.reduce((acc, curr) => {
                      const [key, value] = curr.split(": ");
                      acc[key] = value;
                      return acc;
                    }, {});

                    const updatedOrderDetails = formData.order_details.map((od) =>
                      od.id === record.id ? { ...od, variant_details: updatedVariants } : od
                    );

                    setFormData({ ...formData, order_details: updatedOrderDetails });
                  }}
                  className="w-100"
                >
                  {attributes.flatMap((attribute) =>
                    attribute.values?.map((value) => (
                      <Select.Option
                        key={`${attribute.name}: ${value.value}`}
                        value={`${attribute.name}: ${value.value}`}
                      >
                        {attribute.name}: {value.value}
                      </Select.Option>
                    ))
                  )}
                </Select>

              ),
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              render: (quantity, record) => (
                <Input
          
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => {
                    const updatedOrderDetails = formData.order_details.map((od) =>
                      od.id === record.id ? { ...od, quantity: Number(e.target.value) } : od
                    );

                    setFormData({ ...formData, order_details: updatedOrderDetails });
                  }}
                />
              ),
            },
            {
              title: "Giá",
              dataIndex: "price",
              key: "price",
              render: (price) =>
                price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
            },
            {
              title: "Tổng cộng",
              key: "total",
              render: (item) =>
                (item.quantity * item.price).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }),
            },
          ]}
        />
      </div>
      <Modal
        title={`Chọn SKU cho ${selectedProduct?.name}`}
        open={isSkuModalOpen}
        onCancel={() => setIsSkuModalOpen(false)}
        footer={null}
      >
        <Select
          className="w-100"
          value={selectedProduct?.sku}
          onChange={(value) => {
            // Tìm SKU được chọn trong danh sách skus
            const selectedSku = skus.find((s) => s.sku === value);

            if (!selectedSku) return;

            // Lấy danh sách biến thể từ attributes của SKU
            const updatedVariants = selectedSku.attributes.reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {});

            // Cập nhật order_details
            const updatedOrderDetails = formData.order_details.map((item) =>
              item.id === selectedProduct.id // Tìm sản phẩm theo ID
                ? {
                  ...item,
                  sku: selectedSku.sku,
                  variant_details: updatedVariants,
                  price: selectedSku.price, // Cập nhật giá theo SKU mới
                  subtotal: selectedSku.price * item.quantity, // Cập nhật tổng tiền
                }
                : item
            );

            setFormData({ ...formData, order_details: updatedOrderDetails });

            setIsSkuModalOpen(false); // Đóng modal sau khi chọn SKU
          }}
        >
          {skus &&
            Array.isArray(skus) &&
            skus.map((s) => (
              <Select.Option key={s.id} value={s.sku}>
                {s.sku} - {s.price.toLocaleString("vi-VN")} VND
              </Select.Option>
            ))}
        </Select>
      </Modal>

    </Modal>
  );
};

export default EditOrderModal;
