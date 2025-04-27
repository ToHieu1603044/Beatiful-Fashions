import React, { useEffect, useState } from 'react';
import { Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BannerSlideFormUpdate: React.FC = () => {
  const [form] = Form.useForm();
  const [images, setImages] = useState<any[]>([]);  // List of images
  const [banners, setBanners] = useState<any[]>([]); // List of banners
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from URL

  // Fetch slide data by ID
  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/slides/${id}`);
        const slideData = response.data;
        form.setFieldsValue({
          title: slideData.title,
          description: slideData.description,
        });

        // Set images and banners with the existing URLs
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

  // Handle file change for images or banners
  const handleUploadChange = (type: 'images' | 'banners') => async ({ fileList }: any) => {
    if (type === 'images') {
      // Convert files to base64 if they have originFileObj
      const newImages = await Promise.all(fileList.map(async (file: any) => {
        if (file.originFileObj) {
          const base64 = await convertToBase64(file.originFileObj);
          return { ...file, base64 }; // Add base64 string to file object
        }
        return file;
      }));
      setImages(newImages);
    }
    if (type === 'banners') {
      const newBanners = await Promise.all(fileList.map(async (file: any) => {
        if (file.originFileObj) {
          const base64 = await convertToBase64(file.originFileObj);
          return { ...file, base64 }; // Add base64 string to file object
        }
        return file;
      }));
      setBanners(newBanners);
    }
  };

  // Convert file to base64
  const convertToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Handle form submission
  const handleFinish = async (values: any) => {
    const updatedSlideData = {
      title: values.title,
      description: values.description,
      images: images.filter((file) => file.base64).map((file: any) => file.base64), // Use base64 for new images
      banners: banners.filter((file) => file.base64).map((file: any) => file.base64), // Use base64 for new banners
    };

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/slides/${id}`, updatedSlideData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      message.success(response.data.message);
      console.log(response.data);
    } catch (err) {
      console.error(err);
      message.error(err.response.data.message);
    }
  };

  return (
    <div className="container">
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
