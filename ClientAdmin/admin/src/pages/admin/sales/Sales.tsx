import React, { useState, useEffect } from 'react';
import { Button, DatePicker, Form, Input, Modal, Select, Table, InputNumber, Upload, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import axios from 'axios';
import moment from 'moment';
import { UploadOutlined } from '@ant-design/icons';
const { Option } = Select;

interface Product {
    id: number;
    name: string;
}

const Sales: React.FC = () => {
    const [form] = useForm();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // Danh sách sản phẩm đã chọn
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<any>(null);
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/flash-sales/products');
                const productList = Object.entries(response.data).map(([id, name]) => ({ id: parseInt(id), name }));
                setProducts(productList);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
            }
        };
        fetchProducts();
    }, []);
    useEffect(() => {
        const fetchSales = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/sales');
                console.log("data", response.data);
                setSales(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy sản phẩm:', error);
            }
        };
        fetchSales();
    }, []);

    const handleProductAdd = (productId: number, discountPrice: number, quantity: number) => {
        setSelectedProducts([
            ...selectedProducts,
            { product_id: productId, discount_price: discountPrice, quantity }
        ]);
        setShowModal(false);
    };


    const handleSubmit = async (values: any) => {
        setLoading(true);

        const flashSaleData = {
            name: values.name,
            start_time: values.start_time.format('YYYY-MM-DD HH:mm:ss'),
            end_time: values.end_time.format('YYYY-MM-DD HH:mm:ss'),
            status: values.status,
            image: image,  // Đảm bảo rằng image đã được chọn
            products: selectedProducts,
        };

        try {
            const formData = new FormData();
            formData.append('name', flashSaleData.name);
            formData.append('start_time', flashSaleData.start_time);
            formData.append('end_time', flashSaleData.end_time);
            formData.append('status', flashSaleData.status);

            // Append products data to formData
            flashSaleData.products.forEach((product: any, index: number) => {
                formData.append(`products[${index}][product_id]`, product.product_id);
                formData.append(`products[${index}][discount_price]`, product.discount_price);
                formData.append(`products[${index}][quantity]`, product.quantity);

            });

            if (image) {
                formData.append('image', image);
            }
            
         
            const response = await axios.post('http://127.0.0.1:8000/api/flash-sales', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("formData", formData);

            setLoading(false);
            Modal.success({ content: response.data.message });
        } catch (error) {
            setLoading(false);
            console.error('Lỗi khi tạo Flash Sale:', error);
            message.error(error.response.data.message);
            const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
            Modal.error({
                title: 'Lỗi khi tạo Flash Sale',
                content: errorMessages,
              });
        }
    };

    const columns = [
        {
            title: 'Tên Sản phẩm',
            dataIndex: 'product_id',
            key: 'product_id',
            render: (text: number, record: any) => {
                const product = products.find((product) => product.id === text);
                return product ? product.name : 'Không tìm thấy';
            },
        },
        {
            title: 'Giá giảm',
            dataIndex: 'discount_price',
            key: 'discount_price',
            render: (text: number) => `${text} VNĐ`,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
        },

        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    danger
                    onClick={() =>
                        setSelectedProducts(
                            selectedProducts.filter((item) => item.product_id !== record.product_id)
                        )
                    }
                >
                    Xóa
                </Button>
            ),
        },
    ];


    return (
        <div className='container' style={{ padding: 20 }}>
            <h2>Thêm Flash Sale</h2>
            <Form form={form} onFinish={handleSubmit} layout="vertical">

                <Form.Item label="Tên Flash Sale" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Thời gian bắt đầu" name="start_time" rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}>
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>
                <Form.Item label="Ảnh" name="image">
                    <Upload
                        name="image"
                        listType="picture"
                        showUploadList={false}
                        beforeUpload={(file) => {
                            setImage(file);  // Lưu ảnh vào state khi người dùng chọn
                            return false;  // Ngừng việc upload ảnh lên server (vì bạn không cần gọi API)
                        }}
                        maxCount={1}
                    >
                        <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                    </Upload>
                    {image && (
                        <img
                            src={URL.createObjectURL(image)}  // Tạo URL cho ảnh đã chọn
                            alt="Image preview"
                            style={{ width: 100, marginTop: 10 }}
                        />
                    )}
                </Form.Item>

                <Form.Item label="Thời gian kết thúc" name="end_time" rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}>
                    <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                </Form.Item>

                <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                    <Select>
                        <Option value="active">Đang diễn ra</Option>
                        <Option value="inactive">Ngừng</Option>
                    </Select>
                </Form.Item>

                <Button type="primary" onClick={() => setShowModal(true)} style={{ marginBottom: '10px' }}>
                    Thêm Sản Phẩm
                </Button>

                <Table
                    rowKey="product_id"
                    columns={columns}
                    dataSource={selectedProducts}
                    pagination={false}
                    footer={() => `Tổng số sản phẩm: ${selectedProducts.length}`}
                />

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Tạo Flash Sale
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                title="Chọn Sản Phẩm"
                visible={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
            >
                <Form
                    layout="vertical"
                    onFinish={({ product_id, discount_price, quantity }: any) =>
                        handleProductAdd(product_id, discount_price, quantity)
                    }
                >

                    <Form.Item
                        label="Chọn Sản Phẩm"
                        name="product_id"
                        rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
                    >
                        <Select placeholder="Chọn sản phẩm" style={{ width: '100%' }}>
                            {products.map((product) => (
                                <Option key={product.id} value={product.id}>
                                    {product.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giá giảm"
                        name="discount_price"
                        rules={[{ required: true, message: 'Vui lòng nhập giá giảm!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Thêm Sản Phẩm
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Sales;
