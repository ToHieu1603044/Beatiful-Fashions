import { Header } from "antd/es/layout/layout";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const initialProducts = [
    {
        id: 2,
        product: {
            id: 82,
            name: "Quần TB Striped Arm Band Black Trouser cx2",
            images: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/781-jpeg.jpg?v=1640953694857",
            price: 78,
        },
        quantity: 1,
        attributes: [
            {
                attribute: "Size",
                value: "S",
            },
        ],
    },
    {
        id: 3,
        product: {
            id: 80,
            name: "Áo Lak Studios Plaid Bleached Checked Flannel Shirt cs7",
            images: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/339-jpeg-0c77b62b-9d0e-413d-b881-354bcf04b0d2.jpg?v=1660228599470",
            price: 57,
        },
        quantity: 1,
        attributes: [
            {
                attribute: "Size",
                value: "L",
            },
            {
                attribute: "Color",
                value: "Blue",
            },
        ],
    },
];

const Cart = () => {
    const [cartItems, setCartItems] = useState(initialProducts);

    const handleQuantityChange = (index, newQuantity) => {
        setCartItems((prevCart) =>
            prevCart.map((item, i) =>
                i === index ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };
    const handleRemoveItem = (index) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
        if (confirmDelete) {
          setCartItems((prevCart) => prevCart.filter((_, i) => i !== index));
        }
      };

    return (
        <>
            <Header />
            <div className="w-100" style={{ marginBottom: "50px" }}>
                {/* nav cart */}
                <div style={{ backgroundColor: "#efefef" }}>
                    <div
                        className="d-flex align-items-center"
                        style={{
                            fontFamily: "'PN', sans-serif",
                            fontSize: "13px",
                            height: "40px",
                            lineHeight: "40px",
                            display: "block",
                            paddingRight: "10px",
                            color: "#999",
                            marginRight: "23px",
                            fontWeight: 300,
                            paddingLeft: "100px",
                        }}
                    >
                        <Link to="/" className="nav-link" style={{ marginRight: "20px" }}>
                            Trang chủ
                        </Link>
                        &#62;
                        <span style={{ marginLeft: "20px" }}>Giỏ hàng</span>
                    </div>
                </div>

                {/* body cart */}
                <div className="container-sm" style={{ padding: "0px 50px" }}>
                    {/* title cart */}
                    <p className="text-uppercase" style={{ fontSize: "30px", fontWeight: "700", marginTop: "50px", marginBottom: "30px" }}>
                        Giỏ Hàng
                    </p>

                    {/* content cart */}
                    <div className="w-100 d-flex">
                        <div style={{ width: "68%", marginRight: "30px" }}>
                            {/* header table cart */}
                            <div className="d-flex" style={{ padding: "10px 20px", fontSize: "14px", borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc" }}>
                                <p style={{ marginRight: "400px" }}>Sản phẩm</p>
                                <p style={{ marginRight: "140px" }}>Số lượng</p>
                                <p style={{ marginRight: "40px" }}>Tổng tiền</p>
                                <p>Xóa</p>
                            </div>

                            {/* body table cart */}
                            <div>
                                {cartItems.map((item, index) => (
                                    <div key={item.id}>
                                        <div className="d-flex" style={{ borderBottom: "1px solid #ccc", position: "relative" }}>
                                            <img src={item.product.images} alt="" style={{ width: "190px", height: "230px", objectFit: "contain", margin: "15px 10px 10px" }} />
                                            <div style={{ marginLeft: "-20px", marginTop: "40px", fontSize: "15px", position: "absolute", left: "30%" }}>
                                                <p>{item.product.name}</p>
                                                {item.attributes.map((attr) => (
                                                    <p key={attr.attribute}>
                                                        {attr.attribute}: {attr.value}
                                                    </p>
                                                ))}
                                                <p>{item.product.price}₫</p>
                                            </div>

                                            {/* nút tăng giảm số lượng */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", height: "50px", padding: "10px", border: "1px solid #ccc", borderRadius: "30px", marginTop: "100px", marginLeft: "270px" }}>
                                                <button
                                                    onClick={() => handleQuantityChange(index, item.quantity - 1)}
                                                    style={{ padding: "5px 0px 5px 10px", background: "white", cursor: item.quantity > 1 ? "pointer" : "not-allowed" }}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    {"<"}
                                                </button>
                                                <span style={{ minWidth: "30px", textAlign: "center", border: "1px solid #ccc", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", width: "60px" }}>
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(index, item.quantity + 1)}
                                                    style={{ padding: "5px 10px 5px 0px", background: "white", cursor: "pointer" }}
                                                >
                                                    {">"}
                                                </button>
                                                
                                    
                                            </div>

                                            {/* tổng tiền */}
                                            <div style={{ margin: "110px 0px 0px 50px", width: "100px" }}>
                                                <p>{item.product.price * item.quantity}₫</p>
                                            </div>
                                            {/* nút xóa giỏ hàng */}
                                            <div style={{ margin: "110px 0px 0px 10px", cursor: "pointer" }} onClick={() => handleRemoveItem(index)}>
                                             <i className="fa-solid fa-trash-can"></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tổng tiền */}
                        <div style={{ width: "30%", height: "130px", border: "1px solid #ccc" }}>
                            <table className="table table-borderless text-center">
                                <thead>
                                    <tr>
                                        <td>Tổng tiền</td>
                                        <td>{cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)}₫</td>
                                    </tr>
                                </thead>
                                <tbody style={{ borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc", height: "30px" }}>
                                    <tr>
                                        <td colSpan={2}>
                                            <button className="btn btn-dark" style={{ width: "150px", padding: "10px", borderRadius: "30px", marginTop: "14px", marginBottom: "14px" }}>
                                                Thanh Toán
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* footer cart */}
                <div>
                    <button className="text-uppercase btn btn-dark py-3" style={{ borderRadius: "30px", width: "240px", marginTop: "10px", marginLeft: "200px" }}>
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        </>
    );
};

export default Cart;
