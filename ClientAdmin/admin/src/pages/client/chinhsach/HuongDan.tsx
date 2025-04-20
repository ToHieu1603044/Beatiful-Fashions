import React from "react";

const HuongDan: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Hướng dẫn mua hàng
      </h1>

      <section className="mb-4">
        <h4 className="text-dark fw-semibold h4 mb-2">Bước 1:</h4>
        <p className="fs-5">
          Truy cập website và lựa chọn sản phẩm cần mua để mua hàng.
        </p>
      </section>

      <section className="mb-4">
        <h4 className="text-dark fw-semibold h4 mb-2">Bước 2:</h4>
        <p className="fs-5">
          Click vào sản phẩm muốn mua, màn hình sẽ hiển thị popup với các lựa chọn:
        </p>
        <ul className="fs-5 list-unstyled ms-3">
          <li className="mb-2">
            • Nếu bạn muốn tiếp tục mua hàng: Bấm vào phần <strong>Tiếp tục mua hàng</strong> để lựa chọn thêm sản phẩm vào giỏ hàng.
          </li>
          <li className="mb-2">
            • Nếu bạn muốn xem giỏ hàng để cập nhật sản phẩm: Bấm vào <strong>Xem giỏ hàng</strong>.
          </li>
          <li className="mb-2">
            • Nếu bạn muốn đặt hàng và thanh toán cho sản phẩm này: Bấm vào <strong>Đặt hàng và thanh toán</strong>.
          </li>
        </ul>
      </section>

      <section className="mb-4">
        <h4 className="text-dark fw-semibold h4 mb-2">Bước 3:</h4>
        <p className="fs-5">Lựa chọn thông tin tài khoản thanh toán:</p>
        <ul className="fs-5 list-unstyled ms-3">
          <li className="mb-2">
            • Nếu đã có tài khoản: Nhập email và mật khẩu để đăng nhập.
          </li>
          <li className="mb-2">
            • Nếu chưa có tài khoản: Điền thông tin cá nhân để đăng ký. Việc đăng ký giúp bạn dễ dàng theo dõi đơn hàng.
          </li>
          <li className="mb-2">
            • Nếu không muốn đăng ký tài khoản: Nhấp vào mục <strong>Đặt hàng không cần tài khoản</strong>.
          </li>
        </ul>
      </section>

      <section className="mb-4">
        <h4 className="text-dark fw-semibold h4 mb-2">Bước 4:</h4>
        <p className="fs-5">
          Điền các thông tin nhận hàng, chọn hình thức thanh toán và vận chuyển.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-2">Bước 5:</h4>
        <p className="fs-5">
          Xem lại đơn hàng, thêm ghi chú nếu có và bấm <strong>Gửi đơn hàng</strong>.
        </p>
        <p className="fs-5">
          Sau khi nhận được đơn, chúng tôi sẽ liên hệ lại qua điện thoại để xác nhận thông tin.
        </p>
        <p className="fs-5">Trân trọng cảm ơn quý khách!</p>
      </section>
    </div>
  );
};

export default HuongDan;
