// OrderPending.jsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Card = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.8s ease-in-out;

  @media (max-width: 600px) {
    padding: 25px 20px;
  }
`;

const Icon = styled.div`
  font-size: 60px;
  color: #facc15;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    font-size: 50px;
  }
`;

const Title = styled.h1`
  font-size: 26px;
  color: #111827;
  margin-bottom: 12px;

  @media (max-width: 600px) {
    font-size: 22px;
  }
`;

const Paragraph = styled.p`
  color: #6b7280;
  line-height: 1.6;
  font-size: 16px;
  margin-bottom: 30px;
`;

const DetailsBox = styled.div`
  background-color: #f3f4f6;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: left;
`;

const DetailText = styled.p`
  margin: 6px 0;
  font-size: 15px;
  color: #374151;
`;

const Button = styled.a`
  display: inline-block;
  padding: 12px 25px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

const OrderPending = () => {
  return (
    <Container>
      <Card>
        <Icon>⏳</Icon>
        <Title>Đơn hàng đang chờ xử lý</Title>
        <Paragraph>
          Cảm ơn bạn đã đặt hàng tại <strong>ShopOnline</strong>! Đơn hàng của bạn đang được xử lý. 
          Chúng tôi sẽ sớm xác nhận và cập nhật trạng thái tiếp theo qua email hoặc SMS.
        </Paragraph>

        <DetailsBox>
          <DetailText><strong>Mã đơn hàng:</strong> #DH123456789</DetailText>
          <DetailText><strong>Thời gian đặt:</strong> 20/04/2025 - 15:23</DetailText>
          <DetailText><strong>Phương thức thanh toán:</strong> Thanh toán khi nhận hàng (COD)</DetailText>
        </DetailsBox>

        <Button href="/">Quay về trang chủ</Button>
      </Card>
    </Container>
  );
};

export default OrderPending;
