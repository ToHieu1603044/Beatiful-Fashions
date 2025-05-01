import { Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import moment from 'moment';

const [form] = Form.useForm();

useEffect(() => {
    if (editingSale) {
        form.setFieldsValue({
            name: editingSale.name,
            start_time: moment(editingSale.start_time),
            end_time: moment(editingSale.end_time),
            quantity: editingSale.quantity, // Cập nhật số lượng nếu có
        });
    }
}, [editingSale]);

const handleUpdateSale = async () => {
    try {
        const values = await form.validateFields();
        await axios.put(`http://127.0.0.1:8000/api/sales/${editingSale?.id}`, {
            name: values.name,
            start_time: values.start_time.format('YYYY-MM-DD HH:mm:ss'),
            end_time: values.end_time.format('YYYY-MM-DD HH:mm:ss'),
            quantity: values.quantity, // Thêm số lượng vào request
        });

        // Cập nhật state
        const updatedSales = flashSales.map((sale) =>
            sale.id === editingSale?.id ? { ...sale, ...values } : sale
        );
        setFlashSales(updatedSales);

        closeEditModal();
    } catch (error) {
        console.error("Lỗi khi cập nhật:", error);
    }
};

<Modal
    title="Chỉnh sửa Flash Sale"
    open={isModalOpen}
    onCancel={closeEditModal}
    onOk={handleUpdateSale}
    okText="Cập nhật"
    cancelText="Hủy"
>
    <Form form={form} layout="vertical">
        <Form.Item label="Tên chương trình" name="name" rules={[{ required: true, message: 'Không được để trống' }]}>
            <Input />
        </Form.Item>
        <Form.Item label="Thời gian bắt đầu" name="start_time" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item label="Thời gian kết thúc" name="end_time" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        </Form.Item>
        <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: 'Không được để trống' }]}>
            <InputNumber min={1} />
        </Form.Item>
    </Form>
</Modal>
