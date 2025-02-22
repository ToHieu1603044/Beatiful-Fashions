import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getProductById } from '../../services/productService';
import { useParams } from 'react-router-dom';

const DetailProducts: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quantity, setQuantity] = useState<number>(1);
    const [product, setProduct] = useState<any>(null);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>("");

    useEffect(() => {
        fetchProduct();
    }, []);

    useEffect(() => {
        if (product) {
            updateVariant();
        }
    }, [selectedAttributes, product]);

    const handleSubmit = () => {
        if (!selectedVariant) {
            alert("Vui lòng chọn biến thể.");
            return;
        }
        const orderData = {
            quantity: quantity,
            sku_id: selectedVariant.sku_id
        };
        console.log("Dữ liệu gửi đi:", orderData);
    };

    const fetchProduct = async () => {
        try {
            const response = await getProductById(id);
            const productData = response.data.data;
            setProduct(productData);
            if (productData.variants?.length > 0) {
                const defaultVariant = productData.variants[0];
                const defaultAttributes: { [key: string]: string } = {};
                defaultVariant.attributes.forEach((attr: any) => {
                    defaultAttributes[attr.name] = attr.value;
                });
                setSelectedAttributes(defaultAttributes);
                setSelectedVariant(defaultVariant);
            }
            setLoading(false);
        } catch (error: any) {
            setErrorMessage(error.message);
            setLoading(false);
        }
    };

    const updateVariant = () => {
        if (!product || !product.variants) return;
        const variant = product.variants.find((v: any) =>
            v.attributes.every(
                (attr: any) => selectedAttributes[attr.name] === attr.value
            )
        );
        setSelectedVariant(variant || null);
    };

    const handleSelectAttribute = (name: string, value: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container mt-5">
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : errorMessage ? (
                <div className="alert alert-danger" role="alert">{errorMessage}</div>
            ) : (
                <>
                    <div className="row">
                        <div className="col-md-6 text-center">
                            <div className="border p-3 rounded shadow-lg">
                                <img 
                                    src={product.images ? `http://127.0.0.1:8000/storage/${product.images}` : "https://source.unsplash.com/900x900/?product"} 
                                    className="img-fluid rounded" 
                                    alt={product.name} 
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h1 className="fw-bold">{product.name}</h1>
                            <h2 className="text-danger fw-bold">
                                Giá: {selectedVariant ? selectedVariant.price.toLocaleString() : product.price.toLocaleString()}đ
                                {selectedVariant?.old_price && (
                                    <del className="text-muted ms-2">{selectedVariant.old_price.toLocaleString()}đ</del>
                                )}
                            </h2>
                            <p className="fw-semibold">Trạng thái: <span className={selectedVariant?.stock > 0 ? "text-success" : "text-danger"}>{selectedVariant?.stock > 0 ? "Còn hàng" : "Hết hàng"}</span></p>

                            {product.variants?.[0]?.attributes.map((attr: any, index: number) => (
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
                            <p className="mt-2">Tồn kho: <span className="fw-bold">{selectedVariant ? `${selectedVariant.stock} sản phẩm` : `${product.stock} sản phẩm`}</span></p>

                            <button className="btn btn-primary btn-lg mt-3 w-100" onClick={handleSubmit}>
                                THÊM VÀO GIỎ
                            </button>
                            <p className="mt-3 text-muted">Mã sản phẩm: {selectedVariant ? selectedVariant.sku : product.id}</p>
                        </div>
                    </div>
                    <ul className="nav nav-tabs mt-4" id="productTab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button className="nav-link active fw-bold text-uppercase" id="description-tab" data-bs-toggle="tab" data-bs-target="#description" type="button" role="tab">Mô tả</button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button className="nav-link fw-bold text-uppercase" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments" type="button" role="tab">Bình luận</button>
                        </li>
                    </ul>
                    <div className="tab-content mt-3">
                        <div className="tab-pane fade show active p-3 border rounded" id="description" role="tabpanel">{product.description}</div>
                        <div className="tab-pane fade p-3 border rounded" id="comments" role="tabpanel">Hàng tốt chất lượng *****</div>
                        
                    </div>
                </>
            )}
        </div>
    );
};

export default DetailProducts;
