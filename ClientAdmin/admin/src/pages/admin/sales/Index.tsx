import React, { useEffect, useState } from 'react';
import { Table, Tag, Image, Collapse, Typography, Button } from 'antd';
import axios from 'axios';
const { Panel } = Collapse;
const { Text } = Typography;

interface Product {
    id: number;
    name: string;
    pivot: {
        discount_price: number;
    };
}
type ToggleProps = {
    id: number;
    isActive: boolean;
  };

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
    const handleToggleStatus = async (id: number) => {
        try {
             await axios.put(`http://127.0.0.1:8000/api/sales/${id}/toggle-status`);
            // Sau khi cập nhật thành công, reload lại danh sách
            const updatedSales = flashSales.map((sale) =>
                sale.id === id ? { ...sale, status: sale.status === 'active' ? 'inactive' : 'active' } : sale
            );
            setFlashSales(updatedSales);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
        }
    };
    
    const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSales = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/sales');  // Lay danh sach sales
                console.log(response.data);

                setFlashSales(response.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu khuyến mãi:', error);
            }
            setLoading(false);
        };

        fetchSales();
    }, []);
    const handleDeleteSale = async (id: number) => {
        try {
           const response = await axios.delete(`http://127.0.0.0.1:8000/api/sales/${id}`);
            if (response.status === 200) {
                setFlashSales(flashSales.filter(sale => sale.id !== id));  // Loc giữ lại id khác cái id bi xóa
            }else {
                console.error('Lỗi khi xóa khuyến mãi:', response.data);
                }
        } catch (error) {
            console.error('Lỗi khi xóa khuyến mái:', error);
            }
    }
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
            title: 'Hành động',
            key: 'action',
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
                                        <Text strong>{p.name}</Text> –{' '}
                                        {/* <Text type="danger">{p.pivot.discount_price.toLocaleString()} VNĐ</Text> */}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                </Collapse>
            ),
        },
        {
            title:"Hanh dong",
            key: "action",
            render: (_: any, record: FlashSale) => (    
                <Button type="danger" onClick={handleDeleteSale(record.id)}>Xoa</Button>
            ),
        }
    ];

    return (
        <div className="container" style={{ padding: 20 }}>
            <h2>Danh sách chương trình Flash Sale</h2>
            <Button className='mt-3 mb-3 text-decoration-none' type="primary" href="/admin/sales">Thêm FlashSales</Button>
            <Table
                columns={columns}
                dataSource={flashSales}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 5 }}
                bordered
            />
        </div>
    );
};

export default Index;
