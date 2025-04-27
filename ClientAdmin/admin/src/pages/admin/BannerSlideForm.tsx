import React, { useState } from 'react';
import { Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const BannerSlideForm: React.FC = () => {
  const [form] = Form.useForm();
  const [images, setImages] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const handleUploadChange = (type: 'images' | 'banners') => ({ fileList }: any) => {
    if (type === 'images') setImages(fileList);
    if (type === 'banners') setBanners(fileList);
  };

  const handleFinish = async (values: any) => {
    const formData = new FormData();

    formData.append('title', values.title || '');
    formData.append('description', values.description || '');

    images.forEach((file: any) => {
      formData.append('images[]', file.originFileObj);
    });

    banners.forEach((file: any) => {
      formData.append('banners[]', file.originFileObj);
    });

    try {
      const getAuthToken = () => localStorage.getItem('access_token');
     const response = await axios.post('http://127.0.0.1:8000/api/slides', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      console.log(response.data); 
      message.success(response.data.message);
      form.resetFields();
      setImages([]);
      setBanners([]);
    } catch (err) {
      console.error(err);
      message.error(err.response.data.message);
    }
  };

  return (
    <div className='container'>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item name="title" label="Tiêu đề">
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Ảnh slide (tối đa 5 ảnh)">
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={images}
            multiple
            onChange={handleUploadChange('images')}
          >
            {images.length >= 5 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item label="Ảnh banner (nhiều ảnh)">
          <Upload
            listType="picture-card"
            beforeUpload={() => false}
            fileList={banners}
            multiple
            onChange={handleUploadChange('banners')}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Tải lên</div>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
            Gửi dữ liệu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BannerSlideForm;
