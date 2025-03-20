import React, { useEffect, useState } from 'react';
import { getDiscounts } from '../../../services/discountsService';
import { Table, Spin, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Card } from "antd";
import moment from 'moment';
import { createDiscount } from '../../../services/discountsService';

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const columns = [
        {
            title: "Tên mã",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Code",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Discount Type",
            dataIndex: "discount_type",
            key: "discount_type",
        },
        {
            title: "Value",
            dataIndex: "value",
            key: "value",
            render: (value, record) => {
                return record.discount_type === "percentage" ? `${value}%` : `${value} VNĐ`;
            },
        },
        {
            title: "Max Discount",
            dataIndex: "max_discount",
            key: "max_discount",
            render: (value) => `${value} VNĐ`,
        },
        {
            title: "Min Order Amount",
            dataIndex: "min_order_amount",
            key: "min_order_amount",
            render: (value) => `${value} VNĐ`,
        },
        {
            title: "Active",
            dataIndex: "active",
            key: "active",
            render: (active) => (active ? "Yes" : "No"),
        },
    ];

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        try {
            const response = await getDiscounts();
            if (Array.isArray(response.data.data)) {
                setDiscounts(response.data.data);
            } else {
                console.error("Expected an array of discounts, but got:", response.data.data);
                setDiscounts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching discounts:", error);
            setDiscounts([]);
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleOk = async () => {
        try {
            const data = await form.validateFields();

            const response = await createDiscount(data);

            if (response.status == 201) {
                message.success("Mã giảm giá đã được tạo thành công!");
                fetchDiscounts();
                setIsModalVisible(false);
            } else {
                message.error(response.message || "Lỗi khi tạo mã giảm giá.");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi tạo mã giảm giá.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 className="text-center pt-5">Danh sách Mã Giảm Giá</h1>
            
            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <Button type="primary" onClick={showModal}>Thêm Mã Giảm Giá +</Button>
            </div>

            {loading ? (
                <Spin size="large" />
            ) : (
                <Card style={{ padding: '10px' }}>
                    <Table
                        columns={columns}
                        dataSource={discounts}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            )}

            {/* Modal to add a discount */}
            <Modal
                title="Tạo Mã Giảm Giá"
                visible={isModalVisible}
                onCancel={handleCancel}
                onOk={handleOk}
                okText="Lưu"
                cancelText="Hủy"
                width={600} // Custom modal width to make it more compact
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Tên Mã Giảm Giá" name="name" rules={[{ required: true, message: 'Tên mã giảm giá không được để trống!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Code" name="code" rules={[{ required: true, message: 'Code mã giảm giá không được để trống!' }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item label="Loại Giảm Giá" name="discount_type" rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}>
                        <Select>
                            <Select.Option value="percentage">Phần trăm</Select.Option>
                            <Select.Option value="fixed">Cố định</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Giá trị" name="value" rules={[{ required: true, message: 'Giá trị không được để trống!' }]}>
                        <InputNumber min={1} max={100} />
                    </Form.Item>

                    <Form.Item label="Giảm Tối Đa" name="max_discount">
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item label="Số Tiền Đơn Hàng Tối Thiểu" name="min_order_amount">
                        <InputNumber min={0} />
                    </Form.Item>

                    <Form.Item label="Ngày Bắt Đầu" name="start_date" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Ngày Kết Thúc" name="end_date" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Số Lượng Sử Dụng Tối Đa" name="max_uses">
                        <InputNumber min={1} />
                    </Form.Item>

                    <Form.Item label="Là Mã Toàn Quốc?" name="is_global" valuePropName="checked">
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Cần Ranking Tối Thiểu" name="required_ranking">
                        <InputNumber min={1} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Discount;
