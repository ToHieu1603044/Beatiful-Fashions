import React, { useEffect, useState } from 'react';
import { Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BannerSlideFormUpdate: React.FC = () => {
  const [form] = Form.useForm();
  const [images, setImages] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const navigate = useNavigate(); // Khởi tạo navigate
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL

  // Lấy dữ liệu slide theo ID
  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/slides/${id}`);
        const slideData = response.data;
        form.setFieldsValue({
          title: slideData.title,
          description: slideData.description,
        });
        setImages(slideData.images.map((url: string, index: number) => ({
          uid: `old-${index}`,
          name: `image-${index}.jpg`,
          status: 'done',
          url,
        })));
  
        setBanners(slideData.banners.map((url: string, index: number) => ({
          uid: `old-banner-${index}`,
          name: `banner-${index}.jpg`,
          status: 'done',
          url,
        })));
      } catch (error) {
        message.error('Không thể tải dữ liệu slide!');
      }
    };
  
    fetchSlide();
  }, [id, form]);
  

  const handleUploadChange = (type: 'images' | 'banners') => ({ fileList }: any) => {
    if (type === 'images') setImages(fileList);
    if (type === 'banners') setBanners(fileList);
  };

  const handleFinish = async (values: any) => {
    const formData = new FormData();
  
    formData.append('title', values.title || '');
    formData.append('description', values.description || '');
  
    // Chỉ thêm ảnh mới (có originFileObj)
    const hasNewImages = images.some(file => file.originFileObj);
    const hasNewBanners = banners.some(file => file.originFileObj);
  
    if (hasNewImages) {
      images.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append('images[]', file.originFileObj);
        }
      });
    }
  
    if (hasNewBanners) {
      banners.forEach((file: any) => {
        if (file.originFileObj) {
          formData.append('banners[]', file.originFileObj);
        }
      });
    }
  
    try {
      await axios.put(`http://127.0.0.1:8000/api/slides/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Cập nhật slide thành công!');
      navigate('/admin/slider'); // Điều hướng về danh sách slider
    } catch (err) {
      console.error(err);
      message.error('Đã có lỗi xảy ra khi cập nhật!');
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
            Cập nhật slide
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default BannerSlideFormUpdate;
