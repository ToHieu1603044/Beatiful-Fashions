import React, { useEffect, useState } from 'react';
import { getDiscounts } from '../../../services/discountsService';
import { Table, Spin, Button, Modal, Form, Input, InputNumber, DatePicker, Select, message, Card, Checkbox, Row, Col, Switch } from "antd";
import moment from 'moment';
import { createDiscount } from '../../../services/discountsService';
import { getProducts } from '../../../services/productService';
import axios from 'axios';
import Swal from 'sweetalert2';
interface Discount {
    id: number;
    name: string;
    code: string;
    discount_type: string;
    value: number;
    max_discount: number;
    min_order_amount: number;
    start_date: string;
    end_date: string;
    max_uses: number;
    products: { id: number; name: string }[];
    is_global: boolean;
    required_ranking: number;
    is_first_order: boolean;
    is_redeemable: boolean;
    can_be_redeemed_with_points: number;
}
const Discount = () => {

    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isRedeemable, setIsRedeemable] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    console.log("editingDiscount", editingDiscount);

    const handleEditDiscount = (record) => {
        setIsEditMode(true);
        setEditingDiscount(record.id);
        console.log("Editing Discount ID:", record.id);

        form.setFieldsValue({
            name: record.name,
            code: record.code,
            discount_type: record.discount_type,

            value: record.value,
            max_record: record.max_record,
            min_order_amount: record.min_order_amount,
            start_date: moment(record.start_date),
            end_date: moment(record.end_date),
            max_uses: record.max_uses,
            product_ids: record.products?.map(p => p.id) || [],
            is_global: Boolean(record.is_global),
            max_discount: record.max_discount,
            required_ranking: record.required_ranking,
            is_first_order: record.is_first_order,
            is_redeemable: record.is_redeemable,
            can_be_redeemed_with_points: record.can_be_redeemed_with_points,
        });

        setSelectedProducts(record.products?.map(p => p.id) || []);
        setIsRedeemable(record.is_redeemable);
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const data = await form.validateFields();
            const requestData = {
                ...data,
                product_ids: selectedProducts,
            };

            console.log("requestData", requestData);


            if (isEditMode && editingDiscount) {
                console.log("requestData", editingDiscount);
                const response = await axios.put(`http://127.0.0.1:8000/api/discounts/${editingDiscount}`, requestData);
                console.log("response", response);

                try {
                    message.success(response.data.message);
                }
                catch (error) {
                    handleApiError(error);
                    return;
                }
            } else {
                try {
                    const response = await createDiscount(requestData);
                    message.success(response.data.message);
                } catch (error) {
                    if(error.response.status == 403) {
                        window.location.href = '/403';

                    }
                    message.error(error.response.data.message);
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

            if (typeof response.data.message === 'string') {
                Swal.fire("Lỗi!", response.data.message, "error");
            }

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
                message.success(response.data.message);
                setDiscounts(prev => prev.filter(discount => discount.id !== id));
            }
        } catch (error) {
            if(error.response.status == 403) {
                window.location.href = '/403';
            }
            message.error(error.response.data.message);
        }
    }
    const handleToggleStatus = async (discounts) => {
        try {
            const newStatus = discounts.active ? 0 : 1;
            console.log("discounts", discounts.id);
            console.log("newStatus", newStatus);

            // Send the status as part of the body
            const resStatus = await axios.put(
                `http://127.0.0.1:8000/api/discounts/${discounts.id}/status`,
                { status: newStatus } // Sending status as an object
            );

            message.success(resStatus.data.message);
            fetchProducts();
            fetchDiscounts();
        } catch (error) {
            if(error.response.status == 403) {
                window.location.href = '/403';
            }
            console.error("Lỗi khi cập nhật trạng thái:", error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
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
            render: (value) => value === "percentage" ? "Phần trăm" : "Giá trị",
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
                    <Button type="primary" onClick={() => handleEditDiscount(record)}>Edit</Button>
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
            if(error.response.status == 403) {
                window.location.href = '/403';
            }
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
    const [searchKeyword, setSearchKeyword] = useState(''); // Lưu từ khóa tìm kiếm
    useEffect(() => {
        fetchProducts(searchKeyword);
    }, [searchKeyword]);

    const fetchProducts = async (search) => {
        try {
            const response = await getProducts({ search });
            if (Array.isArray(response.data.data)) {
                setProducts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    const rankingOptions = [
        { label: 'Đồng', value: "bronze" },
        { label: 'Bạc', value: "silver" },
        { label: 'Vàng', value: "gold" },
        { label: 'Bạch kim', value: "platinum" },
    ];
    const discountType = Form.useWatch('discount_type', form);
    const isGlobal = Form.useWatch('is_global', form);
    return (
        <div className="container">
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

            <Modal
                title="Mã Giảm Giá"
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
                            {discountType === 'percentage' && (
                                <Form.Item label="Giảm Tối Đa" name="max_discount">
                                    <InputNumber min={0} />
                                </Form.Item>
                            )}


                            <Form.Item label="Số Tiền Đơn Hàng Tối Thiểu" name="min_order_amount">
                                <InputNumber min={0} />
                            </Form.Item>

                            <Form.Item label="Ngày Bắt Đầu" name="start_date" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}>
                               <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                            <Form.Item label="Ngày Kết Thúc" name="end_date" rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}>
                                <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                            </Form.Item>
                        </Col>

                        {/* Cột 2 */}
                        <Col xs={24} md={12}>


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
                                    showSearch 
                                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>


                            <Form.Item label="Là Mã Toàn Quốc?" name="is_global">
                                <Select>
                                    <Select.Option value={true}>Có</Select.Option>
                                    <Select.Option value={false}>Không</Select.Option>
                                </Select>
                            </Form.Item>


                            {!isGlobal && (
                                <Form.Item label="Cần Ranking Tối Thiểu" name="required_ranking">
                                    <Select options={rankingOptions} placeholder="Chọn cấp bậc" />
                                </Form.Item>
                            )}


                            <Form.Item label="Mã cho người mới ?" name="is_first_order" valuePropName="checked">
                                <Checkbox>Người mới </Checkbox>
                            </Form.Item>
                
                            <Form.Item label="Cho phép đổi điểm?" name="is_redeemable" valuePropName="checked">
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