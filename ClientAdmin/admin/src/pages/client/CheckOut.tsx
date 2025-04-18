import axios from "axios";
import React, { useEffect, useState } from "react";
import { fetchDiscountOptions, getCart } from "../../services/homeService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import Swal from 'sweetalert2'
import { set } from "react-hook-form";

const CheckOut = () => {
    const userJson = localStorage.getItem("users");
    const user = userJson ? JSON.parse(userJson) : null;
    const [bank, setBank] = useState<undefined | number>();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountedTotal, setDiscountedTotal] = useState(0);
    const [products, setProducts] = useState([]);
    const [priceDiscount, setPriceDiscount] = useState(0);
    const [isGHNSelected, setIsGHNSelected] = useState(false);
    const [priceShipping, setPriceShipping] = useState(45000);
    const [showDiscountModal, setShowDiscountModal] = useState(false);

    const [discountOptions, setDiscountOptions] = useState([]);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        phone: "",
        address: "",
        discount: "",
        total_amount: discountedTotal + priceShipping,
        payment_method: "",
        note: "",
        province: "",
        city: "",
        district: "",
        district_name: "",
        ward: ""

    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchCarts();
    }, []);
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            total_amount: discountedTotal
        }));
    }, [discountedTotal]);

    const fetchCarts = async () => {
        try {
            const response = await getCart();
            const cartData = response.data.data.map(item => ({
                ...item,
                quantity: item.quantity || 1,
            }));
            setProducts(cartData);
            calculateTotal(cartData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
            } else {
                toast.error("Lỗi khi lấy giỏ hàng. Vui lòng thử lại!");
                console.error("Lỗi khi lấy giỏ hàng:", error);
            }
        }
    };
    useEffect(() => {
        const fetchDiscountOption = async () => {
            try {
                const response = await fetchDiscountOptions()
                setDiscountOptions(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching discount options:", error);
            }
        }
        fetchDiscountOption();
    }, []);


    useEffect(() => {
        axios
            .get("http://127.0.0.1:8000/api/ghn/provinces")
            .then((res) => setProvinces(res.data))
            .catch((err) => console.error("Error fetching provinces:", err));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios
                .post("http://127.0.0.1:8000/api/ghn/districts", {
                    province_id: selectedProvince,
                })
                .then((res) => setDistricts(res.data))
                .catch((err) => console.error("Error fetching districts:", err));
        }
    }, [selectedProvince]);


    useEffect(() => {
        if (selectedDistrict) {
            axios
                .post("http://127.0.0.1:8000/api/ghn/wards", {
                    district_id: selectedDistrict,
                })
                .then((res) => setWards(res.data))
                .catch((err) => console.error("Error fetching wards:", err));
        }
    }, [selectedDistrict]);
    const calculateShippingFee = async () => {
        try {
            // Validate required fields
            if (!selectedProvince || !selectedDistrict || !selectedWard) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Vui lòng chọn đầy đủ địa chỉ giao hàng",
                    icon: "error",
                    confirmButtonText: "OK",
                });
                return;
            }
            if (!selectedDistrict || !selectedWard || typeof selectedWard !== 'string') {
                console.error("Thông tin địa chỉ không hợp lệ");
                return;
            }

            const payload = {
                from_district_id: 201,
                service_id: 53322,
                to_district_id: selectedDistrict,
                to_ward_code: selectedWard,
                height: 5,
                length: 5,
                width: 5,
                weight: 1000,
                insurance_value: discountedTotal
            };

            const response = await axios.post(
                "http://127.0.0.1:8000/api/ghn/calculate-fee",
                payload
            );
            console.log("Shipping fee response:", response.data);
            if (response.data && response.data.data) {
                const shippingFee = response.data.data.total;
                setPriceShipping(shippingFee);

                setFormData(prev => ({
                    ...prev,
                    total_amount: discountedTotal + shippingFee
                }));

                toast.success("Đã tính phí vận chuyển thành công!");
            }

        } catch (error) {
            console.error("Error calculating shipping fee:", error);
            toast.error("Lỗi khi tính phí vận chuyển. Vui lòng thử lại!");
        }
    };
    useEffect(() => {
        if (isGHNSelected && selectedProvince && selectedDistrict && selectedWard) {
            calculateShippingFee();
        }
    }, [selectedProvince, selectedDistrict, selectedWard]);

    const calculateTotal = (items: any[]) => {
        const total = items.reduce((sum, item) => sum + (item.price - item.sale_price) * item.quantity, 0);
        console.log("Total amount:", total);

        setTotalAmount(total);
        setDiscountedTotal(total);
    };

    const applyDiscount = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Mã giảm giá gửi đi:", formData.discount);

        if (!formData.discount) {
            Swal.fire({
                title: "Lỗi!",
                text: "Vui lòng nhập mã giảm giá.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
        console.log("Products:", products);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/discounts/apply", {
                discountCode: formData.discount,
                totalAmount: totalAmount,
                cartData: products

            }, {
                headers: { "Content-Type": "application/json" },
            });

            console.log("Response data:", response.data);

            const discount = response.data.discountAmount || 0;
            console.log("Discount amount:", discount);
            const newTotal = Math.max(totalAmount - discount, 0);

            setDiscountedTotal(newTotal);
            setPriceDiscount(discount);

            Swal.fire({
                title: "Thành công!",
                text: response.data.message || "Giảm giá áp dụng thành công!",
                icon: "success",
                confirmButtonText: "OK",
            });

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá. Vui lòng thử lại!";

            Swal.fire({
                title: "Lỗi!",
                text: errorMessage,
                icon: "error",
                confirmButtonText: "OK",
            });

            console.error("Error applying discount:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Dữ liệu đã gửi:", JSON.stringify({ ...formData, priceDiscount, priceShipping }, null, 2));

        try {
            const response = await axiosInstance.post('/orders', {
                ...formData,
                priceShipping,
                priceDiscount
            }, {
                headers: { 'Content-Type': 'application/json' },
            });

            console.log("Response từ backend:", response.data);

            if (response.data.payUrl) {
                console.log("🔗 Chuyển hướng đến MoMo:", response.data.payUrl);
                window.open(response.data.payUrl, "_self");
                return;
            }

            if (response.status === 200) {
                Swal.fire({
                    title: "Đặt hàng thành công",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {

                });
            }

        } catch (error: any) {
            console.error("Lỗi khi gửi dữ liệu:", error);
            Swal.fire({
                title: "Lỗi!",
                text: error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };


    return (
        <>
            <div
                className="w-100 d-flex"
                style={{
                    pointerEvents: !user ? "none" : "auto",
                    opacity: !user ? 0.6 : 1,
                    cursor: !user ? "not-allowed" : "auto",
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
                                            {/* <i className="fa-regular fa-circle-user me-1"></i>
                                            <span>Đăng nhập </span> */}
                                        </p>
                                    </>
                                )}
                            </div>
                            {/* form */}
                            <div
                                className="mt-3"
                                style={{
                                    pointerEvents: !user ? "none" : "auto",
                                    opacity: !user ? 0.6 : 1,
                                    cursor: !user ? "not-allowed" : "auto",
                                }}
                            >
                                <form onSubmit={handleSubmit}>
                                    {/* email */}
                                    <div className="mb-3">
                                        <input type="text" className="form-control" placeholder="Email"
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            style={{
                                                height: "45px",
                                                pointerEvents: !user ? "none" : "none",
                                                opacity: !user ? 0.6 : 1,
                                                cursor: !user ? "not-allowed" : "auto",
                                            }}
                                            value={user ? user.email : ""}
                                        />
                                    </div>
                                    {/* họ và tên */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Họ và tên"
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            style={{
                                                height: "45px",
                                                pointerEvents: !user ? "none" : "none",
                                                opacity: !user ? 0.6 : 1,
                                                cursor: !user ? "not-allowed" : "auto",
                                            }}
                                            value={user ? user.name : ""}
                                        />
                                    </div>
                                    {/* số điện thoại */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Số điện thoại"
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            style={{
                                                height: "45px",
                                                pointerEvents: !user ? "none" : "none",
                                                opacity: !user ? 0.6 : 1,
                                                cursor: !user ? "not-allowed" : "auto",
                                            }}
                                            value={user ? user.phone : ""}
                                        />
                                    </div>
                                    {/* tỉnh thành */}
                                    <div className="mb-3">
                                        <select
                                            value={selectedProvince}
                                            onChange={(e) => {
                                                const provinceId = parseInt(e.target.value);
                                                const provinceName = provinces.find(p => p.ProvinceID === provinceId)?.ProvinceName || "";

                                                setSelectedProvince(provinceId);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    province: provinceId,
                                                    city: provinceName,
                                                }));
                                            }}
                                            className="form-select"
                                        >
                                            <option value="" disabled>Chọn tỉnh thành</option>
                                            {provinces.map(province => (
                                                <option key={province.ProvinceID} value={province.ProvinceID}>
                                                    {province.ProvinceName}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    {/* Quận Huyện */}
                                    <div className="mb-3">
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => {
                                                const districtId = parseInt(e.target.value);
                                                const districtName = districts.find(d => d.DistrictID === districtId)?.DistrictName || "";

                                                setSelectedDistrict(districtId);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    district: districtId,
                                                    district_name: districtName,
                                                    ward: ""
                                                }));
                                            }}
                                            className="form-select"
                                        >
                                            <option value="" disabled>Chọn quận huyện</option>
                                            {districts.map(district => (
                                                <option key={district.DistrictID} value={district.DistrictID}>
                                                    {district.DistrictName}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    {/* Phường xã */}
                                    <div className="mb-3">
                                        <select
                                            value={selectedWard}
                                            onChange={(e) => {
                                                const wardCode = e.target.value;
                                                const wardName = wards.find(w => w.WardCode === wardCode)?.WardName || "";

                                                setSelectedWard(wardCode);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    ward: wardCode,
                                                    ward_name: wardName
                                                }));
                                            }}
                                            className="form-select"
                                        >
                                            <option value="" disabled>Chọn phường xã</option>
                                            {wards.map(ward => (
                                                <option key={ward.WardCode} value={ward.WardCode}>
                                                    {ward.WardName}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    {/* Địa chỉ */}
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Địa chỉ"
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            style={{ height: "45px" }}
                                        />
                                    </div>
                                    {/* Ghi chú */}
                                    <div className="mb-3">
                                        <textarea
                                            cols={10}
                                            rows={5}
                                            placeholder="Ghi chú"
                                            className="form-control"
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        ></textarea>
                                    </div>
                                    {/* Nút submit */}
                                    <button type="submit" className="btn btn-primary">Thanh toán</button>
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
                                        type="checkbox"
                                        name="flexRadioDefault"
                                        id="flexRadioDefault"
                                        checked={isGHNSelected}
                                        onChange={(e) => {
                                            setIsGHNSelected(e.target.checked);
                                            if (e.target.checked) {
                                                calculateShippingFee(); // Tính phí ngay khi checkbox được chọn
                                            }
                                        }}
                                    />
                                    <div className="d-flex">
                                        <p style={{ textTransform: "uppercase" }}>GHN</p>
                                        {isGHNSelected && priceShipping && (
                                            <p style={{ marginLeft: "90px" }}>
                                                <span>Phí vận chuyển: {priceShipping.toLocaleString()} VNĐ</span>
                                            </p>
                                        )}
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
                                            value={"online"}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
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
                                            value={"cod"}
                                            onClick={() => setBank(2)}
                                            onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
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
                <div className="pt-3" style={{ width: "35%", backgroundColor: "#EEEEEEE", paddingLeft: "25px" }}>
                    <p className="fs-5 fw-bolder mb-4">Đơn hàng ({products.length} sản phẩm)</p>
                    <div className="py-3" style={{ borderTop: "1px solid #C0C0C0", borderBottom: "1px solid #C0C0C0", maxHeight: "200px", overflowY: "scroll" }}>
                        {products.map((item, index) => (
                            <div key={index} className="d-flex align-items-center">
                                <div className="position-relative" style={{ width: "100px" }}>
                                    <img
                                        src={item.product.image || "https://placeholder.com/50"}
                                        alt=""
                                        style={{ width: "50px", height: "50px", objectFit: "cover", border: "1px solid #C0C0C0", borderRadius: "5px" }}
                                    />
                                    <p style={{
                                        position: "absolute",
                                        top: "-5px",
                                        right: "40px",
                                        width: "20px",
                                        height: "20px",
                                        fontSize: "12px",
                                        backgroundColor: "red",
                                        borderRadius: "50%",
                                        color: "white",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}>{item.quantity}</p>
                                </div>
                                <div style={{ marginLeft: "-30px", width: "230px" }}>
                                    <p>{item.product.name}</p>
                                    {item.product.attributes && item.product.attributes.map((attr, attrIndex) => (
                                        <p key={attrIndex} style={{ marginTop: "-15px" }}>
                                            {attr.attribute}: {attr.value}
                                        </p>
                                    ))}
                                </div>
                                <p style={{ marginLeft: "60px" }}>{(item.price - item.sale_price).toLocaleString()}₫</p>
                            </div>
                        ))}
                    </div>
                    <div className="py-3 pl-5" style={{ borderBottom: "1px solid #C0C0C0" }}>
                        <form onSubmit={applyDiscount} className="d-flex flex-column" style={{ gap: "10px" }}>
                            {/* Ô nhập mã giảm giá */}
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                style={{ height: "50px", width: "250px", textAlign: "left" }}
                                onClick={() => setShowDiscountModal(true)}
                            >
                                {formData.discount ? `Đã chọn: ${formData.discount}` : "Chọn mã giảm giá"}
                            </button>


                            {/* Select mã giảm giá có thể chọn */}
                            {showDiscountModal && (
                                <div className="modal d-block" tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Chọn mã giảm giá</h5>
                                                <button type="button" className="btn-close" onClick={() => setShowDiscountModal(false)} />
                                            </div>
                                            <div className="modal-body">
                                                {discountOptions.length === 0 ? (
                                                    <p>Không có mã giảm giá khả dụng.</p>
                                                ) : (
                                                    <div className="row">
                                                        {discountOptions.map((item) => (
                                                            <div key={item.id} className="col-md-6 mb-3">
                                                                <div
                                                                    className="card h-100 shadow-sm"
                                                                    style={{ cursor: "pointer", border: formData.discount === item.code ? "2px solid #007bff" : "" }}
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, discount: item.code });
                                                                        setShowDiscountModal(false);
                                                                    }}
                                                                >
                                                                    <div className="card-body">
                                                                        <h5 className="card-title text-primary">{item.name}</h5>
                                                                        <p className="card-text">
                                                                            <strong>Mã:</strong> {item.code} <br />
                                                                            <strong>Giảm:</strong>{" "}
                                                                            {item.value}
                                                                            {item.discount_type === "percentage" ? "%" : " VNĐ"}{" "}
                                                                            {item.max_discount && ` (Tối đa: ${item.max_discount.toLocaleString()}đ)`} <br />
                                                                            {item.min_order_amount && (
                                                                                <>
                                                                                    <strong>Đơn tối thiểu:</strong> {item.min_order_amount.toLocaleString()}đ <br />
                                                                                </>
                                                                            )}
                                                                            <strong>Hiệu lực:</strong> {item.start_date} → {item.end_date} <br />
                                                                            <strong>Đã dùng:</strong> {item.used_count}/{item.max_uses}
                                                                        </p>
                                                                    </div>
                                                                    <div className="card-footer text-end">
                                                                        <button className="btn btn-sm btn-outline-primary">
                                                                            {formData.discount === item.code ? "Đã chọn" : "Chọn"}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary" onClick={() => setShowDiscountModal(false)}>
                                                    Đóng
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Nút áp dụng */}
                            <button type="submit" className="btn btn-warning mt-2" style={{ width: "250px" }}>
                                Áp Dụng
                            </button>
                        </form>

                    </div>
                    <div className="py-3 pl-5" style={{ borderBottom: "1px solid #C0C0C0" }}>
                        <div className="d-flex justify-content-between mb-3">
                            <p>Tạm Tính</p>
                            <p>{totalAmount.toLocaleString()}₫</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p>Phí Vận Chuyển</p>
                            <p>{priceShipping.toLocaleString()}₫</p>
                        </div>
                        <div className="d-flex justify-content-between">
                            <p>Giảm Giá</p>
                            <p>{priceDiscount.toLocaleString()}₫</p>
                        </div>
                    </div>
                    <div className="py-3 pl-5" style={{ borderBottom: "1px solid #C0C0C0" }}>
                        <div className="d-flex justify-content-between mb-2">
                            <p>Tổng cộng</p>
                            <p>{(discountedTotal + priceShipping).toLocaleString()}₫</p>

                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <p className="text-danger"></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckOut;
