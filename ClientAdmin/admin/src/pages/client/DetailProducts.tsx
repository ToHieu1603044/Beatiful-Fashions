import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getAvgProduct,
  getProductById,
  storeCart,
} from "../../services/homeService";
import { Link, useParams } from "react-router-dom";
import { Send, User } from "lucide-react";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { formatPrice } from "../../utils/formatNumber";
import { Tag } from "antd";
const DetailProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log(id);
  const [quantity, setQuantity] = useState<number>(1);
  const [product, setProduct] = useState<any>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<{
    [key: string]: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [rating, setRating] = useState<number>(0);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          name: "Bạn",
          text: newComment,
          avatar: "https://i.pravatar.cc/40?img=3",
        },
      ]);
      setNewComment("");
    }
  };
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };
  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((comment) => {
      comment.replies = [];
      map[comment.id] = comment;
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        map[comment.parent_id]?.replies.push(comment);
      } else {
        roots.push(comment);
      }
    });

    return roots;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productResponse = await getProductById(id);
        const productData = productResponse.data.data.data;
        setProduct(productData);
        //   console.log(productData);
        setMainImage(`http://127.0.0.1:8000/storage/${productData.images}`);

        if (productData.variants?.length > 0) {
          const defaultVariant = productData.variants[0];
          const defaultAttributes: { [key: string]: string } = {};
          defaultVariant.attributes?.forEach((attr: any) => {
            defaultAttributes[attr.name] = attr.value;
          });
          setSelectedAttributes(defaultAttributes);
        }

        // Sau khi có product.id -> gọi 2 API song song
        const [ratingRes, commentRes] = await Promise.all([
          getAvgProduct(productData.id),
          axios.get(
            `http://127.0.0.1:8000/api/ratings/product/${productData.id}`
          ),
        ]);
        console.log(commentRes.data.data);

        setRating(ratingRes.data.average_rating);
        setComments(buildCommentTree(commentRes.data.data));
      } catch (error: any) {
        console.error("Lỗi:", error);
        setErrorMessage(error.message || "Có lỗi xảy ra");
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);
  const renderComments = (comments: any[]) => {
    return comments.map((comment) => (
      <div key={comment.id} className="mb-3">
        <div className="d-flex align-items-start p-2 border rounded bg-light">
          <img
            src={comment.avatar || "https://i.pravatar.cc/40?img=3"}
            alt={comment.user.name}
            className="rounded-circle me-2"
            width="40"
            height="40"
          />
          <div>
            <p className="fw-bold mb-1">{comment.user.name}</p>
            {comment.rating && <StarRating rating={comment.rating} />}
            <p className="mb-0">
              {comment.review || <i>(Không có nội dung)</i>}
            </p>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="ms-5 mt-2">{renderComments(comment.replies)}</div>
        )}
      </div>
    ));
  };

  const StarRating = ({ rating }) => {
    const stars = [];
    const fullStars = Math.floor(rating); // Số sao đầy
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75; // Sao nửa nếu từ 0.25 - 0.74
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0); // Số sao rỗng

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-warning" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-warning" />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-warning" />);
    }

    return <div className="d-flex">{stars}</div>;
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
      quantity: quantity,
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
          showConfirmButton: false,
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
          confirmButtonText: "Đăng nhập",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/login";
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text:
            error?.response?.data?.message ||
            "Đã có lỗi xảy ra, vui lòng thử lại!",
        });
      }
    }
  };
  const handleImageClick = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

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
                  src={
                    mainImage || "https://source.unsplash.com/900x900/?product"
                  }
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
                      style={{
                        width: "80px",
                        height: "100px",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleImageClick(
                          `http://127.0.0.1:8000/storage/${gallery.image}`
                        )
                      }
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
                Giá:{" "}
                {formatPrice(
                  selectedVariant
                    ? selectedVariant.price - product.sale_price
                    : product.price
                )}
                {selectedVariant?.old_price && (
                  <del className="text-muted ms-2">
                    {formatPrice(selectedVariant.old_price)}đ
                  </del>
                )}
              </h4>
              <p>Đã bán: {product.total_sold}</p>
              <p className="fw-semibold">
                Trạng thái:{" "}
                <span
                  className={
                    selectedVariant?.stock > 0 ? "text-success" : "text-danger"
                  }
                >
                  {selectedVariant?.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </p>

              {product.variants?.[0]?.attributes?.map(
                (attr: any, index: number) => (
                  <div key={index} className="mt-3">
                    <label className="fw-semibold">Chọn {attr.name}:</label>
                    <div className="d-flex gap-2 flex-wrap mt-2">
                      {[
                        ...new Set(
                          product.variants
                            .map(
                              (v: any) =>
                                v.attributes.find(
                                  (a: any) => a.name === attr.name
                                )?.value
                            )
                            .filter(Boolean)
                        ),
                      ].map((value, idx) => (
                        <Tag.CheckableTag
                          key={idx}
                          checked={selectedAttributes[attr.name] === value}
                          onChange={() =>
                            handleSelectAttribute(attr.name, value)
                          }
                          style={{
                            padding: "8px 16px",
                            fontSize: "14px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            userSelect: "none",
                          }}
                        >
                          {value}
                        </Tag.CheckableTag>
                      ))}
                    </div>
                  </div>
                )
              )}

              <div className="mt-3 d-flex align-items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="btn btn-outline-secondary btn-sm"
                >
                  -
                </button>
                <span className="fw-bold fs-6">{quantity}</span>
                <button
                  onClick={() => {
                    if (selectedVariant && quantity < selectedVariant.stock) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  className="btn btn-outline-secondary btn-sm"
                  disabled={
                    selectedVariant ? quantity >= selectedVariant.stock : true
                  }
                >
                  +
                </button>
              </div>

              <p className="mt-2">
                Tồn kho:{" "}
                <span className="fw-bold">
                  {selectedVariant
                    ? `${selectedVariant.stock} sản phẩm`
                    : `Không xác định`}
                </span>
              </p>
              <div className="flex items-center gap-1">
                {renderStars(rating)}
                <span className="ml-1 text-sm text-gray-600">({rating})</span>
              </div>
              <button
                className="btn btn-primary btn-lg mt-3 w-100"
                onClick={handleSubmit}
              >
                THÊM VÀO GIỎ
              </button>
              <p className="mt-3 text-muted">
                Mã sản phẩm:{" "}
                {selectedVariant ? selectedVariant.sku : product.id}
              </p>
            </div>
          </div>

          {/* Tabs Mô tả & Bình luận */}
          <div className="mt-4">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "description" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Mô tả
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${
                    activeTab === "comments" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("comments")}
                >
                  Bình luận {"(" + product.total_rating + ")"}
                </button>
              </li>
            </ul>

            <div className="tab-content mt-3">
              {activeTab === "description" ? (
                <div className="card p-3">
                  <h4 className="fw-bold">Thông tin sản phẩm</h4>
                  <p
                    className="text-muted"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        product.description || "Chưa có mô tả cho sản phẩm này."
                      ),
                    }}
                  />
                </div>
              ) : (
                <div className="mt-3">
                  <h3 className="fw-bold">Bình luận</h3>
                  <div className="mt-3">
                  {renderComments(comments)}

                  </div>

                  {/* Nhập bình luận */}
                  <div className="d-flex align-items-center border rounded p-2 mt-3 bg-white">
                    <img
                      src="https://i.pravatar.cc/40?img=3"
                      alt="User"
                      className="rounded-circle me-2"
                      width="40"
                      height="40"
                    />
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="form-control border-0 shadow-none"
                    />
                    <button
                      onClick={handleAddComment}
                      className="btn btn-primary btn-sm ms-2"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <br />
          <hr />
          <br />
        </>
      )}
    </div>
  );
};

export default DetailProducts;
