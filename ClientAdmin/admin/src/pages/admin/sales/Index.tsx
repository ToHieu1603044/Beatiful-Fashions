import React, { useEffect, useState } from 'react';
import {
    Table, Tag, Image, Collapse, Typography, Button,
    Modal, Form, Input, DatePicker, message, Upload, Select,
    InputNumber
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { updateSales } from '../../../services/discountsService';

const { Panel } = Collapse;
const { Text } = Typography;
const { Option } = Select;

interface Product {
    id: number;
    name: string;
    pivot: {
        discount_price: number;
    };
}

interface FlashSale {
    id: number;
    name: string;
    image: string | null;
    start_time: string;
    end_time: string;
    status: string;
    products: Product[];
}

const Index = () => {
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentEditSale, setCurrentEditSale] = useState<FlashSale | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [form] = Form.useForm();
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const fetchSales = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/sales');
            setFlashSales(response.data);
            console.log("dayaba",response.data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu khuyến mãi:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleToggleStatus = async (id: number) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/sales/${id}/toggle-status`);
            const updatedSales = flashSales.map((sale) =>
                sale.id === id ? { ...sale, status: sale.status === 'active' ? 'inactive' : 'active' } : sale
            );
            setFlashSales(updatedSales);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        }
    };

    const handleDeleteSale = async (id: number) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/api/sales/${id}`);
            if (response.status === 200) {
                setFlashSales(flashSales.filter(sale => sale.id !== id));
                message.success("Xóa thành công");
            }
        } catch (error) {
            console.error('Lỗi khi xóa khuyến mãi:', error);
        }
    };

    const handleEdit = (sale: FlashSale) => {
        setCurrentEditSale(sale);
    
        const formattedProducts = sale.products.map(p => ({
            product_id: p.id,
            discount_price: p.pivot?.discount_price || 0
        }));
    
        form.setFieldsValue({
            name: sale.name,
            start_time: dayjs(sale.start_time),
            end_time: dayjs(sale.end_time),
            status: sale.status,
            products: formattedProducts,
        });
    
        setIsModalVisible(true);
    };
    
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/flash-sales/products');
                const productList = Object.entries(response.data).map(([id, name]) => ({ id: parseInt(id), name }));
                setProducts(productList);
                console.log("productList",productList);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('start_time', values.start_time.format('YYYY-MM-DD HH:mm:ss'));
            formData.append('end_time', values.end_time.format('YYYY-MM-DD HH:mm:ss'));
            formData.append('status', values.status);
            if (image) formData.append('image', image);

           await updateSales(currentEditSale.id, values);
            console.log("values",formData);
            message.success("Cập nhật thành công");
            setIsModalVisible(false);
            setCurrentEditSale(null);
            setImage(null);
            fetchSales();
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            message.error("Có lỗi xảy ra khi cập nhật.");
        }
    };

    const columns = [
        {
            title: 'Tên chương trình',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (img: string | null) =>
                img ? (
                    <Image width={80} src={`http://127.0.0.1:8000/storage/${img}`} />
                ) : (
                    <Text type="secondary">Không có ảnh</Text>
                ),
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'start_time',
            key: 'start_time',
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'end_time',
            key: 'end_time',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_: any, record: FlashSale) => (
                <Button
                    type={record.status === 'active' ? 'default' : 'primary'}
                    danger={record.status === 'active'}
                    onClick={() => handleToggleStatus(record.id)}
                >
                    {record.status === 'active' ? 'Tắt' : 'Bật'}
                </Button>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'products',
            render: (_: any, record: FlashSale) => (
                <Collapse ghost>
                    <Panel header={`Xem (${record.products.length}) sản phẩm`} key={record.id}>
                        {record.products.length === 0 ? (
                            <Text type="secondary">Không có sản phẩm</Text>
                        ) : (
                            <ul style={{ paddingLeft: 20 }}>
                                {record.products.map((p) => (
                                    <li key={p.id}>
                                        <Text strong>{p.name}</Text>
                                        <Text type="secondary">-{p.discount_price} đ</Text>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </Collapse>
            ),
        },
        {
            title: "Hành động",
            key: "actions",
            render: (_: any, record: FlashSale) => (
                <>
                    <Button className='me-2' type="default" onClick={() => handleEdit(record)}>Sửa</Button>
                    <Button danger onClick={() => handleDeleteSale(record.id)}>Xóa</Button>
                </>
            ),
        }
    ];

    return (
        <div className="container" style={{ padding: 20 }}>
            <h2>Danh sách chương trình Flash Sale</h2>
            <Button className='mt-3 mb-3' type="primary" href="/admin/sales">Thêm Flash Sale</Button>

            <Table
                columns={columns}
                dataSource={flashSales}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                bordered
            />

            <Modal
                title="Chỉnh sửa Flash Sale"
                open={isModalVisible}
                onOk={handleUpdate}
                onCancel={() => setIsModalVisible(false)}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên Flash Sale"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian bắt đầu"
                        name="start_time"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>

                    <Form.Item label="Ảnh">
                        <Upload
                            beforeUpload={(file) => {
                                setImage(file);
                                return false;
                            }}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                        </Upload>
                        {image && (
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                style={{ width: 100, marginTop: 10 }}
                            />
                        )}
                    </Form.Item>

                    <Form.Item
                        label="Thời gian kết thúc"
                        name="end_time"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select>
                            <Option value="active">Đang diễn ra</Option>
                            <Option value="inactive">Ngừng</Option>
                        </Select>
                    </Form.Item>
                    <Form.List name="products">
    {(fields, { add, remove }) => (
        <>
            {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <Form.Item
                        {...restField}
                        name={[name, 'product_id']}
                        rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        style={{ flex: 2 }}
                    >
                        <Select placeholder="Chọn sản phẩm">
                            {products.map((product) => (
                                <Option key={product.id} value={product.id}>
                                    {product.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        {...restField}
                        name={[name, 'discount_price']}
                        rules={[{ required: true, message: 'Nhập giá giảm' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                        Xóa
                    </Button>
                </div>
            ))}
            <Button type="dashed" onClick={() => add()} block>
                + Thêm sản phẩm
            </Button>
        </>
    )}
</Form.List>

                </Form>
            </Modal>
        </div>
    );
};

export default Index;
