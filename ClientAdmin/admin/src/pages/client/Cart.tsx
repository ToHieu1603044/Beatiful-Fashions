import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCart, deleteCartItem } from "../../services/homeService";
import Swal from 'sweetalert2';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Cart = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        setLoading(true);
        try {
            const response = await getCart();
            const cartData = response.data.data.map((item) => ({
                ...item,
                quantity: item.quantity || 1,
            }));
            setProducts(cartData);
            console.log(cartData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
                Swal.fire({
                    title: "Lỗi!",
                    text: "Không thể tải giỏ hàng. Vui lòng thử lại!",
                    icon: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((itemId) => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const handleQuantityChange = async (id, newQuantity) => {
        const product = products.find((item) => item.id === id);
        if (!product || newQuantity < 1) return;

        try {
            const response = await updateCart({ quantity: newQuantity }, id);
            setProducts((prevProducts) =>
                prevProducts.map((item) =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
            if (response.data.status === "success") {
                fetchCarts();
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng:", error);
            Swal.fire({
                title: "Lỗi!",
                text: "Không thể cập nhật số lượng. Vui lòng thử lại!",
                icon: "error",
            });
        }
    };

    const handleRemoveItem = async (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Sản phẩm này sẽ bị xóa khỏi giỏ hàng!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Xóa!",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteCartItem(id);
                    setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));
                    setSelectedItems((prevSelected) => prevSelected.filter((itemId) => itemId !== id));
                    Swal.fire({
                        title: "Đã xóa!",
                        text: "Sản phẩm đã được xóa khỏi giỏ hàng.",
                        icon: "success",
                    });
                } catch (error) {
                    console.error("Lỗi khi xóa sản phẩm:", error);
                    Swal.fire({
                        title: "Lỗi!",
                        text: "Không thể xóa sản phẩm. Vui lòng thử lại!",
                        icon: "error",
                    });
                }
            }
        });
    };

    const renderEmptyCart = () => (
        <div className="empty-cart" style={{ textAlign: "center", marginTop: "50px" }}>
            <img
                src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/cart/9bdd8040b334d31946f0.png"
                alt="Giỏ hàng trống"
                style={{ width: "150px", marginBottom: "20px" }}
            />
            <p style={{ fontSize: "18px", fontWeight: "500", marginBottom: "20px" }}>
                Giỏ hàng của bạn còn trống
            </p>
            <Link
                to="/"
                className="btn btn-danger text-uppercase"
                style={{ padding: "10px 30px", borderRadius: "5px" }}
            >
                Mua sắm ngay
            </Link>
        </div>
    );

    const renderSkeleton = () => (
        <div>
            {[...Array(3)].map((_, index) => (
                <div key={index} className="d-flex" style={{ borderBottom: "1px solid #ccc", padding: "15px 0" }}>
                    <Skeleton width={100} height={180} style={{ margin: "0 10px" }} />
                    <div style={{ flex: 1 }}>
                        <Skeleton width="60%" height={20} style={{ marginBottom: "10px" }} />
                        <Skeleton width="40%" height={15} />
                    </div>
                    <Skeleton width={100} height={50} style={{ margin: "100px 20px 0" }} />
                    <Skeleton width={100} height={20} style={{ margin: "110px 20px 0" }} />
                    <Skeleton circle width={20} height={20} style={{ margin: "110px 10px 0" }} />
                </div>
            ))}
        </div>
    );

    return (
        <div className="w-100" style={{ marginBottom: "50px" }}>
            <div style={{ backgroundColor: "#efefef" }}>
                <div className="d-flex align-items-center" style={{ fontSize: "13px", height: "40px", paddingLeft: "100px" }}>
                    <Link to="/" className="nav-link" style={{ marginRight: "20px" }}>
                        Trang chủ
                    </Link>{" "}
                    &gt;
                    <span style={{ marginLeft: "20px" }}>Giỏ hàng</span>
                </div>
            </div>

            <div className="container-sm" style={{ padding: "0px 50px" }}>
                <p className="text-uppercase" style={{ fontSize: "30px", fontWeight: "700", marginTop: "50px", marginBottom: "30px" }}>
                    Giỏ Hàng
                </p>

                <div className="w-100 d-flex">
                    <div style={{ width: "68%", marginRight: "30px" }}>
                        <div className="d-flex" style={{ padding: "10px 20px", borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
                            <p style={{ marginRight: "350px" }}>Sản phẩm</p>
                            <p style={{ marginRight: "140px" }}>Số lượng</p>
                            <p style={{ marginRight: "40px" }}>Tổng tiền</p>
                            <p>Thao tác</p>
                        </div>

                        {loading ? (
                            renderSkeleton()
                        ) : products.length === 0 ? (
                            renderEmptyCart()
                        ) : (
                            <div>
                                {products.map((item) => {
                                    const isDisabled = !item.product.active || item.product.deleted_at !== null;

                                    return (
                                        <div key={item.id}>
                                            <div className="d-flex" style={{ borderBottom: "1px solid #ccc", position: "relative", opacity: isDisabled ? 0.6 : 1 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleSelectItem(item.id)}
                                                    style={{ marginTop: "38px", marginLeft: "15px" }}
                                                    disabled={isDisabled}
                                                />
                                                <a href={`products/${item.product.id}/detail`}>
                                                    <img
                                                        src={item.product.images ? `http://127.0.0.1:8000/storage/${item.product.images}` : "https://placehold.co/50x50"}
                                                        alt={item.product.name}
                                                        style={{ width: "100px", height: "180px", objectFit: "contain", margin: "15px 10px 10px" }}
                                                    />
                                                </a>
                                                <div style={{ marginLeft: "-20px", marginTop: "40px", fontSize: "15px", position: "absolute", left: "30%" }}>
                                                    <a style={{ color: "black", textDecoration: "none" }} href={`products/${item.product.id}/detail`}>
                                                        <p>{item.product.name}</p>
                                                    </a>
                                                    <p className="mt-2">
                                                        {item.attributes.map((attr) => (
                                                            <span key={attr.id}>
                                                                {attr.attribute}: {attr.value}{" "}
                                                                {attr.price}
                                                            </span>
                                                        ))}
                                                    </p>
                                                    {isDisabled && (
                                                        <p style={{ color: "red", fontSize: "13px" }}>
                                                            Sản phẩm không tồn tại.
                                                        </p>
                                                    )}
                                                </div>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    height: "50px",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "30px",
                                                    marginTop: "100px",
                                                    marginLeft: "270px",
                                                    opacity: isDisabled ? 0.5 : 1,
                                                    pointerEvents: isDisabled ? "none" : "auto",
                                                }}>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        style={{
                                                            padding: "5px 0px 5px 10px",
                                                            background: "white",
                                                            border: "none",
                                                            cursor: item.quantity > 1 ? "pointer" : "not-allowed"
                                                        }}
                                                        disabled={item.quantity <= 1 || isDisabled}
                                                    >
                                                        {"<"}
                                                    </button>
                                                    <span style={{
                                                        minWidth: "30px",
                                                        textAlign: "center",
                                                        border: "1px solid #ccc",
                                                        height: "50px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        width: "60px",
                                                    }}>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        style={{
                                                            padding: "5px 10px 5px 0px",
                                                            border: "none",
                                                            background: "white",
                                                            cursor: "pointer"
                                                        }}
                                                        disabled={isDisabled}
                                                    >
                                                        {">"}
                                                    </button>
                                                </div>
                                                <div style={{ margin: "110px 0px 0px 50px", width: "100px" }}>
                                                    <p>
                                                        {((item.price - item.sale_price) * item.quantity).toLocaleString()} VNĐ
                                                    </p>
                                                </div>
                                                <div
                                                    style={{ margin: "110px 0px 0px -10px", cursor: "pointer" }}
                                                    onClick={() => handleRemoveItem(item.id)}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div style={{ width: "30%", height: "130px", border: "1px solid #ccc" }}>
                        <table className="table table-borderless text-center">
                            <thead>
                                <tr>
                                    <td>Tổng tiền</td>
                                    <td>
                                        {products
                                            .filter((item) => selectedItems.includes(item.id))
                                            .reduce(
                                                (total, item) => total + (item.price - item.sale_price) * item.quantity,
                                                0
                                            )
                                            .toLocaleString()} VNĐ
                                    </td>
                                </tr>
                            </thead>
                            <tbody style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", height: "30px" }}>
                                <tr>
                                    <td colSpan={2}>
                                        <button
                                            className="btn btn-dark"
                                            style={{ width: "150px", padding: "10px", borderRadius: "30px" }}
                                            onClick={() => {
                                                if (selectedItems.length === 0) {
                                                    Swal.fire({
                                                        title: "Lỗi!",
                                                        text: "Vui lòng chọn ít nhất một sản phẩm để thanh toán!",
                                                        icon: "error",
                                                        confirmButtonText: "OK",
                                                    });
                                                    return;
                                                }
                                                navigate("/checkout", {
                                                    state: {
                                                        selectedItems: products.filter((p) => selectedItems.includes(p.id)),
                                                    },
                                                });
                                            }}
                                            disabled={loading}
                                        >
                                            Thanh Toán
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <Link
                        to="/"
                        className="text-uppercase btn btn-dark py-3 mt-5"
                        style={{ borderRadius: "30px", width: "240px", marginLeft: "200px" }}
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;