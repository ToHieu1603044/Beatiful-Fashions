import React, { useEffect, useState } from "react";
import { Table, Modal, Avatar, Button, message, Popconfirm } from "antd";
import axios from "axios";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/ratings");
      setComments(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/ratings/${id}`);
      message.success("Bình luận đã được xóa");
      fetchComments();
    } catch (error) {
      message.error("Xóa thất bại");
      console.error("Error deleting comment:", error);
    }
  };

  const handleShowModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  const handleReply = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/ratings/${selectedComment.id}/reply`, {
        content: replyContent,
      },{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      message.success("Đã gửi phản hồi");
      setReplyContent("");
      setReplyModalVisible(false);
      fetchComments();
    } catch (error) {
      message.error("Gửi phản hồi thất bại");
      console.error("Error replying to comment:", error);
    }
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div>
          <Avatar style={{ backgroundColor: "#87d068" }}>{user.name.charAt(0)}</Avatar>
          <span style={{ marginLeft: 8 }}>{user.name}</span>
        </div>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "product",
      key: "product",
      render: (product) => (
        <a href="#" onClick={() => handleShowModal(product)}>
          {product.name}
        </a>
      ),
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
    },
    {
      title: "Nhận xét",
      dataIndex: "review",
      key: "review",
      render: (text, record) => (
        <div>
          <p>{text}</p>
          {record.replies && record.replies.length > 0 && (
            <div
              style={{
                marginTop: 8,
                paddingLeft: 16,
                borderLeft: "2px solid #f0f0f0",
              }}
            >
              {record.replies.map((reply) => (
                <div key={reply.id} style={{ marginBottom: 4 }}>
                  <strong>{reply.user.name} (phản hồi):</strong> {reply.review}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    
    {
      title: "Hành động",
      key: "action",
      render: (record) => (
        <>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="primary" danger>
              Xóa
            </Button>
          </Popconfirm>

          {record.parent_id === null && (
            <Button
              type="default"
              style={{ marginLeft: 8 }}
              onClick={() => {
                setSelectedComment(record);
                setReplyModalVisible(true);
              }}
            >
              Phản hồi
            </Button>
          )}
        </>
      ),
    },
  ];
  // const columss = [
  //     {
  //       title: "Người dùng",
  //       dataIndex: "user",
  //       key: "user",
  //     },
  //     {
  //       title: "Sản phẩm",
  //       dataIndex: "product",
  //       key: "product",
  //       render: (product) => (
  //           <a href="#" onClick={handleShowModal(product)}>
  //             product.name
  //           </a> 
  //       )
  //     },
  //     {
  //       title: "Đánh giá",
  //       dataIndex: "rating",
  //       key: "rating",
  //     },
  //     {
  //       title: "Nhận xét",
  //       dataIndex: "review",
  //       key: "review",
  //     },
  //     {
  //       title: "Hành động",
  //       key: "action",
  //       render: (record) => (
  //         <>
  //         <Popconfirm
  //           title = "Ban co muon xoa"
  //           onConfirm={() => handleDelete(record.id)}
  //           okText="Co"
  //           cancelText = "Khong"
  //         >
  //           <Button type="primary" danger>
  //             Xoa
  //           </Button>
  //         </Popconfirm>
  //         </>
  //       )
  //     }

  // ];
  return (
    <div className="container">
      <h2>Danh sách bình luận</h2>
      <Table dataSource={comments} columns={columns} rowKey="id" />

      {/* Modal chi tiết sản phẩm */}
      <Modal
        title="Chi tiết sản phẩm"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedProduct && (
          <div>
            <p><strong>ID:</strong> {selectedProduct.id}</p>
            <p><strong>Tên:</strong> {selectedProduct.name}</p>
            <p><strong>Thương hiệu:</strong> {selectedProduct.brand_id}</p>
            <p><strong>Danh mục:</strong> {selectedProduct.category_id}</p>
            <p><strong>Hình ảnh:</strong></p>
            <img
              src={
                selectedProduct.images
                  ? `http://127.0.0.1:8000/storage/${selectedProduct.images}`
                  : "https://placehold.co/200x200"
              }
              alt={selectedProduct.name}
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </div>
        )}
      </Modal>

      {/* Modal phản hồi */}
      <Modal
        title="Phản hồi bình luận"
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        onOk={handleReply}
      >
        <textarea
          rows={4}
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
};

export default Comments;
