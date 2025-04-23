import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  font-family: 'Inter', sans-serif;
  background-color: #fdfdfd;
  padding: 60px 20px;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  background-color: #ffffff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const Heading = styled.h1`
  text-align: center;
  font-size: 36px;
  color: #111827;
  margin-bottom: 30px;
  font-weight: 700;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 15px;
`;

const Text = styled.p`
  font-size: 16px;
  color: #4b5563;
  line-height: 1.7;
`;

const Highlight = styled.span`
  color: #e11d48;
  font-weight: 600;
`;

const WhyUsList = styled.ul`
  margin-top: 15px;
  padding-left: 20px;
  list-style: disc;
  color: #374151;
  line-height: 1.7;
`;

const ImageBanner = styled.div`
  margin: 40px 0;
  border-radius: 10px;
  overflow: hidden;
  img {
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
`;

const AboutUs = () => {
  return (
    <Wrapper>
      <Container>
        <Heading>Về Beautiful Fashion</Heading>

        <ImageBanner>
          <img
            src="https://images.unsplash.com/photo-1521335629791-ce4aec67dd47"
            alt="Beautiful Fashion Banner"
          />
        </ImageBanner>

        <Section>
          <Title>Giới thiệu</Title>
          <Text>
            <Highlight>Beautiful Fashion</Highlight> là thương hiệu thời trang trẻ trung, hiện đại và đầy cảm hứng,
            mang đến những sản phẩm chất lượng cao với thiết kế tinh tế, bắt kịp xu hướng. Chúng tôi không chỉ bán
            quần áo – chúng tôi truyền tải phong cách sống, cá tính và sự tự tin đến từng khách hàng.
          </Text>
        </Section>

        <Section>
          <Title>Sứ mệnh</Title>
          <Text>
            Chúng tôi tin rằng mỗi người đều có một phong cách riêng. <Highlight>Beautiful Fashion</Highlight> cam kết
            mang đến cho bạn những lựa chọn đa dạng, phù hợp với mọi vóc dáng, mọi hoàn cảnh – từ thường ngày đến sự kiện
            đặc biệt.
          </Text>
        </Section>

        <Section>
          <Title>Vì sao chọn chúng tôi?</Title>
          <WhyUsList>
            <li>Chất lượng sản phẩm cao, được chọn lọc kỹ lưỡng</li>
            <li>Thiết kế thời thượng, cập nhật xu hướng liên tục</li>
            <li>Giá cả hợp lý, nhiều ưu đãi hấp dẫn</li>
            <li>Giao hàng nhanh chóng, hỗ trợ đổi trả dễ dàng</li>
            <li>Chăm sóc khách hàng tận tình, chuyên nghiệp</li>
          </WhyUsList>
        </Section>

        <Section>
          <Title>Kết nối với chúng tôi</Title>
          <Text>
            Hãy theo dõi chúng tôi trên mạng xã hội và đăng ký nhận tin để không bỏ lỡ những xu hướng mới nhất cùng chương trình ưu đãi đặc biệt:
            <br /><br />
            💌 Email: support@beautifulfashion.vn<br />
            📷 Instagram: @beautifulfashion.vn<br />
            🌐 Website: www.beautifulfashion.vn
          </Text>
        </Section>
      </Container>
    </Wrapper>
  );
};

export default AboutUs;
