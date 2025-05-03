import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation cho xuất hiện
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #fef2f2;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
  max-width: 550px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-in-out;

  @media (max-width: 600px) {
    padding: 25px 20px;
  }
`;

const Icon = styled.div`
  font-size: 64px;
  color: #ef4444;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 26px;
  color: #b91c1c;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 25px;
`;

const HintBox = styled.div`
  background-color: #fef2f2;
  color: #7f1d1d;
  padding: 15px 20px;
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  margin-bottom: 30px;
  font-size: 15px;
`;

const Button = styled.a`
  display: inline-block;
  background-color: #ef4444;
  color: #fff;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #dc2626;
  }
`;

const OrderFail = () => {
  return (
    <Wrapper>
      <Card>
        <Icon>❌</Icon>
        <Title>Thanh toán thất bại</Title>
        <Message>
          Rất tiếc! Đơn hàng của bạn chưa được xử lý thành công.
          Có thể do sự cố kết nối, lỗi thẻ thanh toán hoặc thời gian hết hạn phiên giao dịch.
        </Message>

        <HintBox>
          Bạn có thể thử lại sau ít phút hoặc sử dụng phương thức thanh toán khác. Nếu cần hỗ trợ, vui lòng liên hệ bộ phận CSKH qua hotline 1900 1234.
        </HintBox>

        <Button href="/cart">Quay lại giỏ hàng</Button>
      </Card>
    </Wrapper>
  );
};

export default OrderFail;
