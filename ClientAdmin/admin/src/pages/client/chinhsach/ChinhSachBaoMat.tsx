import React from "react";

const ChinhSachBaoMat: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Chính sách bảo mật
      </h1>

      <section className="mb-4">
        <p className="fs-5">
          Khi thực hiện giao dịch tại Lak Shop, khách hàng cần phải bổ sung một số thông tin cá nhân.
          Điều này giúp chúng tôi đảm bảo việc:
        </p>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">• Giao hàng cho đúng vị trí</li>
          <li className="mb-2">• Thông báo với khách hàng về việc giao hàng</li>
          <li className="mb-2">• Hỗ trợ khách hàng khi cần thiết</li>
          <li className="mb-2">• Thông báo các thông tin liên quan tới đơn hàng</li>
          <li className="mb-2">• Xác nhận và thực hiện các giao dịch nếu khách thanh toán trực tuyến</li>
          <li className="mb-2">• Kiểm tra dữ liệu tải từ website</li>
          <li className="mb-2">• Nhận diện khách hàng</li>
          <li className="mb-2">• Nghiên cứu, phân tích nhằm nâng cao chất lượng dịch vụ</li>
        </ul>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">1. Mục đích và phạm vi thu thập</h4>
        <p className="fs-5">
          Để sử dụng dịch vụ tại website, Quý khách có thể được yêu cầu cung cấp:
        </p>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">- Họ và tên, địa chỉ liên lạc</li>
          <li className="mb-2">- Email, số điện thoại di động</li>
        </ul>
        <p className="fs-5">
          Ngoài ra, chúng tôi cũng thu thập dữ liệu truy cập như số lần viếng thăm, số trang xem, số link click v.v...
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">2. Phạm vi sử dụng thông tin</h4>
        <p className="fs-5">
          Thông tin chỉ được sử dụng cho mục đích giao hàng, liên hệ khách hàng và các hoạt động chăm sóc khách hàng.
          Trong một số trường hợp, chúng tôi sẽ sử dụng để gửi thư cảm ơn, thông báo kỹ thuật, khuyến mãi...
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">3. Thời gian lưu trữ thông tin</h4>
        <p className="fs-5">
          Thông tin của khách hàng sẽ được lưu trữ trong hệ thống cho đến khi có yêu cầu hủy bỏ.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">4. Những người/tổ chức được tiếp cận thông tin</h4>
        <p className="fs-5">
          Tất cả khách hàng đều có quyền truy cập thông tin của mình và yêu cầu hủy bỏ khi cần thiết.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">5. Địa chỉ đơn vị quản lý thông tin</h4>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2"><strong>Cửa hàng:</strong> Lak Shop</li>
          <li className="mb-2"><strong>Địa chỉ:</strong> 276 Phố Huế - Phường Phố Huế - Quận Hai Bà Trưng - Hà Nội</li>
          <li className="mb-2"><strong>Điện thoại:</strong> 0978879700</li>
        </ul>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">6. Phương tiện và công cụ chỉnh sửa thông tin</h4>
        <p className="fs-5">
          Quý khách có thể chỉnh sửa thông tin cá nhân bằng cách liên hệ số điện thoại: <strong>0978879700</strong> hoặc email: <strong>lakshop2012@gmail.com</strong>
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold h4 text-dark mb-3">7. Cam kết bảo mật thông tin</h4>
        <p className="fs-5">
          Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và chỉ chia sẻ khi cần thiết với đơn vị vận chuyển liên quan.
        </p>
      </section>
    </div>
  );
};

export default ChinhSachBaoMat;
