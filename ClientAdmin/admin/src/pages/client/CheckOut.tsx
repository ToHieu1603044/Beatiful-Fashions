import axios from "axios";
import React, { useEffect, useState } from "react";
import { fetchDiscountOptions, getUserProfile } from "../../services/homeService";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../services/axiosInstance";
import Swal from 'sweetalert2';
import { Modal, Form, message, Button, InputNumber } from 'antd';
import { applyPoints } from "../../services/orderService";


const CheckOut = () => {
    const [bank, setBank] = useState();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [form] = Form.useForm();
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
    const [showPointsModal, setShowPointsModal] = useState(false);
    const [user, setUser] = useState([]);
    const [discountOptions, setDiscountOptions] = useState([]);
    const [point, setPoint] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);

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
        ward: "",
        points: 0
    });

    const navigate = useNavigate();
    const location = useLocation();
    const selectedItems = location.state?.selectedItems || [];

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            total_amount: discountedTotal + priceShipping
        }));
    }, [discountedTotal, priceShipping]);

    useEffect(() => {
        const calculateTotal = (items) => {
            const total = items.reduce((sum, item) => sum + (item.price - (item.sale_price || 0)) * item.quantity, 0);
            setTotalAmount(total);
            setDiscountedTotal(total);
        };
        calculateTotal(selectedItems);
    }, [selectedItems]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [userRes, discountRes] = await Promise.all([
                    getUserProfile(),
                    fetchDiscountOptions()
                ]);
                const userData = userRes.data.data;
                setUser(userData);
                setPoint(userData.points);
                setFormData(prev => ({
                    ...prev,
                    email: userData.email,
                    name: userData.name,
                    phone: userData.phone,
                    city: userData.city,
                    district: userData.district,
                    ward: userData.ward
                }));
                setDiscountOptions(discountRes.data);
            } catch (error) {
                console.error("Lỗi khi load thông tin:", error);
            }
        };
        fetchAllData();
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
            if (!selectedProvince || !selectedDistrict || !selectedWard) {
                Swal.fire({
                    title: "Lỗi!",
                    text: "Vui lòng chọn đầy đủ địa chỉ giao hàng",
                    icon: "error",
                    confirmButtonText: "OK",
                });
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
    }, [selectedProvince, selectedDistrict, selectedWard, isGHNSelected]);

    const applyDiscount = async (e) => {
        e.preventDefault();
        if (!formData.discount) {
            Swal.fire({
                title: "Lỗi!",
                text: "Vui lòng nhập mã giảm giá.",
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/discounts/apply", {
                discountCode: formData.discount,
                totalAmount: totalAmount,
                priceShipping,
                cartData: products,
                selectedItems
            }, {
                headers: { "Content-Type": "application/json" },
            });
            const discount = response.data.discountAmount || 0;
            const newTotal = Math.max(totalAmount - discount, 0);
            setDiscountedTotal(newTotal);
            setPriceDiscount(discount);
            Swal.fire({
                title: "Thành công!",
                text: response.data.message || "Giảm giá áp dụng thành công!",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error) {
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

    const handleApplyPoints = async () => {
        try {
            const values = await form.validateFields();
            if (values.usedPoints > point) {
                message.error("Bạn không đủ điểm!");
                return;
            }
            const response = await applyPoints({
                total_amount: totalAmount,
                used_points: values.usedPoints,
                priceShipping,
                priceDiscount,
                selectedItems
            });
            const discount = response.data.points_discount;
            const newTotal = Math.max(totalAmount - discount, 0);
            setUsedPoints(response.data.used_points);
            setDiscountedTotal(newTotal);
            setPriceDiscount(discount);
            if (response.data.status) {
                message.success("Áp dụng điểm thành công!");
                setFormData({
                    ...formData,
                    points: response.data.used_points,
                });
                form.resetFields();
                setShowPointsModal(false);
            } else {
                message.error("Không thể áp dụng điểm.");
            }
        } catch (err) {
            console.log(err);
            message.error("Lỗi xảy ra khi áp dụng điểm!");
        }
    };

    const handleClearPoints = () => {
        setUsedPoints(0);
        setPriceDiscount(0);
        setDiscountedTotal(totalAmount);
        setFormData({
            ...formData,
            points: 0,
        });
        message.success("Đã xóa điểm đã áp dụng!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/orders', {
                ...formData,
                priceShipping,
                priceDiscount,
                selectedItems
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.data.payUrl) {
                window.open(response.data.payUrl, "_self");
                return;
            }
            if (response.status === 200) {
                Swal.fire({
                    title: "Đặt hàng thành công",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    navigate("/orders");
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Lỗi!",
                text: error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <div
            className="container"
            style={{
                pointerEvents: !user ? 'none' : 'auto',
                opacity: !user ? 0.6 : 1,
                cursor: !user ? 'not-allowed' : 'auto',
            }}
        >
            <div className="row g-4">
                {/* Left Section */}
                <div className="col-lg-8 col-md-12 checkout-left">
                    <div className="text-center mb-4">
                        <img
                            src="../../assets/logo.png"
                            alt="Shop Logo"
                            className="img-fluid checkout-logo"
                        />
                    </div>
                    <div className="row g-4">
                        {/* Thông tin nhận hàng */}
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-4 checkout-title">Thông tin nhận hàng</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input
                                        type="email"
                                        className="form-control checkout-input"
                                        placeholder="Email"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        value={formData.email}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control checkout-input"
                                        placeholder="Họ và tên"
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        value={formData.name}
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control checkout-input"
                                        placeholder="Số điện thoại"
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        value={formData.phone}
                                    />
                                </div>
                                <div className="mb-3">
                                    <select
                                        value={selectedProvince}
                                        onChange={(e) => {
                                            const provinceId = parseInt(e.target.value);
                                            const provinceName = provinces.find((p) => p.ProvinceID === provinceId)?.ProvinceName || '';
                                            setSelectedProvince(provinceId);
                                            setFormData((prev) => ({
                                                ...prev,
                                                province: provinceId,
                                                city: provinceName,
                                            }));
                                        }}
                                        className="form-select checkout-input"
                                    >
                                        <option value="" disabled>
                                            Chọn tỉnh thành
                                        </option>
                                        {provinces.map((province) => (
                                            <option key={province.ProvinceID} value={province.ProvinceID}>
                                                {province.ProvinceName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => {
                                            const districtId = parseInt(e.target.value);
                                            const districtName = districts.find((d) => d.DistrictID === districtId)?.DistrictName || '';
                                            setSelectedDistrict(districtId);
                                            setFormData((prev) => ({
                                                ...prev,
                                                district: districtId,
                                                district_name: districtName,
                                                ward: '',
                                            }));
                                        }}
                                        className="form-select checkout-input"
                                    >
                                        <option value="" disabled>
                                            Chọn quận huyện
                                        </option>
                                        {districts.map((district) => (
                                            <option key={district.DistrictID} value={district.DistrictID}>
                                                {district.DistrictName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <select
                                        value={selectedWard}
                                        onChange={(e) => {
                                            const wardCode = e.target.value;
                                            const wardName = wards.find((w) => w.WardCode === wardCode)?.WardName || '';
                                            setSelectedWard(wardCode);
                                            setFormData((prev) => ({
                                                ...prev,
                                                ward: wardCode,
                                                ward_name: wardName,
                                            }));
                                        }}
                                        className="form-select checkout-input"
                                    >
                                        <option value="" disabled>
                                            Chọn phường xã
                                        </option>
                                        {wards.map((ward) => (
                                            <option key={ward.WardCode} value={ward.WardCode}>
                                                {ward.WardName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control checkout-input"
                                        placeholder="Địa chỉ chi tiết"
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <textarea
                                        rows={4}
                                        placeholder="Ghi chú đơn hàng"
                                        className="form-control checkout-input"
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-100 checkout-btn">
                                    Thanh toán
                                </button>
                            </form>
                        </div>
                        {/* Vận chuyển & Thanh toán */}
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-4 checkout-title">Vận chuyển</h2>
                            <div className="card mb-4 checkout-card">
                                <div className="card-body d-flex align-items-center">
                                    <input
                                        className="form-check-input me-2"
                                        type="checkbox"
                                        id="ghnShipping"
                                        checked={isGHNSelected}
                                        onChange={(e) => {
                                            setIsGHNSelected(e.target.checked);
                                            if (e.target.checked) {
                                                calculateShippingFee();
                                            }
                                        }}
                                    />
                                    <label htmlFor="ghnShipping" className="form-check-label flex-grow-1">
                                        <strong>Giao Hàng Nhanh (GHN)</strong>
                                    </label>
                                    {isGHNSelected && priceShipping && (
                                        <span className="text-muted">
                                            {priceShipping.toLocaleString()} VNĐ
                                        </span>
                                    )}
                                </div>
                            </div>
                            <h2 className="fw-bold mb-4 checkout-title">Thanh toán</h2>
                            <div className="card mb-3 checkout-card">
                                <div
                                    className={`card-body d-flex align-items-center ${bank === 1 ? 'border-primary' : ''}`}
                                    onClick={() => {
                                        setBank(1);
                                        setFormData({ ...formData, payment_method: 'online' });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <input
                                        className="form-check-input me-2"
                                        type="radio"
                                        name="payment_method"
                                        checked={formData.payment_method === 'online'}
                                        readOnly
                                    />
                                    <label className="form-check-label flex-grow-1">
                                        Thanh toán MoMo
                                    </label>
                                    <i className="fa-regular fa-money-bill-1 text-danger" style={{ fontSize: '20px' }} />
                                </div>
                                {bank === 1 && (
                                    <div className="card-footer bg-light">
                                        <p className="mb-0">Vui lòng kiểm tra số tiền giao dịch.</p>
                                    </div>
                                )}
                            </div>
                            <div className="card checkout-card">
                                <div
                                    className={`card-body d-flex align-items-center ${bank === 2 ? 'border-primary' : ''}`}
                                    onClick={() => {
                                        setBank(2);
                                        setFormData({ ...formData, payment_method: 'cod' });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <input
                                        className="form-check-input me-2"
                                        type="radio"
                                        name="payment_method"
                                        checked={formData.payment_method === 'cod'}
                                        readOnly
                                    />
                                    <label className="form-check-label flex-grow-1">
                                        Thanh toán khi nhận hàng (COD)
                                    </label>
                                    <i className="fa-regular fa-money-bill-1 text-danger" style={{ fontSize: '20px' }} />
                                </div>
                                {bank === 2 && (
                                    <div className="card-footer bg-light">
                                        <p className="mb-1">Thanh toán khi nhận hàng.</p>
                                        <p className="mb-0">Thời gian nhận hàng dự kiến: 2-4 ngày.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Section */}
                <div className="col-lg-4 col-md-12 checkout-right">
                    <h3 className="fw-bold mb-4">Đơn hàng ({selectedItems.length} sản phẩm)</h3>
                    <div className="card checkout-card mb-4">
                        <div className="card-body checkout-order-list">
                            {selectedItems.map((item, index) => (
                                <div key={index} className="d-flex align-items-center mb-3">
                                    <div className="position-relative me-3">
                                        <img
                                            src={item.product.images ? `http://127.0.0.1:8000/storage/${item.product.images}` : 'https://placehold.co/50x50'}
                                            alt={item.product.name}
                                            style={{
                                                width: '50px',
                                                height: '50px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: '1px solid #dee2e6',
                                            }}
                                        />
                                        <span className="checkout-order-quantity">{item.quantity}</span>
                                    </div>
                                    <div className="flex-grow-1">
                                        <p className="mb-1 fw-medium">{item.product.name}</p>
                                        {item.attributes && item.attributes.map((attr, attrIndex) => (
                                            <p key={attrIndex} className="mb-0 text-muted small">
                                                {attr.attribute}: {attr.value}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="ms-3 fw-medium">{(item.price - item.sale_price).toLocaleString()}₫</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card checkout-card mb-4">
                        <div className="card-body">
                            <form onSubmit={applyDiscount}>
                                <div className="d-flex align-items-center mb-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary flex-grow-1"
                                        onClick={() => setShowDiscountModal(true)}
                                        disabled={usedPoints > 0}
                                    >
                                        {formData.discount ? `Mã: ${formData.discount}` : 'Chọn mã giảm giá'}
                                    </button>
                                    {formData.discount && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link text-danger ms-2"
                                            onClick={() => {
                                                setFormData({ ...formData, discount: '' });
                                                setPriceDiscount(0);
                                                setDiscountedTotal(totalAmount);
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                                <Button
                                    className="w-100"
                                    onClick={() => setShowPointsModal(true)}
                                    disabled={formData.discount}
                                >
                                    Sử dụng điểm
                                </Button>
                                {usedPoints > 0 && (
                                    <div className="alert alert-success d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <strong>{usedPoints.toLocaleString()}</strong> điểm — Giảm{' '}
                                            <strong>{priceDiscount.toLocaleString()}₫</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link text-danger"
                                            onClick={handleClearPoints}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-warning w-100 mt-3"
                                    disabled={!formData.discount || usedPoints > 0}
                                >
                                    Áp dụng mã giảm giá
                                </button>
                                {formData.discount && (
                                    <div className="alert alert-warning mt-3">
                                        Bạn đã chọn mã giảm giá. Không thể sử dụng điểm.
                                    </div>
                                )}
                                {usedPoints > 0 && (
                                    <div className="alert alert-warning mt-3">
                                        Bạn đã dùng điểm. Không thể áp dụng mã giảm giá.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                    <div className="card checkout-card">
                        <div className="card-body">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Tạm tính</span>
                                <span>{totalAmount.toLocaleString()}₫</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Phí vận chuyển</span>
                                <span>{priceShipping.toLocaleString()}₫</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Giảm giá</span>
                                <span>{priceDiscount.toLocaleString()}₫</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Tổng cộng</span>
                                <span>{(discountedTotal + priceShipping).toLocaleString()}₫</span>
                            </div>
                        </div>
                    </div>
                    <Modal
                        title="Sử dụng điểm"
                        open={showPointsModal}
                        onCancel={() => {
                            form.resetFields();
                            setShowPointsModal(false);
                        }}
                        onOk={handleApplyPoints}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Form form={form} layout="vertical">
                            <Form.Item
                                label={`Nhập số điểm muốn sử dụng (Bạn có ${point} điểm)`}
                                name="usedPoints"
                                rules={[{ required: true, message: 'Vui lòng nhập số điểm' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={point}
                                    style={{ width: '100%' }}
                                    placeholder="Ví dụ: 100"
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                    <Modal
                        title="Chọn mã giảm giá"
                        open={showDiscountModal}
                        onCancel={() => setShowDiscountModal(false)}
                        footer={[
                            <Button key="close" onClick={() => setShowDiscountModal(false)}>
                                Đóng
                            </Button>,
                        ]}
                    >
                        {discountOptions.length === 0 ? (
                            <p>Không có mã giảm giá khả dụng.</p>
                        ) : (
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div
                                        className="card h-100 shadow-sm checkout-discount-card"
                                        onClick={() => {
                                            setFormData({ ...formData, discount: '' });
                                            setShowDiscountModal(false);
                                        }}
                                    >
                                        <div className="card-body">
                                            <h5 className="card-title text-danger">
                                                Không dùng mã giảm giá
                                            </h5>
                                            <p className="card-text">
                                                Chọn nếu bạn không muốn áp dụng mã giảm giá.
                                            </p>
                                        </div>
                                        <div className="card-footer text-end">
                                            <button className="btn btn-sm btn-outline-danger">
                                                {!formData.discount ? 'Đã chọn' : 'Chọn'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                {discountOptions.map((item) => (
                                    <div key={item.id} className="col-md-6">
                                        <div
                                            className="card h-100 shadow-sm checkout-discount-card"
                                            onClick={() => {
                                                setFormData({ ...formData, discount: item.code });
                                                setShowDiscountModal(false);
                                            }}
                                        >
                                            <div className="card-body">
                                                <h5 className="card-title text-primary">{item.name}</h5>
                                                <p className="card-text">
                                                    <strong>Mã:</strong> {item.code} <br />
                                                    <strong>Giảm:</strong> {item.value}
                                                    {item.discount_type === 'percentage' ? '%' : ' VNĐ'} <br />
                                                    {item.max_discount && (
                                                        <>
                                                            <strong>Tối đa:</strong> {item.max_discount.toLocaleString()}₫ <br />
                                                        </>
                                                    )}
                                                    {item.min_order_amount && (
                                                        <>
                                                            <strong>Đơn tối thiểu:</strong> {item.min_order_amount.toLocaleString()}₫ <br />
                                                        </>
                                                    )}
                                                    <strong>Hiệu lực:</strong> {item.start_date} → {item.end_date} <br />
                                                    <strong>Đã dùng:</strong> {item.used_count}/{item.max_uses}
                                                </p>
                                            </div>
                                            <div className="card-footer text-end">
                                                <button className="btn btn-sm btn-outline-primary">
                                                    {formData.discount === item.code ? 'Đã chọn' : 'Chọn'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default CheckOut;