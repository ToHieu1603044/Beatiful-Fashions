import React from "react";

const ChinhSachDoiHang: React.FC = () => {
  return (
    <div
      className="container py-5"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1 className="mb-5 text-center fw-bold display-4 text-secondary">
        Chính sách đổi hàng
      </h1>

      <section className="mb-5">
        <p className="fs-5">
          Lak Shop chỉ áp dụng chính sách đổi trả cho các sản phẩm được mua tại
          website hoặc tại cửa hàng của chúng tôi. Khi mua hàng, kèm theo sản
          phẩm sẽ là hóa đơn mua hàng. Khách hàng chỉ cần giữ hóa đơn mua hàng
          và sản phẩm còn nguyên tem/tag để được hỗ trợ đổi hàng khi cần.
        </p>
        <p className="fs-5">
          <strong>Thời gian đổi hàng:</strong> 1 ngày khi nhận được hàng.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">
          1. Trường hợp lỗi từ Lak Shop
        </h4>
        <p className="fs-5">
          Trường hợp Lak Shop giao hàng không đúng như khách hàng đã đặt mua,
          vui lòng liên hệ với chúng tôi để được đổi hàng. Chi phí vận chuyển
          sẽ do Lak Shop chịu hoàn toàn.
        </p>
      </section>

      <section className="mb-5">
        <h4 className="text-dark fw-semibold h4 mb-3">
          2. Trường hợp khách muốn đổi vì không phù hợp
        </h4>
        <p className="fs-5">
          Trong trường hợp hàng được giao đúng nhưng khách hàng cảm thấy không
          phù hợp với mình, muốn đổi sang sản phẩm khác thì phải đổi trong 1
          ngày, tính từ thời điểm nhận hàng và phải chịu phí vận chuyển khi đổi
          hàng.
        </p>
        <p className="fs-5">
          Sản phẩm muốn đổi phải có giá trị bằng hoặc cao hơn sản phẩm đổi.
        </p>
        <p className="fs-5">
          Trường hợp đổi sang sản phẩm có giá trị cao hơn, khách hàng phải
          thanh toán thêm tiền.
        </p>
      </section>
    </div>
  );
};

export default ChinhSachDoiHang;
