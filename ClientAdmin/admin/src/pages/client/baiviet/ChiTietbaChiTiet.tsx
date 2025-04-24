import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Baiviet } from "../../../interfaces/baiviet";
import axios from "axios";

const BaivietDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  console.log("id", id);

  const [baiviet, setBaiviet] = useState<Baiviet | null>(null);
  console.log("baiviet", baiviet);

  const [relatedPosts, setRelatedPosts] = useState<Baiviet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBaiviet = async () => {
      try {
        const { data } = await axios.get(
          `http://127.0.0.1:8000/api/posts/${id}`
        );
        console.log("data", data);

        if (data) {
          setBaiviet(data);
        } else {
          Swal.fire("Thông báo", "Bài viết không tồn tại", "info");
        }
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải bài viết", "error");
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedPosts = async () => {
      try {
        const { data } = await axios.get(
          `http://127.0.0.1:8000/api/posts/`
        );
        // Lọc bỏ bài viết hiện tại
        const filteredPosts = data.filter(
          (post: Baiviet) => post.id !== id
        );
        setRelatedPosts(filteredPosts);
      } catch (error) {
        console.error("Không thể tải danh sách bài viết:", error);
      }
    };

    fetchBaiviet();
    fetchRelatedPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!baiviet) {
    return <div className="text-center mt-5">Không có bài viết hiển thị</div>;
  }

  const created_at = new Date(baiviet.created_at);
  return (
    <div className="container my-5">
      <h1
        className="text-center mb-4 baivietchitiet"
        style={{ fontFamily: "Roboto, sans-serif", fontWeight: "600" }}
      >
        {baiviet.title}
      </h1>
      <div className="card mb-4" style={{ border: "none", boxShadow: "none" }}>
        <div className="card-img-container position-relative">

        </div>
        <div className="card-body" style={{
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <div
            style={{ lineHeight: "1.8", marginTop: "10px", marginBottom: "15px" }}

            className="baiviet-content"
            dangerouslySetInnerHTML={{ __html: baiviet.description }}
          />

        </div>

        <td className="text-center">
          <h5
            className="mb-4 d-flex flex-row-reverse"
            style={{ fontFamily: "Roboto, sans-serif", fontWeight: "600" }}
          >
            {new Date(baiviet.created_at).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            - {" "}
            {new Date(baiviet.created_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </h5>
        </td>


      </div>

      {/* Hiển thị bài viết tiếp theo */}
      <div className="related-posts mt-5">
        <div className="title__products__Related">
          <p>Bài viết tiếp theo</p>
        </div>
        <div className="scroll d-flex overflow-auto">
          {relatedPosts.slice(0, 6).map((post) => (
            <div
              className="card shadow-sm border-0 rounded-3 me-3 card-img-container position-relative"
              key={post.id}
              style={{ width: "300px", flex: "0 0 auto" }}
            >
              <Link to={`/baiviet/${post.id}`}>
                <img
                  src={`${post.image}`}
                  alt={post.title}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://cdn.tgdd.vn/Files/2016/12/09/923744/khongxacdinh_213x379.jpg';
                  }}
                />
              </Link>
              <div className="card-body text-center">
                <Link
                  className="text-decoration-none text-black font-weight-bold"
                  to={`/baiviet/${post.id}`}
                >
                  <h4 className="card-title ">{post.title}</h4>
                </Link>

                <p className="card-text text-muted">
                  Về Zokong | <i className="fa-regular fa-clock p-1"></i>
                  {new Date(post.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaivietDetailPage;
