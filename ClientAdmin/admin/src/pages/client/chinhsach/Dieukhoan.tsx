import React from "react";

const Dieukhoan: React.FC = () => {
  return (
    <div className="container py-5" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Điều khoản
      </h1>

      <p className="fs-5 mb-4">
        Khi quý khách truy cập vào trang web của chúng tôi có nghĩa là quý khách đồng ý với các điều khoản này...
      </p>
      <p className="fs-5 mb-5">
        Quý khách vui lòng kiểm tra thường xuyên để cập nhật những thay đổi của chúng tôi.
      </p>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">1. Hướng dẫn sử dụng web</h4>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">Người dùng tối thiểu 18 tuổi hoặc có giám sát hợp pháp.</li>
          <li className="mb-2">Giấy phép sử dụng chỉ trong khuôn khổ quy định.</li>
          <li className="mb-2">Cấm sử dụng thương mại nếu không được cho phép.</li>
          <li className="mb-2">Thông tin sản phẩm là từ khách hàng, không phải từ chúng tôi.</li>
          <li className="mb-2">Phải đăng ký tài khoản xác thực và chịu trách nhiệm với tài khoản.</li>
          <li className="mb-2">Đồng ý nhận email quảng cáo, có thể từ chối qua link cuối email.</li>
        </ul>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">2. Chấp nhận đơn hàng và giá cả</h4>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">Chúng tôi có quyền từ chối hoặc hủy đơn hàng bất kỳ lúc nào.</li>
          <li className="mb-2">Cam kết giá chính xác, nhưng nếu sai sẽ liên hệ hoặc hủy đơn phù hợp.</li>
        </ul>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">3. Thương hiệu và bản quyền</h4>
        <p className="fs-5">
          Mọi nội dung, thiết kế, mã nguồn thuộc quyền sở hữu của chúng tôi và được bảo vệ bởi luật bản quyền.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">4. Quyền pháp lý</h4>
        <p className="fs-5">
          Các điều khoản chịu sự điều chỉnh của luật pháp Việt Nam. Tranh chấp sẽ do tòa án giải quyết.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">5. Quy định về bảo mật</h4>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">Thông tin thanh toán được mã hóa và bảo mật.</li>
          <li className="mb-2">Cấm can thiệp hệ thống hoặc phát tán mã độc, sẽ bị xử lý pháp luật.</li>
          <li className="mb-2">Thông tin có thể cung cấp cho cơ quan pháp luật khi có yêu cầu.</li>
        </ul>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">6. Thay đổi, hủy bỏ giao dịch tại website</h4>
        <p className="fs-5 mb-2">Khách hàng có thể chấm dứt giao dịch bằng cách:</p>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">Thông báo với chúng tôi về việc hủy giao dịch.</li>
          <li className="mb-2">Trả hàng chưa sử dụng và chưa nhận lợi ích theo chính sách đổi trả.</li>
        </ul>
      </section>
    </div>
  );
};

export default Dieukhoan;
