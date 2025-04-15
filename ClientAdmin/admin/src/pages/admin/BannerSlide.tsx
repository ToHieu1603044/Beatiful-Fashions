import React, { useEffect, useState } from 'react';
import { Card, Button, message, Row, Col, Tag } from 'antd';
import axios from 'axios';

interface Slide {
  id: number;
  title: string;
  description: string;
  images: string[];
  select: boolean;
}

const BannerSlide: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/slides');
      setSlides(response.data);
    } catch (error) {
      console.error(error);
      message.error('Không thể tải danh sách slide!');
    }
  };

  const handleSelect = async (id: number) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/slides/select/${id}`);
      message.success('Đã chọn slide thành công!');
      fetchSlides(); // reload lại danh sách sau khi chọn
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi chọn slide!');
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  return (
    <div className="site-card-wrapper container" >
          <Row gutter={[16, 16]}>
      {slides.map((slide) => (
        <Col key={slide.id} xs={24} sm={12} md={8}>
          <Card
            title={slide.title || `Slide #${slide.id}`}
            extra={
              slide.select ? <Tag color="green">Đang hiển thị</Tag> : null
            }
          >
            <p>{slide.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {slide.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`slide-${index}`}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <Button
                type="primary"
                disabled={slide.select}
                onClick={() => handleSelect(slide.id)}
              >
                {slide.select ? 'Đã chọn' : 'Chọn slide này'}
              </Button>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
    </div>
  );
};

export default BannerSlide;
