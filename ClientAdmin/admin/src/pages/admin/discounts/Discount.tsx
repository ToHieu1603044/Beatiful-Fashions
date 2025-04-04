import React, { useEffect, useState } from 'react';
import { getDiscounts } from '../../../services/discountsService';
import { Table, Spin, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Card, Checkbox, Row, Col } from "antd";
import moment from 'moment';
import { createDiscount } from '../../../services/discountsService';
import { getProducts } from '../../../services/productService';

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isRedeemable, setIsRedeemable] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

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
            title: "Loại giảm giá",
            dataIndex: "discount_type",
            key: "discount_type",
        },
        {
            title: "Giá trị ",
            dataIndex: "value",
            key: "value",
            render: (value, record) => {
                return record.discount_type === "percentage" ? `${value}%` : `${value} VNĐ`;
            },
        },
        {
            title: "Giảm giá giới hạn ",
            dataIndex: "max_discount",
            key: "max_discount",
            render: (value) => `${value} VNĐ`,
        },
        {
            title: "Giá áp dụng tối thiểu ",
            dataIndex: "min_order_amount",
            key: "min_order_amount",
            render: (value) => `${value} VNĐ`,
        },
        {
            title: "Trạng thái ",
            dataIndex: "active",
            key: "active",
            render: (active) => (active ? "Kích hoạt " : "Khóa "),
        },
        {
            title: "Ngày tạo",
            dataIndex: "start_date",
            key: "start_date",
            render: (value) => moment(value).format("YYYY-MM-DD HH:mm:ss"),

        },
        {
            title: "Ngày hết hạn",
            dataIndex: "end_date",
            render: (value) => moment(value).format("YYYY-MM-DD HH:mm:ss"),

        },
        {
            title: "Còn lại",
            dataIndex: "end_date",
            render: (value, record) => {
                if (!value) return "Không có ngày hết hạn";
        
                const now = moment();
                const startDate = moment(record.start_date);
                const endDate = moment(value);
        
                if (startDate.isAfter(now)) {
                    return "Chưa bắt đầu";  // Nếu ngày bắt đầu trong tương lai
                }
        
                if (endDate.isBefore(now)) {
                    return "Đã hết hạn";  // Nếu ngày hết hạn đã qua
                }
        
                const diff = endDate.diff(now, "days");
                return `${diff} ngày`;  // Nếu còn hạn, hiển thị số ngày còn lại
            },
        },
        
        {
            title: "Hành động",
            key: "actions",
            render: (record: any) => (
                <Button.Group>
                    <Button type="primary">Edit</Button>
                    <Button danger>Delete</Button>
                </Button.Group>
            ),
        },
    ];

    useEffect(() => {
        fetchDiscounts(1);
    }, []);

    const fetchDiscounts = async (page = 1) => {
        setLoading(true);

        try {
            const response = await getDiscounts(page);
            const { data, current_page, per_page, total } = response?.data;

            if (Array.isArray(data)) {
                setDiscounts(data);
                setPagination(prev => ({
                    ...prev,
                    current: current_page,
                    pageSize: per_page,
                    total
                }));
            } else {
                console.error("Dữ liệu API không đúng định dạng:", response.data);
                setDiscounts([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách mã giảm giá:", error);
            setDiscounts([]);
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await getProducts();
            if (Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleOk = async () => {
        try {
            const data = await form.validateFields();
            console.log(data);
            const requestData = {
                ...data,
                product_ids: selectedProducts,
            };
            const response = await createDiscount(requestData);
            console.log(response);
            if (response.status == 201) {
                message.success("Mã giảm giá đã được tạo thành công!");
                fetchDiscounts();
                setIsModalVisible(false);
            } else {
                message.error(response.message || "Lỗi khi tạo mã giảm giá.");
            }
        } catch (error) {
            console.error("Error creating discount:", error);
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
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            onChange: (page) => {
                                fetchDiscounts(page);
                            },
                        }}
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
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        {/* Cột 1 */}
                        <Col xs={24} md={12}>
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

                            <Form.Item
                                label="Giá trị"
                                name="value"
                                rules={[{ required: true, message: 'Giá trị không được để trống!' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={form.getFieldValue("discount_type") === "percentage" ? 100 : 10000000} 
                                />
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
                        </Col>

                        {/* Cột 2 */}
                        <Col xs={24} md={12}>
                            <Form.Item label="Ngày Kết Thúc" name="end_date" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
                                <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>

                            <Form.Item label="Số Lượng Sử Dụng Tối Đa" name="max_uses">
                                <InputNumber min={1} />
                            </Form.Item>

                            <Form.Item label="Chọn sản phẩm áp dụng" name="product_ids">
                                <Select
                                    mode="multiple"
                                    allowClear
                                    placeholder="Chọn sản phẩm..."
                                    options={products.map(product => ({
                                        label: product.name,
                                        value: product.id
                                    }))}
                                    onChange={(values) => setSelectedProducts(values)}
                                />
                            </Form.Item>

                            <Form.Item label="Là Mã Toàn Quốc?" name="is_global">
                                <Select>
                                    <Select.Option value={true}>Có</Select.Option>
                                    <Select.Option value={false}>Không</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item label="Cần Ranking Tối Thiểu" name="required_ranking">
                                <InputNumber min={1} />
                            </Form.Item>

                            {/* 🟢 Checkbox bật/tắt "Có thể đổi bằng điểm" */}
                            <Form.Item label="Có thể đổi bằng điểm?" name="is_redeemable" valuePropName="checked">
                                <Checkbox onChange={(e) => setIsRedeemable(e.target.checked)}>Cho phép đổi điểm</Checkbox>
                            </Form.Item>

                            {isRedeemable && (
                                <Form.Item label="Số điểm cần để đổi" name="can_be_redeemed_with_points" rules={[{ required: true, message: 'Vui lòng nhập số điểm!' }]}>
                                    <InputNumber min={1} />
                                </Form.Item>
                            )}
                        </Col>
                    </Row>
                </Form>;
            </Modal>
        </div>
    );
};

export default Discount;
