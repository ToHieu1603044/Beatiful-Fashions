import React from "react";
import { useSearchParams } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled components
const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-in-out;

  @media (max-width: 600px) {
    padding: 25px 20px;
  }
`;

const Icon = styled.div`
  font-size: 64px;
  color: #22c55e;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 28px;
  color: #111827;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const OrderIdBox = styled.div`
  background-color: #f3f4f6;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
  margin-bottom: 30px;
  word-break: break-word;
`;

const Button = styled.a`
  display: inline-block;
  padding: 12px 24px;
  background-color: #3b82f6;
  color: #fff;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2563eb;
  }
`;

// Component
const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <Wrapper>
      <Card>
        <Icon>🎉</Icon>
        <Title>Thanh toán thành công!</Title>
        <Message>
          Cảm ơn bạn đã đặt hàng tại <strong>ShopOnline</strong>. Chúng tôi đã nhận được đơn hàng và sẽ xử lý trong thời gian sớm nhất.
        </Message>

        {orderId ? (
          <OrderIdBox>Mã đơn hàng của bạn: <strong>{orderId}</strong></OrderIdBox>
        ) : (
          <OrderIdBox>Không tìm thấy mã đơn hàng. Vui lòng kiểm tra lại liên kết.</OrderIdBox>
        )}

        <Button href="/">Quay về trang chủ</Button>
      </Card>
    </Wrapper>
  );
};

export default OrderSuccess;
