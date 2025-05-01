import React, { useEffect, useState } from "react";
import { Modal, Table, Select, Button, Descriptions, Divider, Typography, Card, Row, Col } from "antd";

const { Title, Text } = Typography;

const OrderDetailModal = ({ order, visible, onClose, status, setStatus, onConfirmOrder, confirmOrder }) => {
  const [disabledStatuses, setDisabledStatuses] = useState([]);

  useEffect(() => {
    // Hàm cập nhật trạng thái hợp lệ dựa trên trạng thái hiện tại
    const getNextStates = (currentState) => {
      switch (currentState) {
        case "pending":
          return ["processing", "canceled"];  // "pending" sẽ bị khóa khi đang ở trạng thái "processing"
        case "processing":
          return ["shipped"];  // "processing" sẽ chuyển sang "shipped"
        case "shipped":
          return ["delivered"];  // "shipped" sẽ chuyển sang "delivered"
        case "delivered":
          return ["completed"];  // "delivered" sẽ chuyển sang "completed"
        default:
          return [];
      }
    };

    // Cập nhật trạng thái bị vô hiệu hóa
    const disabled = getNextStates(status);
    setDisabledStatuses(disabled);

  }, [status]);

  if (!order) return null;

  return (
    <Modal
      title={<Title level={4}>Chi tiết đơn hàng #{order.id}</Title>}
      open={visible}
      onCancel={onClose}
      width={1100}
      footer={null}
    >
      <Row gutter={16}>
        {/* Cột trái (9) */}
        <Col span={18}>
          {/* Danh sách sản phẩm */}
          <Title level={5}>Sản phẩm trong đơn hàng</Title>
          <Table
            dataSource={order.orderdetails}
            rowKey="id"
            pagination={false}
            bordered
            columns={[
              {
                title: "Id",
                dataIndex: "product_id",
                key: "product_id",
              },
              { title: "Tên sản phẩm", dataIndex: "product_name", key: "product_name" },
              {
                title: "Biến thể",
                key: "variants",
                render: (item) =>
                  item.variant_details
                    ? Object.entries(item.variant_details)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(", ")
                    : "Không có biến thể",
              },
             
              { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
              {
                title: "Giá",
                dataIndex: "price",
                key: "price",
                render: (price) => price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
              },


              {
                title: "Tổng cộng",
                key: "total",
                render: (item) =>
                  (item.quantity * item.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
              },
            ]}
          />

          <Divider />

          {/* Order Summary */}
          <Title level={5}>Order Summary</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tổng tiền">
              <Text type="danger" strong>
                {order.total_amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền giảm">
              <Text type="danger" strong>
                {order.discount_amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              <Text strong>{order.payment_method.toUpperCase()}</Text>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Cập nhật trạng thái đơn hàng */}
          <Title level={5}>Cập nhật trạng thái đơn hàng</Title>
          {/* <Select value={status} onChange={setStatus} className="w-full">
            <Select.Option value="pending" disabled={disabledStatuses.includes("pending")}>Chờ xử lý</Select.Option>
            <Select.Option value="processing" disabled={disabledStatuses.includes("processing")}>Đang xử lý</Select.Option>
            <Select.Option value="shipped" disabled={disabledStatuses.includes("shipped")}>Đã gửi hàng</Select.Option>
            <Select.Option value="delivered" disabled={disabledStatuses.includes("delivered")}>Đang giao</Select.Option>
            <Select.Option value="cancelled" disabled={disabledStatuses.includes("cancelled")}>Đã hủy</Select.Option>
            <Select.Option value="completed" disabled={disabledStatuses.includes("completed")}>Giao hàng thành công</Select.Option>
          </Select> */}

          <div className="mt-3 flex gap-2">
            <Button onClick={onClose}>Đóng</Button>
            {/* <Button type="primary" onClick={onConfirmOrder}>Xác nhận đơn hàng</Button> */}
            <br />
            <br />
            {/* <Button key="confirm" type="" onClick={confirmOrder}>
              Đã nhận tiền
            </Button> */}
          </div>
        </Col>

        {/* Cột phải (3) */}
        <Col span={6}>
          {/* Notes */}
          <Card title="Ghi chú">
            <Text>{order.notes || "Không có ghi chú"}</Text>
          </Card>

          {/* Thông tin khách hàng */}
          <Card title="Thông tin khách hàng" className="mt-3">
            <p><strong>Họ tên:</strong> {order.name}</p>
            <p><strong>Email:</strong> {order.email}</p>
            <p><strong>Số điện thoại:</strong> {order.phone}</p>
            <p><strong>Địa chỉ:</strong> {order.address}, {order.ward}, {order.city}</p>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default OrderDetailModal;
