import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getCart, updateCart, deleteCartItem } from "../../services/homeService";
import Swal from 'sweetalert2'
const Cart = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        fetchCarts();
    }, []);
    const handleSelectItem = (id: number) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter(itemId => itemId !== id)
                : [...prevSelected, id]
        );
    };

    const fetchCarts = async () => {
        try {
            const response = await getCart();
            console.log('Resss', response.data);
            const cartData = response.data.data.map((item) => ({
                ...item,
                quantity: item.quantity || 1,
            }));
            console.log('Resss', response.data);
            setProducts(cartData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
            }
        }
    };


    const handleQuantityChange = async (id: number, newQuantity: number) => {
        const product = products.find(item => item.id === id);
        if (!product) return;

        // if (newQuantity > product.product.stock) {
        //     alert(`Sản phẩm ${product.product.name} chỉ còn ${product.product.stock} trong kho.`);
        //     return;
        // }

        // if (newQuantity < 1) return;

        try {
            const response = await updateCart({ quantity: newQuantity }, id);
            setProducts((prevProducts) =>
                prevProducts.map((item) =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
            console.log('Resss', response.data);
            if (response.data.status === "success") {
                fetchCarts();
            }
        } catch (error) {
            alert(error)
            console.log(error);

        }
    };

    const handleRemoveItem = async (id: number) => {
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


    return (
        <div className="w-100" style={{ marginBottom: "50px" }}>
            <div className="" style={{ backgroundColor: "#efefef" }}>
                <div className="d-flex align-items-center" style={{ fontSize: "13px", height: "40px", paddingLeft: "100px" }}>
                    <Link to="/" className="nav-link" style={{ marginRight: "20px" }}>Trang chủ</Link> &#62;
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

                        <div>
                            {products.map((item: any) => {
                                const isDisabled = !item.product.active || item.product.deleted_at !== null;

                                return (
                                    <div key={item.id}>
                                        <div className="d-flex" style={{ borderBottom: "1px solid #ccc", position: "relative", opacity: isDisabled ? 0.6 : 1 }}>
                                            <a href={`products/${item.product.id}/detail`}>
                                                <img
                                                    src={item.product.images ? `http://127.0.0.1:8000/storage/${item.product.images}` : "https://placehold.co/50x50"}
                                                    alt=""
                                                    style={{ width: "100px", height: "180px", objectFit: "contain", margin: "15px 10px 10px" }}
                                                />
                                            </a>

                                            <div style={{ marginLeft: "-20px", marginTop: "40px", fontSize: "15px", position: "absolute", left: "30%" }}>
                                                <a style={{ color: "black", textDecoration: "none" }} href={`products/${item.product.id}/detail`}>
                                                    <p>{item.product.name}</p>
                                                </a>

                                                <p className="mt-2">
                                                    {item.attributes.map((attr: any) => (
                                                        <span key={attr.id}>{attr.attribute}: {attr.value}{" "}{attr.price}</span>
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
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={() => handleSelectItem(item.id)}
                                                style={{ marginTop: '38px', left: '0px', marginLeft: '15px' }}

                                                disabled={!item.product.active || item.product.deleted_at !== null}
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
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
                                                (total, item) =>
                                                    total + (item.price - item.sale_price) * item.quantity,
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
                                            onClick={() =>
                                                navigate("/checkout", {
                                                    state: {
                                                        selectedItems: products.filter((p) => selectedItems.includes(p.id)),
                                                    },
                                                })
                                            }
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
                    <Link to={"/"} className="text-uppercase btn btn-dark py-3 mt-5" style={{ borderRadius: "30px", width: "240px", marginLeft: "200px" }} >Tiếp tục mua sắm</Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
