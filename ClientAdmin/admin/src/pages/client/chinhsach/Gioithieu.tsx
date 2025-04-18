import React from "react";

const GioiThieu: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Giới thiệu
      </h1>

      <section className="mb-5">
        <ul className="fs-5 list-unstyled">
          <li className="mb-2"><strong>Hộ Kinh Doanh:</strong> Nguyễn Đức Dũng</li>
          <li className="mb-2"><strong>SĐT:</strong> 0978879700</li>
          <li className="mb-2"><strong>Địa chỉ kinh doanh:</strong> 276 Phố Huế, Hai Bà Trưng, Hà Nội</li>
          <li className="mb-2"><strong>Email:</strong> lakshop2012@gmail.com</li>
          <li className="mb-2"><strong>Giấy chứng nhận ĐKKD số:</strong> 01D8021441</li>
          <li className="mb-2"><strong>Đăng ký lần đầu:</strong> 14/08/2012</li>
          <li className="mb-2"><strong>Đăng ký thay đổi lần 2:</strong> 02/10/2021</li>
          <li className="mb-2"><strong>Nơi cấp:</strong> Phòng Tài Chính - Kế Hoạch - UBND Quận HBT</li>
          <li className="mb-2"><strong>MST:</strong> 0105981261 - <strong>Ngày cấp:</strong> 27/08/2012 tại Chi cục Thuế Quận Hai Bà Trưng</li>
          <li className="mb-2"><strong>Website:</strong> www.lakshop.net</li>
        </ul>
      </section>

      <section className="mb-5">
        <p className="fs-5 mb-3">
          <strong>Lak Shop</strong> là shop thời trang được đặt tại 276 Phố Huế - Quận HBT - Hà Nội.
        </p>
        <p className="fs-5 mb-3">
          Đến với Lak Shop, bạn sẽ được trải nghiệm đa dạng mẫu mã và thường xuyên update những xu thế thời trang mới nhất giành riêng cho giới trẻ.
        </p>
        <p className="fs-5 mb-3">
          Những set đồ của shop cực kì tươi trẻ, năng động.
        </p>
        <p className="fs-5 mb-3">
          Sản phẩm được lựa chọn kĩ càng theo từng concept. Nhờ vậy, dù bạn yêu thích kiểu dáng nào, họa tiết ra sao cũng đều rất có thể tìm được sản phẩm tương thích tại Lak.
        </p>
        <p className="fs-5 mb-3">
          Từ quần Âu, Áo thun cho tới những phụ kiện kèm theo khác như túi xách, kính mắt, hay giày đều được lựa chọn kĩ lưỡng, tỉ mỉ.
        </p>
        <p className="fs-5">
          Nhờ vậy những bạn nam sẽ trở thành thanh lịch hơn mà chẳng cần đau đầu nghĩ những phối đồ.
        </p>
      </section>
    </div>
  );
};

export default GioiThieu;
