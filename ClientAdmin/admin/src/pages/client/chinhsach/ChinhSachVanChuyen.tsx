import React from "react";

const ChinhSachVanChuyen: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Chính sách vận chuyển
      </h1>

      <section className="mb-5">
        <h4 className="fw-semibold text-dark h5 mb-3">
          1. Phạm vi và đối tượng vận chuyển
        </h4>
        <p className="fs-5">
          Chính sách vận chuyển và giao hàng tại Lak Shop được áp dụng trên toàn quốc.
          Sản phẩm sẽ được giao tận tay khách hàng sau khi đặt mua qua website của chúng tôi.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="fw-semibold text-dark h5 mb-3">
          2. Các hình thức vận chuyển
        </h4>

        <div className="mb-4">
          <h5 className="text-secondary fw-semibold mb-2">
            2.1 Nhận hàng trực tiếp tại cửa hàng
          </h5>
          <p className="fs-5">
            Khách hàng mua sản phẩm trực tiếp tại chi nhánh hoặc đặt online qua website
            có thể nhận hàng tại cửa hàng. Vui lòng kiểm tra kỹ sản phẩm và chứng từ đi kèm.
          </p>
          <p className="fs-5">
            Nhân viên bán hàng sẽ liên hệ và thống nhất thời gian giao hàng nếu sản phẩm cần chuyển từ kho khác trong hệ thống.
          </p>
        </div>

        <div className="mb-4">
          <h5 className="text-secondary fw-semibold mb-2">
            2.2 Giao hàng hỏa tốc trong khu vực Hà Nội
          </h5>
          <p className="fs-5">
            Phí giao hàng nội thành Hà Nội sẽ tính theo App giao hàng <strong>HeyU</strong>.
            Trước khi giao, nhân viên sẽ liên hệ với khách hàng để xác nhận.
          </p>
          <p className="fs-5">
            Nếu khách có yêu cầu về thời gian giao hàng, vui lòng thông báo trước để được hỗ trợ tốt nhất.
          </p>
          <p className="fs-5">
            Khi nhận hàng, khách hàng cần kiểm tra kỹ sản phẩm. Nếu có vấn đề về số lượng, mẫu mã, chất lượng –
            vui lòng liên hệ Lak Shop để được hỗ trợ nhanh chóng.
          </p>
          <p className="fs-5">
            Trong trường hợp không thể giao hàng đúng hẹn, chúng tôi sẽ chủ động liên hệ và thông báo đến khách hàng.
          </p>
        </div>

        <div>
          <h5 className="text-secondary fw-semibold mb-2">
            2.3 Giao hàng ngoại thành Hà Nội
          </h5>
          <p className="fs-5">
            Khách hàng ngoại thành vui lòng cung cấp <strong>địa chỉ đầy đủ và chính xác</strong> khi đặt hàng.
            Shop không chịu trách nhiệm nếu địa chỉ sai gây thất lạc hàng hóa.
          </p>
          <p className="fs-5">
            Thời gian giao hàng từ <strong>1 - 4 ngày</strong> (không tính Chủ nhật, ngày lễ).
            Phụ thuộc vào đơn vị chuyển phát nhanh.
          </p>
          <p className="fs-5">
            <strong>Phí vận chuyển:</strong> từ 35.000 VNĐ trở lên, tùy khu vực.
          </p>
          <p className="fs-5">
            Khi nhận hàng, vui lòng kiểm tra kỹ sản phẩm. Nếu có sai lệch về số lượng, mẫu mã, chất lượng –
            hãy liên hệ ngay với chúng tôi để được xử lý kịp thời.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ChinhSachVanChuyen;
