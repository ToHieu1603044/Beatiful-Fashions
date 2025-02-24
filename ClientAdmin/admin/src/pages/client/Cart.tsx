import { useState } from "react";

import { Link } from "react-router-dom";
const products = [
    {
        id: 1,
        name: "Quần TB Striped Arm Band Black Trouser cx2",
        img: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/781-jpeg.jpg?v=1640953694857",
        size: 28,
        price: "428.000.000đ",
    },
    {
        id: 2,
        name: "Quần TB Striped Arm Band Black Trouser cx2",
        img: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/339-jpeg-0c77b62b-9d0e-413d-b881-354bcf04b0d2.jpg?v=1660228599470",
        size: 28,
        price: "428.000đ",
    },
    {
        id: 3,
        name: "Quần TB Striped Arm Band Black Trouser cx2",
        img: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/781-jpeg.jpg?v=1640953694857",
        size: 28,
        price: "428.000đ",
    },
    {
        id: 4,
        name: "Quần TB Striped Arm Band Black Trouser cx2",
        img: "https://bizweb.dktcdn.net/thumb/medium/100/347/891/products/781-jpeg.jpg?v=1640953694857",
        size: 28,
        price: "428.000đ",
    },
];
interface Product {
    id: number;
    name: string;
    img: string;
    size: number;
    price: string;
}
const Cart = () => {
    const [quantity, setQuantity] = useState(1);

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrease = () => {
        setQuantity(quantity + 1);
    };
    return (
        <>
          
            <div className="w-100 " style={{ marginBottom: "50px" }}>
                {/* nav cart */}
                <div className="" style={{ backgroundColor: "#efefef" }}>
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
                        <Link
                            to="/"
                            className="nav-link"
                            style={{ marginRight: "20px" }}
                        >
                            Trang chủ
                        </Link>
                        &#62;
                        <span style={{ marginLeft: "20px" }}>Giỏ hàng</span>
                    </div>
                </div>
                {/* body cart */}
                <div className="container-sm" style={{ padding: "0px 50px" }}>
                    {/* title cart */}
                    <p
                        className="text-uppercase"
                        style={{
                            fontSize: "30px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR27-w-dTwxmPanmi440n9gi1V1b_GI8NvKCiSWkO74UvWaoh72go0N5ECvSdhXOIscjK4&usqp=CAU')" /* Thay bằng link ảnh */,
                            backgroundSize: "contain",
                            backgroundPosition: "100% 100%",
                            color: "transparent",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            marginTop: "50px",
                            marginBottom: "30px",
                        }}
                    >
                        Giỏ Hàng
                    </p>
                    {/* content cart */}
                    <div className="w-100  d-flex">
                        <div
                            className=""
                            style={{ width: "68%", marginRight: "30px" }}
                        >
                            {/* header table cart */}
                            <div
                                className="d-flex"
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "14px",
                                    borderTop: "1px solid #ccc",
                                    borderBottom: "1px solid #ccc",
                                }}
                            >
                                <p style={{ marginRight: "400px" }}>Sản phẩm</p>
                                <p style={{ marginRight: "140px" }}>Số lượng</p>
                                <p style={{ marginRight: "40px" }}>Tổng tiền</p>
                                <p>Xóa</p>
                            </div>
                            {/* body table cart */}
                            <div className="">
                                {products.map((item: Product) => (
                                    <div className="" key={item.id}>
                                        <div
                                            className="d-flex"
                                            style={{
                                                borderBottom: "1px solid #ccc",
                                            }}
                                        >
                                            {/* ảnh vs tên sản phẩm  */}
                                            <img
                                                src={`${item.img}`}
                                                alt=""
                                                style={{
                                                    width: "190px",
                                                    height: "230px",
                                                    objectFit: "contain",
                                                    margin: "15px 10px 10px",
                                                }}
                                            />
                                            <div
                                                className=""
                                                style={{
                                                    marginLeft: "-20px",
                                                    marginTop: "40px",
                                                    fontSize: "15px",
                                                }}
                                            >
                                                <p>{item.name}</p>
                                                <p className="mt-2">
                                                    {item.size}
                                                </p>
                                                <p>{item.price}</p>
                                            </div>
                                            {/* nút tăng giảm số lượng */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "10px",
                                                    height: "50px",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "30px",
                                                    marginTop: "100px",
                                                }}
                                            >
                                                <button
                                                    onClick={handleDecrease}
                                                    style={{
                                                        padding:
                                                            "5px 0px 5px 10px",
                                                        background: "white",
                                                        border:"none",
                                                        cursor:
                                                            quantity > 1
                                                                ? "pointer"
                                                                : "not-allowed",
                                                    }}
                                                    disabled={quantity <= 1}
                                                >
                                                    {"<"}
                                                </button>
                                                <span
                                                    style={{
                                                        minWidth: "30px",
                                                        textAlign: "center",
                                                        border: "1px solid #ccc",
                                                        height: "50px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        width: "60px",
                                                    }}
                                                >
                                                    {quantity}
                                                </span>
                                                <button
                                                    onClick={handleIncrease}
                                                    style={{
                                                        padding:
                                                            "5px 10px 5px 0px",
                                                            border:"none",
                                                        background: "white",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {">"}
                                                </button>
                                            </div>
                                            {/* tổng tiền */}
                                            <div
                                                className=""
                                                style={{
                                                    margin: "110px 0px 0px 50px",
                                                    width: "100px",
                                                    // backgroundColor: "red",
                                                }}
                                            >
                                                <p>{item.price}</p>
                                            </div>
                                            {/* Action :xóa */}
                                            <div
                                                className=""
                                                style={{
                                                    margin: "110px 0px 0px 10px",
                                                }}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div
                            className=""
                            style={{
                                width: "30%",
                                height: "130px",
                                border: "1px solid #ccc",
                            }}
                        >
                            <table className="table table-borderless text-center">
                                <thead>
                                    <tr>
                                        <td>Tổng tiền</td>
                                        <td>42.160.000₫</td>
                                    </tr>
                                </thead>
                                <tbody
                                    style={{
                                        borderTop: "1px solid #ccc",
                                        borderBottom: "1px solid #ccc",
                                        height: "30px",
                                    }}
                                >
                                    <tr>
                                        <td colSpan={2}>
                                            <button
                                                className="btn btn-dark"
                                                style={{
                                                    width: "150px",
                                                    padding: "10px",
                                                    borderRadius: "30px",
                                                    marginTop: "14px",
                                                    marginBottom: "14px",
                                                }}
                                            >
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
                <div className="">
                    <button
                        className="text-uppercase btn btn-dark py-3"
                        style={{
                            borderRadius: "30px",
                            width: "240px",
                            marginTop: "10px",
                            marginLeft: "200px",
                        }}
                    >
                        Tiếp tục mua sắm{" "}
                    </button>
                </div>
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default Cart;
