import React, { useEffect, useState } from 'react';
import { getDiscounts } from '../../../services/discountsService';
import { Table, Spin, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Card, Checkbox, Row, Col, Switch } from "antd";
import moment from 'moment';
import { createDiscount } from '../../../services/discountsService';
import { getProducts } from '../../../services/productService';
import axios from 'axios';
import Swal from 'sweetalert2';

const Discount = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isRedeemable, setIsRedeemable] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const handleEditDiscount = (discount) => {
        setIsEditMode(true);
        setEditingDiscount(discount);

        form.setFieldsValue({
            ...discount,
            start_date: moment(discount.start_date),
            end_date: moment(discount.end_date),
            is_redeemable: discount.is_redeemable,
            product_ids: discount.products?.map(p => p.id) || [],
        });

        setSelectedProducts(discount.products?.map(p => p.id) || []);
        setIsRedeemable(discount.is_redeemable);
        setIsModalVisible(true);
    };
    
    const handleOk = async () => {
        try {
            const data = await form.validateFields();
            const requestData = {
                ...data,
                product_ids: selectedProducts,
            };
    
            if (isEditMode && editingDiscount) {
                try {
                    const response = await axios.put(`http://127.0.0.1:8000/api/discounts/${editingDiscount.id}`, requestData);
                    message.success("Cập nhật mã giảm giá thành công!");
                } catch (error) {
                    handleApiError(error);
                    return;
                }
            } else {
                try {
                    const response = await createDiscount(requestData);
                    message.success("Tạo mã giảm giá thành công!");
                } catch (error) {
                    handleApiError(error);
                    return;
                }
            }
    
            fetchDiscounts();
            setIsModalVisible(false);
            form.resetFields();
            setEditingDiscount(null);
            setIsEditMode(false);
        } catch (error) {
            console.error("Lỗi khi lưu mã giảm giá:", error);
            Swal.fire("Lỗi!", "Có lỗi xảy ra khi lưu dữ liệu form.", "error");
        }
    };
    const handleApiError = (error: any) => {
        if (error.response) {
            const response = error.response;
    
            // Hiển thị lỗi dạng chuỗi
            if (typeof response.data.message === 'string') {
                Swal.fire("Lỗi!", response.data.message, "error");
            }
    
            // Hiển thị lỗi dạng danh sách (Laravel validation)
            else if (response.data.errors) {
                const errorList = Object.values(response.data.errors)
                    .flat()
                    .map(msg => `<li>${msg}</li>`)
                    .join("");
    
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi xác thực dữ liệu:',
                    html: `<ul style="text-align: left;">${errorList}</ul>`,
                });
            } else {
                Swal.fire("Lỗi!", "Đã xảy ra lỗi không xác định.", "error");
            }
        } else {
            Swal.fire("Lỗi!", "Không thể kết nối đến máy chủ.", "error");
        }
    };
    
    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingDiscount(null);
        setIsEditMode(false);
        form.resetFields();
    };

    const handleDeleteDiscount = async (id) => {
        const confirmDelete = confirm('Bạn có chắc chắn muốn xoá không?');
        if (!confirmDelete) return;

        try {
            const response = await axios.delete(`http://127.0.0.1:8000/api/discounts/${id}`);
            if (response.status === 200 || response.status === 204) {
                message.success('Xoá thành công!');
                setDiscounts(prev => prev.filter(discount => discount.id !== id));
            } else {
                message.error('Xoá thất bại');
            }
        } catch (error) {
            console.error('Lỗi xoá:', error);
            alert('Đã xảy ra lỗi khi xoá. Vui lòng thử lại.');
        }
    }
    const handleToggleStatus = async (discounts) => {
        try {
            const newStatus = discounts.active ? 0 : 1;
            await axios.put(`http://127.0.0.1:8000/api/discounts/${discounts.id}`, newStatus);
            message.success("Cập nhật trạng thái thành công!");
            fetchProducts();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error("Lỗi khi cập nhật trạng thái!");
        }
    };


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
            title: "Trạng thái",
            dataIndex: "active",
            key: "active",
            render: (active, record) => (
                <Switch
                    checked={active === true || active === 1}
                    onChange={() => handleToggleStatus(record)}
                />
            ),
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
                    return "Chưa bắt đầu";
                }

                if (endDate.isBefore(now)) {
                    return "Đã hết hạn";
                }

                const diff = endDate.diff(now, "days");
                return `${diff} ngày`;
            },
        },
        {

            title: "Hành động",
            key: "actions",
            render: (record: any) => (
                <Button.Group>
                    <Button type="primary">Edit</Button>
                    <Button danger onClick={() => handleDeleteDiscount(record.id)}>Delete</Button>

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
    const rankingOptions = [
        { label: 'Đồng', value: "Bronze" },
        { label: 'Bạc', value: "Silver" },
        { label: 'Vàng', value: "Gold" },
        { label: 'Bạch kim', value: "Platinum" },
    ];

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
                                <Select
                                    options={rankingOptions}
                                    placeholder="Chọn cấp bậc"
                                />
                            </Form.Item>

                            <Form.Item label="Có thể tân thủ?" name="is_first_order" valuePropName="checked">
                                <Checkbox>Cho mã tân thủ</Checkbox>
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
