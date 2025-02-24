import React, { useState } from "react";
const users = [
    {
        email: "vgiang2701@gmail.com",
        password:
            "$2a$10$FdEYp8SMaRxl3YSCNNwenekP8gACpg.BFuBvGda/4WEW9.RJulaoW",
        id: 1,
    },
];

const CheckOut = () => {
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson)!.user : null;
    const [bank, setBank] = useState<undefined | number>();
    console.log("bank", bank);
    return (
        <>
            <div
                className="w-100 d-flex"
                style={{
                    pointerEvents: user ? "none" : "auto",
                    opacity: user ? 0.6 : 1,
                    cursor: user ? "not-allowed" : "auto",
                }}
            >
                {/* left */}
                <div
                    className=""
                    style={{ width: "65%", paddingLeft: "170px" }}
                >
                    {/* logo shop */}
                    <div className="w-100">
                        <img
                            src="https://bizweb.dktcdn.net/100/347/891/themes/710583/assets/checkout_logo.png?1739517244563"
                            alt=""
                            style={{
                                width: "55px",
                                marginTop: "30px",
                                marginBottom: "30px",
                            }}
                        />
                    </div>
                    {/* thông tin user */}
                    <div
                        className="w-100 d-flex justify-content-between pb-4"
                        style={{ borderBottom: "1px solid #ccc" }}
                    >
                        <div style={{ width: "50%" }}>
                            {/* text */}
                            <div className="d-flex align-items-center justify-content-between">
                                <h2
                                    className="fw-bolder"
                                    style={{ fontSize: "20px" }}
                                >
                                    Thông tin nhận hàng
                                </h2>
                                {user ? (
                                    <></>
                                ) : (
                                    <>
                                        <p
                                            className="text-danger"
                                            style={{
                                                fontSize: "15px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <i className="fa-regular fa-circle-user me-1"></i>
                                            <span>Đăng nhập </span>
                                        </p>
                                    </>
                                )}
                            </div>
                            {/* form */}
                            <div
                                className="mt-3"
                                style={{
                                    pointerEvents: user ? "none" : "auto",
                                    opacity: user ? 0.6 : 1,
                                    cursor: user ? "not-allowed" : "auto",
                                }}
                            >
                                <form action="">
                                    {/* email */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Email"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* họ và tên */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Họ và tên"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* số điện thoại  */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Số điện thoại"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* Địa chỉ  */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Địa chỉ"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* tỉnh thành   */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Tỉnh thành"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* Phường xã   */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Phường xã"
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* Ghi chú   */}
                                    <div className="mb-3">
                                        <textarea
                                            name=""
                                            id=""
                                            cols={10}
                                            rows={5}
                                            placeholder="Ghi chú"
                                            className="form-control"
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div style={{ width: "45%", marginRight: "30px" }}>
                            {" "}
                            <h2
                                className="fw-bolder"
                                style={{ fontSize: "20px" }}
                            >
                                Vận chuyển
                            </h2>
                            {/* chuyển phát nhanh  */}
                            <div
                                className="mt-3"
                                style={{
                                    border: "1px solid #C0C0C0",
                                    padding: "10px",
                                    borderRadius: "5px",
                                    height: "45px",
                                }}
                            >
                                <form action="" className="d-flex">
                                    <input
                                        className="form-check-input me-1"
                                        type="radio"
                                        name="flexRadioDefault"
                                        id="flexRadioDefault"

                                        // checked: nếu muốn như mẫu thì bỏ cmt(check để tự động chọn mà ko cần ng dùng bấm chọn)
                                    />
                                    <div className="d-flex">
                                        {" "}
                                        <p
                                            style={{
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            chuyển phát nhanh
                                        </p>
                                        <p style={{ marginLeft: "90px" }}>
                                            45.000đ
                                        </p>
                                    </div>
                                </form>
                            </div>
                            {/* thanh toán */}
                            <div className="mt-4">
                                <h2
                                    className="fw-bolder"
                                    style={{ fontSize: "20px" }}
                                >
                                    Thanh toán
                                </h2>
                                <form action="" className="mt-3">
                                    <div
                                        style={{
                                            border: "1px solid #C0C0C0",
                                            padding: "10px",
                                            paddingBottom: "40px",
                                            borderTopLeftRadius: "5px",
                                            borderStartEndRadius: "5px",
                                            height: "45px",
                                        }}
                                    >
                                        <input
                                            className="form-check-input me-1 "
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="flexRadioDefault1"
                                            onClick={() => setBank(1)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="flexRadioDefault1"
                                        >
                                            Chuyển khoản qua ngân hàng{" "}
                                            <i
                                                className="fa-regular fa-money-bill-1 text-danger"
                                                style={{
                                                    fontSize: "20px",
                                                    marginLeft: "80px",
                                                }}
                                            ></i>
                                        </label>
                                    </div>
                                    <div
                                        style={{
                                            backgroundColor: "#EEEEEE",
                                            padding: "30px 10px",
                                            borderEndStartRadius: "5px",
                                            borderBottomRightRadius: "5px",
                                            display:
                                                bank === 1 ? "block" : "none",
                                        }}
                                    >
                                        <p>
                                            Quý Khách vui lòng ghi rõ nội dung
                                            chuyển tiền :
                                        </p>
                                       
                                        <p>★ TÊN + MÃ ĐƠN HÀNG</p>
                                       
                                        <p>
                                            Nhận được chuyển khoản shop sẽ gửi
                                            email thông báo xác nhận thanh toán
                                            và đóng gói / gửi hàng ngay .
                                        </p>
                                       
                                        <p>
                                            Ngân hàng TMCP Công thương Việt Nam
                                        </p>
                                        <p>NGUYEN DUC DUNG </p>
                                        <p>103004408358</p>
                                    </div>
                                    <div
                                        style={{
                                            border: "1px solid #C0C0C0",
                                            padding: "10px",
                                            paddingBottom: "40px",
                                            borderEndStartRadius: "5px",
                                            borderBottomRightRadius: "5px",
                                            height: "45px",
                                        }}
                                    >
                                        <input
                                            className="form-check-input me-1"
                                            type="radio"
                                            name="flexRadioDefault"
                                            id="flexRadioDefault2"
                                            onClick={() => setBank(2)}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="flexRadioDefault2"
                                        >
                                            Thanh toán khi nhận hàng (COD)
                                            <i
                                                className="fa-regular fa-money-bill-1 text-danger"
                                                style={{
                                                    fontSize: "20px",
                                                    marginLeft: "65px",
                                                }}
                                            ></i>
                                        </label>
                                    </div>
                                    <div
                                        style={{
                                            backgroundColor: "#EEEEEE",
                                            padding: "20px 10px",
                                            borderEndStartRadius: "5px",
                                            borderBottomRightRadius: "5px",
                                            display:
                                                bank === 2 ? "block" : "none",
                                        }}
                                    >
                                        <p>
                                            Thanh toán khi nhận hàng Thời gian
                                        </p>
                                        <p>nhận hàng Dự kiến 2-4 ngày .</p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                {/* right */}
                <div
                    className="pt-3"
                    style={{
                        width: "35%",
                        backgroundColor: "#EEEEEEE",// mã màu chuẩn #fafafa
                        paddingLeft: "25px",
                    }}
                >
                    <p className="fs-5 fw-bolder mb-4">Đơn hàng (5 sản phẩm)</p>
                    {/* product order */}
                    <div
                        className="py-3"
                        style={{
                            borderTop: "1px solid #C0C0C0",
                            borderBottom: "1px solid #C0C0C0",
                            width: "400px",
                            maxHeight: "200px",
                            overflow: "hidden",
                            overflowY: "scroll",
                            scrollbarWidth: "thin",
                        }}
                    >
                        {/* sẩn phẩm 1 */}
                        <div
                            className="d-flex align-items-center "
                            style={{ fontSize: "13px",marginBottom:"-10px" }}
                        >
                            {/* img */}
                            <div
                                className="position-relative"
                                style={{ width: "100px" }}
                            >
                                <img
                                    src="https://bizweb.dktcdn.net/thumb/thumb/100/347/891/products/781-jpeg.jpg?v=1640953694857"
                                    alt=""
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        border: "1px solid #C0C0C0",
                                        borderRadius: "5px",
                                    }}
                                />
                                <p
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "white",
                                    }}
                                >
                                    1
                                </p>
                            </div>
                            {/* name sản phẩm  */}
                            <div
                                className=""
                                style={{ marginLeft: "-30px", width: "230px" }}
                            >
                                <p>
                                    Quần TB Striped Arm Band Black Trouser cx2
                                </p>
                                <p style={{marginTop: "-15px"}}>28</p>
                            </div>
                            {/* price sản phẩm  */}
                            <p style={{ marginLeft: "60px" }}>440.000₫</p>
                        </div>
                        {/* sẩn phẩm 2 */}
                        <div
                            className="d-flex align-items-center "
                            style={{ fontSize: "13px",marginBottom:"-10px" }}
                        >
                            {/* img */}
                            <div
                                className="position-relative"
                                style={{ width: "100px" }}
                            >
                                <img
                                    src="https://bizweb.dktcdn.net/thumb/thumb/100/347/891/products/781-jpeg.jpg?v=1640953694857"
                                    alt=""
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        border: "1px solid #C0C0C0",
                                        borderRadius: "5px",
                                    }}
                                />
                                <p
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "white",
                                    }}
                                >
                                    1
                                </p>
                            </div>
                            {/* name sản phẩm  */}
                            <div
                                className=""
                                style={{ marginLeft: "-30px", width: "230px" }}
                            >
                                <p>
                                    Quần TB Striped Arm Band Black Trouser cx2
                                </p>
                                <p style={{marginTop: "-15px"}}>28</p>
                            </div>
                            {/* price sản phẩm  */}
                            <p style={{ marginLeft: "60px" }}>440.000₫</p>
                        </div>
                        {/* sẩn phẩm 3 */}
                        <div
                            className="d-flex align-items-center "
                            style={{ fontSize: "13px",marginBottom:"-10px" }}
                        >
                            {/* img */}
                            <div
                                className="position-relative"
                                style={{ width: "100px" }}
                            >
                                <img
                                    src="https://bizweb.dktcdn.net/thumb/thumb/100/347/891/products/781-jpeg.jpg?v=1640953694857"
                                    alt=""
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        border: "1px solid #C0C0C0",
                                        borderRadius: "5px",
                                    }}
                                />
                                <p
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "white",
                                    }}
                                >
                                    1
                                </p>
                            </div>
                            {/* name sản phẩm  */}
                            <div
                                className=""
                                style={{ marginLeft: "-30px", width: "230px" }}
                            >
                                <p>
                                    Quần TB Striped Arm Band Black Trouser cx2
                                </p>
                                <p style={{marginTop: "-15px"}}>28</p>
                            </div>
                            {/* price sản phẩm  */}
                            <p style={{ marginLeft: "60px" }}>440.000₫</p>
                        </div>
                         {/* sẩn phẩm 3 */}
                         <div
                            className="d-flex align-items-center "
                            style={{ fontSize: "13px",marginBottom:"-10px" }}
                        >
                            {/* img */}
                            <div
                                className="position-relative"
                                style={{ width: "100px" }}
                            >
                                <img
                                    src="https://bizweb.dktcdn.net/thumb/thumb/100/347/891/products/781-jpeg.jpg?v=1640953694857"
                                    alt=""
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        border: "1px solid #C0C0C0",
                                        borderRadius: "5px",
                                    }}
                                />
                                <p
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "white",
                                    }}
                                >
                                    1
                                </p>
                            </div>
                            {/* name sản phẩm  */}
                            <div
                                className=""
                                style={{ marginLeft: "-30px", width: "230px" }}
                            >
                                <p>
                                    Quần TB Striped Arm Band Black Trouser cx2
                                </p>
                                <p style={{marginTop: "-15px"}}>28</p>
                            </div>
                            {/* price sản phẩm  */}
                            <p style={{ marginLeft: "60px" }}>440.000₫</p>
                        </div>
                         {/* sẩn phẩm 3 */}
                         <div
                            className="d-flex align-items-center "
                            style={{ fontSize: "13px",marginBottom:"-10px" }}
                        >
                            {/* img */}
                            <div
                                className="position-relative"
                                style={{ width: "100px" }}
                            >
                                <img
                                    src="https://bizweb.dktcdn.net/thumb/thumb/100/347/891/products/781-jpeg.jpg?v=1640953694857"
                                    alt=""
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        objectFit: "cover",
                                        border: "1px solid #C0C0C0",
                                        borderRadius: "5px",
                                    }}
                                />
                                <p
                                    style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        color: "white",
                                    }}
                                >
                                    1
                                </p>
                            </div>
                            {/* name sản phẩm  */}
                            <div
                                className=""
                                style={{ marginLeft: "-30px", width: "230px" }}
                            >
                                <p>
                                    Quần TB Striped Arm Band Black Trouser cx2
                                </p>
                                <p style={{marginTop: "-15px"}}>28</p>
                            </div>
                            {/* price sản phẩm  */}
                            <p style={{ marginLeft: "60px" }}>440.000₫</p>
                        </div>
                    </div>
                    {/* mã giảm giá */}
                    <div
                        className="py-3 pl-5"
                        style={{
                            borderBottom: "1px solid #C0C0C0",
                            width: "400px",
                        }}
                    >
                        <form action="" className="d-flex">
                            <input
                                type="text"
                                className="form-control me-2"
                                placeholder="Nhập mã giảm giá"
                                style={{ height: "50px", width: "250px" }}
                            />
                            <button
                                className="btn btn-warning"
                                style={{ height: "48px" }}
                            >
                                Áp Dụng{" "}
                            </button>
                        </form>
                    </div>
                    {/* tiền thanh toán */}
                    <div
                        className="py-3 pl-5"
                        style={{
                            borderBottom: "1px solid #C0C0C0",
                            width: "400px",
                        }}
                    >
                        <div className="d-flex justify-content-between mb-3">
                            <p>Tạm Tính</p>
                            <p>1.440.000₫</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p>Phí Vận Chuyển</p>
                            <p>40.000₫</p>
                        </div>
                    </div>
                    {/* tổng tiền*/}
                    <div
                        className="py-3 pl-5"
                        style={{
                            borderBottom: "1px solid #C0C0C0",
                            width: "400px",
                        }}
                    >
                        <div className="d-flex justify-content-between mb-2">
                            <p>Tổng cộng</p>
                            <p>1.000.000₫</p>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <p className="text-danger">
                                &#60; Quay về giỏ hàng
                            </p>
                            <button
                                className="btn btn-warning"
                                style={{ height: "48px", width: "120px" }}
                            >
                                Áp Dụng{" "}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckOut;
