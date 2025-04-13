import React from "react";

const ChinhSachThanhToan: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Chính sách thanh toán
      </h1>

      <section className="mb-4">
        <p className="fs-5">
          Hiện Lak Shop đang triển khai <strong>3 hình thức thanh toán</strong> đơn hàng. Khách hàng có thể lựa chọn phương thức phù hợp nhất với mình:
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold text-dark h5 mb-3">Phương án 1: Thanh toán tiền mặt tại cửa hàng</h4>
        <p className="fs-5">
          Quý khách có thể đến trực tiếp cửa hàng Lak Shop và thanh toán đơn hàng bằng tiền mặt khi mua sản phẩm.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold text-dark h5 mb-3">Phương án 2: Thanh toán COD (giao hàng và thanh toán tại nhà)</h4>
        <p className="fs-5">
          Sau khi kiểm tra hàng hóa, quý khách sẽ thanh toán trực tiếp cho nhân viên giao hàng tại địa chỉ nhận hàng.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold text-dark h5 mb-3">Phương án 3: Chuyển khoản ngân hàng</h4>
        <p className="fs-5">
          Khách hàng chuyển khoản trước theo thông tin dưới đây, sau đó Lak Shop sẽ xác nhận và giao hàng:
        </p>
        <ul className="fs-5 list-unstyled mb-3">
          <li><strong>Chủ tài khoản:</strong> Nguyễn Đức Dũng</li>
          <li><strong>Số tài khoản:</strong> 1030.0440.8358</li>
          <li><strong>Ngân hàng:</strong> Vietinbank - Ngân hàng TMCP Công Thương Việt Nam</li>
        </ul>
        <p className="fs-5 mb-2"><strong>Nội dung chuyển khoản bao gồm:</strong></p>
        <ul className="fs-5 list-unstyled">
          <li className="mb-2">• Tên người chuyển khoản</li>
          <li className="mb-2">• Số điện thoại đặt hàng</li>
          <li className="mb-2">• Mã đơn hàng</li>
        </ul>
        <p className="fs-5">
          Sau khi nhận được khoản chuyển, chúng tôi sẽ liên hệ lại để xác nhận và tiến hành giao hàng.
        </p>
      </section>

      <section className="mb-4">
        <h4 className="fw-semibold text-dark h5 mb-3">Lưu ý khi chuyển khoản</h4>
        <p className="fs-5">
          Trong trường hợp quá thời gian thỏa thuận mà chưa nhận được hàng hoặc không có phản hồi,
          khách hàng có thể liên hệ ngay qua <strong>hotline 0978879700</strong> hoặc khiếu nại trực tiếp tại cửa hàng để được hỗ trợ.
        </p>
      </section>
    </div>
  );
};

export default ChinhSachThanhToan;
