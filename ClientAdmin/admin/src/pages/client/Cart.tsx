import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, updateCart, deleteCartItem } from "../../services/homeService";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCarts();
    }, []);

    const fetchCarts = async () => {
        try {
            const response = await getCart();
            const cartData = response.data.data.map((item) => ({
                ...item,
                quantity: item.quantity || 1,
            }));

            setProducts(cartData);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate("/login");
            } else {
                console.error("Lỗi khi lấy giỏ hàng:", error);
            }
        }
    };

    // ✅ Cập nhật số lượng sản phẩm
    const handleQuantityChange = async (id: number, newQuantity: number) => {
        const product = products.find(item => item.id === id);
        if (!product) return;

        if (newQuantity > product.product.stock) {
            alert(`Sản phẩm ${product.product.name} chỉ còn ${product.product.stock} trong kho.`);
            return;
        }

        if (newQuantity < 1) return;

        try {
            await updateCart({ quantity: newQuantity }, id);
            setProducts((prevProducts) =>
                prevProducts.map((item) =>
                    item.id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (error) {
            console.error("Lỗi khi cập nhật giỏ hàng:", error);
        }
    };

    // ✅ Xóa sản phẩm khỏi giỏ hàng
    const handleRemoveItem = async (id: number) => {
        const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?");
        if (!isConfirmed) return;
    
        try {
            await deleteCartItem(id);
            setProducts((prevProducts) => prevProducts.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
        }
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
                            <p style={{ marginRight: "400px" }}>Sản phẩm</p>
                            <p style={{ marginRight: "140px" }}>Số lượng</p>
                            <p style={{ marginRight: "40px" }}>Tổng tiền</p>
                            <p>Xóa</p>
                        </div>

                        <div>
                            {products.map((item: any) => (
                                <div key={item.id}>
                                    <div className="d-flex" style={{ borderBottom: "1px solid #ccc", position: "relative" }}>
                                        <img
                                            src={item.product.images ? `http://127.0.0.1:8000/storage/${item.product.images}` : "https://placehold.co/50x50"}
                                            alt=""
                                            style={{ width: "190px", height: "230px", objectFit: "contain", margin: "15px 10px 10px" }}
                                        />
                                        <div style={{ marginLeft: "-20px", marginTop: "40px", fontSize: "15px", position: "absolute", left: "30%" }}>
                                            <p>{item.product.name}</p>
                                            <p className="mt-2">
                                                {item.attributes.map((attr: any) => (
                                                    <span key={attr.id}>{attr.attribute}: {attr.value}{" "}</span>
                                                ))}
                                            </p>
                                            <p>{item.price} VNĐ</p>
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
                                        }}>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                style={{ padding: "5px 0px 5px 10px", background: "white", border: "none", cursor: item.quantity > 1 ? "pointer" : "not-allowed" }}
                                                disabled={item.quantity <= 1}
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
                                                style={{ padding: "5px 10px 5px 0px", border: "none", background: "white", cursor: "pointer" }}
                                            >
                                                {">"}
                                            </button>
                                        </div>

                                        <div style={{ margin: "110px 0px 0px 50px", width: "100px" }}>
                                            <p>{item.price * item.quantity} VNĐ</p>
                                        </div>

                                        <div 
                                            style={{ margin: "110px 0px 0px 10px", cursor: "pointer" }} 
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            <i className="fa-solid fa-trash-can"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ width: "30%", height: "130px", border: "1px solid #ccc" }}>
                        <table className="table table-borderless text-center">
                            <thead>
                                <tr>
                                    <td>Tổng tiền</td>
                                    <td>{products.reduce((total, item) => total + item.price * item.quantity, 0)} VNĐ</td>
                                </tr>
                            </thead>
                            <tbody style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", height: "30px" }}>
                                <tr>
                                    <td colSpan={2}>
                                        <Link to="/checkout">
                                            <button className="btn btn-dark" style={{ width: "150px", padding: "10px", borderRadius: "30px" }}>Thanh Toán</button>
                                        </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <button className="text-uppercase btn btn-dark py-3" style={{ borderRadius: "30px", width: "240px", marginLeft: "200px" }}>Tiếp tục mua sắm</button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
