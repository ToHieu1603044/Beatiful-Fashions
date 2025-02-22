import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getProductById } from "../../services/productService";
import { useParams } from "react-router-dom";

const DetailProducts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quantity, setQuantity] = useState<number>(1);
    const [product, setProduct] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [mainImage, setMainImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("description");

    useEffect(() => {
        fetchProduct();
    }, [id]); // Cập nhật sản phẩm khi `id` thay đổi

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getProductById(id);
            const productData = response.data.data;
            setProduct(productData);
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
    

    const selectedVariant = useMemo(() => {
        if (!product || !product.variants) return null;
        return product.variants.find((variant: any) =>
            variant.attributes.every(
                (attr: any) => selectedAttributes[attr.name] === attr.value
            )
        );
    }, [selectedAttributes, product]);

    const handleSelectAttribute = (name: string, value: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!selectedVariant) {
            alert("Vui lòng chọn biến thể.");
            return;
        }
        console.log("Dữ liệu gửi đi:", { quantity, sku_id: selectedVariant.sku_id });
    };

    const handleImageClick = (imageUrl: string) => {
        setMainImage(imageUrl);
    };

    return (
        <div className="container mt-5">
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
                                Giá: {selectedVariant ? selectedVariant.price.toLocaleString() : product.price.toLocaleString()}đ
                                {selectedVariant?.old_price && (
                                    <del className="text-muted ms-2">{selectedVariant.old_price.toLocaleString()}đ</del>
                                )}
                            </h4>
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
                    <br />

                </>
            )}

        </div>
    );
};

export default DetailProducts;
