import React, { useState } from "react";
import { Modal, InputNumber, Button, Form, message } from "antd";
import axios from "axios"; // Import axios
import { applyPoints } from "../../services/orderService";

interface ApplyPointsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    used_points: number;
    points_discount: number;
    final_amount: number;
  }) => void;
  maxPoints: number;
}


const ApplyPointsModal: React.FC<ApplyPointsModalProps> = ({
  open,
  onClose,
  onSubmit,
  maxPoints,
}) => {
  const [form] = Form.useForm();
  
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
  
      if (values.usedPoints > maxPoints) {
        message.error("Bạn không đủ điểm!");
        return;
      }
  
      const response = await applyPoints(values);
  
      if (response.data.status) {
        const { used_points, points_discount, final_amount } = response.data;
  
        message.success("Điểm đã được áp dụng thành công!");
        onSubmit({ used_points, points_discount, final_amount });
  
        form.resetFields();
        onClose(); // đóng modal sau khi thành công
      } else {
        message.error(response.data.message || "Lỗi xảy ra khi áp dụng điểm");
      }
  
    } catch (err) {
      message.error("Đã có lỗi xảy ra, vui lòng thử lại!");
    }
  };
  

  return (
    <Modal
      title="Sử dụng điểm"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={`Nhập số điểm muốn sử dụng (Bạn có ${maxPoints} điểm)`}
          name="usedPoints"
          rules={[{ required: true, message: "Vui lòng nhập số điểm" }]}
        >
          <InputNumber
            min={0}
            max={maxPoints}
            style={{ width: "100%" }}
            placeholder="Ví dụ: 100"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ApplyPointsModal;