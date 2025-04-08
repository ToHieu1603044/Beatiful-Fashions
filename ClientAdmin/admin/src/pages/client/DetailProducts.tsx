import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getProductById, storeCart } from "../../services/homeService";
import { Link, useParams } from "react-router-dom";
import { Send, User } from "lucide-react";
import Swal from 'sweetalert2'
import DOMPurify from "dompurify";
import axios from "axios";
const DetailProducts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    console.log(id);
    const [quantity, setQuantity] = useState<number>(1);
    const [product, setProduct] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("description");
    const [comments, setComments] = useState<string>([]);
    const [popularProducts, setPopularProducts] = useState([]);
    
    const [newComment, setNewComment] = useState("");

    const handleAddComment = () => {
        if (newComment.trim() !== "") {
            setComments([
                ...comments,
                { id: comments.length + 1, name: "Bạn", text: newComment, avatar: "https://i.pravatar.cc/40?img=3" }
            ]);
            setNewComment("");
        }
    };
    useEffect(() => {
        fetchProduct();
        fetrchcomment();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getProductById(id);

            console.log("Dữ liệu API---:", response.data);
            const productData = response.data.data.data;
            const popular = response.data.data.popular;
            console.log("kbdw", popular)
            console.log("Dữ liệu sản phẩm: ", productData);
            setProduct(productData);
            setPopularProducts(popular);

            setMainImage(`http://127.0.0.1:8000/storage/${productData.images}`);

            if (productData.variants?.length > 0) {
                const defaultVariant = productData.variants[0];
                const defaultAttributes: { [key: string]: string } = {};
                defaultVariant.attributes?.forEach((attr: any) => {
                    defaultAttributes[attr.name] = attr.value;
                });
                setSelectedAttributes(defaultAttributes);
            }
        } catch (error: any) {
            setErrorMessage(error.message);
        }
        setLoading(false);
    };

    const fetrchcomment = async () => {
        const id = product.id
        const response = await axios.get("http://127.0.0.1:8000/api/ratings/product/${id}");
        console.log("Dữ liệu API---:", response.data);
        setComments(response.data.data);
    }
    const selectedVariant = useMemo(() => {
        if (!product || !product.variants) return null;
        return product.variants.find((variant: any) =>
            variant.attributes.every(
                (attr: any) => selectedAttributes[attr.name] === attr.value
            )
        );
    }, [selectedAttributes, product]);
    const handleDeleteComment = async (id: number) => {
        try {
            const response = await axios.delete(`http://127.0.0.1:8000/api/ratings/${id}`);
            if (response.status == 200 || response.status == 204) {
                alert("Xoa thanh cong");
            }
        } catch (error) {
            alert("Xoa that bai");
            console.log(error);
            
        }
    }
    const handleSelectAttribute = (name: string, value: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedVariant) {
            Swal.fire({
                icon: "warning",
                title: "Vui lòng chọn biến thể.",
            });
            return;
        }

        if (quantity <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Số lượng phải lớn hơn 0.",
            });
            return;
        }

        const data = {
            sku_id: selectedVariant.sku_id,
            quantity: quantity
        };

        console.log("Dữ liệu gửi đi:", data);

        try {
            const response = await storeCart(data);
            console.log("Phản hồi từ API:", response.data);

            if (response.status === 200) {
                Swal.fire({
                    title: "Thêm giỏ hàng thành công!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: "Vui lòng thử lại sau.",
                });
            }
        } catch (error: any) {

            if (error?.response?.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Bạn chưa đăng nhập!",
                    text: "Vui lòng đăng nhập để tiếp tục.",
                    confirmButtonText: "Đăng nhập"
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/login";
                    }
                });
            } else {

                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: error?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại!",
                });
            }
        }
    };
    const handleImageClick = (imageUrl: string) => {
        setMainImage(imageUrl);
    };
    // const handleShowModal = (product) => {
    //     setSelectedProduct(product);
    //     setSelectedVariant(null);

    //     const allAttributes = [...new Set(product.variants.flatMap((variant) => variant.attributes.map((attr) => attr.name)))];
    //     // Loc tat ca variants va lay ra ten cac thuoc tinh -> dung Set de ne cac truong giong nhau-> chuyen thnanh mang

    //     const initialSelectedAttributes = Object.fromEntries(allAttributes.map((attr) => [attr, null]));

    //     const initialAvailableOptions = {};
    //     allAttributes.forEach((attrName) => {
    //         initialAvailableOptions[attrName] = [
    //             ...new Set(
    //                 product.variants.flatMap((variant) =>
    //                     variant.attributes
    //                         .filter((attr) => attr.name === attrName)
    //                         .map((attr) => attr.value)
    //                 )
    //             ),
    //         ];
    //     });

    //     setSelectedAttributes(initialSelectedAttributes);
    //     //  setAvailableOptions(initialAvailableOptions);
    // };

    return (
        <div className="container mt-5">
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a href="/">Trang chủ</a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Chi tiết sản phẩm
                    </li>
                </ol>
            </nav>

            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : errorMessage ? (
                <div className="alert alert-danger">{errorMessage}</div>
            ) : (
                <>
                    <div className="row">
                        <div className="col-md-6 text-center">
                            <div className="border p-3 rounded shadow-lg">
                                <img
                                    src={mainImage || "https://source.unsplash.com/900x900/?product"}
                                    className="img-fluid rounded"
                                    alt={product.name}
                                />
                            </div>
                            <div className="d-flex gap-2 justify-content-center flex-wrap mt-3">
                                {product.galleries?.length > 0 ? (
                                    product.galleries.map((gallery: any, index: number) => (
                                        <img
                                            key={index}
                                            src={`http://127.0.0.1:8000/storage/${gallery.image}`}
                                            className="img-thumbnail"
                                            style={{ width: "80px", height: "100px", cursor: "pointer" }}
                                            onClick={() => handleImageClick(`http://127.0.0.1:8000/storage/${gallery.image}`)}
                                            alt={product.name}
                                        />
                                    ))
                                ) : (
                                    <p className="text-muted">Không có ảnh bộ sưu tập</p>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6">
                            <h3 className="fw-bold">Tên sản phẩm: {product.name}</h3>
                            <h4 className="text-danger fw-bold">
                                Giá: {selectedVariant ? selectedVariant.price : product.price}đ
                                {selectedVariant?.old_price && (
                                    <del className="text-muted ms-2">{selectedVariant.old_price}đ</del>
                                )}
                            </h4>
                            <p>Đã bán: {product.total_sold}</p>
                            <p className="fw-semibold">Trạng thái: <span className={selectedVariant?.stock > 0 ? "text-success" : "text-danger"}>{selectedVariant?.stock > 0 ? "Còn hàng" : "Hết hàng"}</span></p>

                            {product.variants?.[0]?.attributes?.map((attr: any, index: number) => (
                                <div key={index} className="mt-3">
                                    <label className="fw-semibold">Chọn {attr.name}:</label>
                                    <div className="d-flex gap-2 flex-wrap mt-2">
                                        {[...new Set(product.variants.map((v: any) =>
                                            v.attributes.find((a: any) => a.name === attr.name)?.value
                                        ).filter(Boolean))].map((value, idx) => (
                                            <button
                                                key={idx}
                                                className={`btn ${selectedAttributes[attr.name] === value ? "btn-primary" : "btn-outline-secondary"}`}
                                                onClick={() => handleSelectAttribute(attr.name, value)}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-3 d-flex align-items-center gap-2">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn btn-outline-secondary btn-sm">-</button>
                                <span className="fw-bold fs-6">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="btn btn-outline-secondary btn-sm">+</button>
                            </div>
                            <p className="mt-2">Tồn kho: <span className="fw-bold">{selectedVariant ? `${selectedVariant.stock} sản phẩm` : `Không xác định`}</span></p>

                            <button className="btn btn-primary btn-lg mt-3 w-100" onClick={handleSubmit}>
                                THÊM VÀO GIỎ
                            </button>
                            <p className="mt-3 text-muted">Mã sản phẩm: {selectedVariant ? selectedVariant.sku : product.id}</p>
                        </div>
                    </div>


                    {/* Tabs Mô tả & Bình luận */}
                    <div className="mt-4">
                        <ul className="nav nav-tabs">
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "description" ? "active" : ""}`} onClick={() => setActiveTab("description")}>
                                    Mô tả
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link ${activeTab === "comments" ? "active" : ""}`} onClick={() => setActiveTab("comments")}>
                                    Bình luận {"(" + product.total_rating + ")"}
                                </button>
                            </li>
                        </ul>

                        <div className="tab-content mt-3">
                            {activeTab === "description" ? (
                                <div className="card p-3">
                                    <h4 className="fw-bold">Thông tin sản phẩm</h4>
                                    <p className="text-muted"
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(product.description || "Chưa có mô tả cho sản phẩm này.")
                                        }}
                                    />
                                </div>

                            ) : (
                                <div className="mt-3">
                                    <h3 className="fw-bold">Bình luận</h3>
                                    <div className="mt-3">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="d-flex align-items-start p-2 border rounded mb-2 bg-light">
                                                <img src={comment.avatar} alt={comment.user} className="rounded-circle me-2" width="40" height="40" />
                                                <div>
                                                    <p className="fw-bold mb-1">{comment.rating}</p>
                                                    <p className="mb-0">{comment.review}</p>
                                                </div>
                                                <div>
                                                    <a href=""></a>
                                                    <button onClick={() => handleDeleteComment(comment.id)}>Xóa</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Nhập bình luận */}
                                    <div className="d-flex align-items-center border rounded p-2 mt-3 bg-white">
                                        <img src="https://i.pravatar.cc/40?img=3" alt="User" className="rounded-circle me-2" width="40" height="40" />
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận..."
                                            className="form-control border-0 shadow-none"
                                        />
                                        <button onClick={handleAddComment} className="btn btn-primary btn-sm ms-2">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* SẢN PHẨM LIÊN QUAN */}
                    {/* <div className="mt-5">
                        <h3 className="fw-bold">Sản phẩm liên quan</h3>
                        {popularProducts.length > 0 ? (
                            <div className="row mt-3">
                                {popularProducts.map((product: any) => (
                                    <div key={product.id} className="col-md-3 mb-4">
                                        <div className="card shadow-sm">
                                            <Link to={`/products/${product.id}/detail`}>
                                                <img
                                                    src={product.images && product.images !== "null"
                                                        ? `http://127.0.0.1:8000/storage/${product.images}`
                                                        : "https://placehold.co/200x200?text=No+Image"}
                                                    className="card-img-top"
                                                    alt={product.name || "Sản phẩm"}
                                                    style={{ height: "200px", width: "100%", objectFit: "cover", borderRadius: "8px" }}
                                                />
                                            </Link>

                                            <div className="card-body text-center">
                                                <h6 className="card-title fw-bold">{product.name}</h6>
                                                <p className="text-danger fw-bold">
                                                    {product.price}đ
                                                    {product.old_price && (
                                                        <del className="text-muted ms-2">{product.old_price}đ</del>
                                                    )}
                                                </p>
                                                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal(product)}>
                                                    Mua ngay
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">Không có sản phẩm liên quan.</p>
                        )}
                    </div> */}

                    <br />
                        <hr />
                        <br />
                </>
            )
            }

        </div >
    );
};

export default DetailProducts;
