import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Swal from "sweetalert2";
import "../../../App.css";
import { CKEditorComponent } from "../../../components/CKEditorComponent";
import { Baiviet } from "../../../interfaces/baiviet";

const EditBaiviet = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [description, setDescription] = useState<string>("");
    const [image, setImage] = useState<File | null>(null); // Lưu tệp hình ảnh
    const [loading, setLoading] = useState(false);
    const [imgURL, setImgURL] = useState<string>("");
    const token = localStorage.getItem("access_token");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Baiviet>();

    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    setLoading(true);
                    const { data } = await axios.get(`http://127.0.0.1:8000/api/posts/${id}`);
                    reset({
                        title: data.title,
                        titleHead: data.titleHead,
                        description: data.description,
                        image: data.image,
                    });
                    setDescription(data.description);
                    setImgURL(data.image); // Hiển thị ảnh hiện tại
                } catch {
                    Swal.fire("Lỗi", "Không tải được bài viết", "error");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [id, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file); // Lưu tệp thay vì URL
        }
    };

    const handleSubmitForm = async (data: any) => {
        console.log(data);

        if (!description.trim()) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Nội dung bài viết không được để trống.",
            });
            return;
        }
        const result = await Swal.fire({
            title: "Xác nhận cập nhật",
            text: "Bạn có chắc chắn muốn cập nhật bài viết này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Cập nhật",
            cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) {
            return; // Người dùng hủy
        }

        try {
            setLoading(true);
            const payload = { ...data, isActive: true };
            console.log("payload", payload);

            const formData = new FormData();

            // Thêm dữ liệu vào FormData
            Object.keys(payload).forEach((key) => {
                formData.append(key, payload[key]);
            });
            if (image) {
                formData.append("image", image); // Thêm tệp ảnh
            }
            console.log("formData", [...formData]);

            const arrayData = Object.fromEntries(formData);
            console.log("arrayData", arrayData);
            
            // const response = await axios.put(`http://127.0.0.1:8000/api/posts/${id}`, arrayData, {
            //     headers: {
            //         "Content-Type": "multipart/form-data",
            //         ...(token ? { Authorization: `Bearer ${token}` } : {}),
            //     },
            // });
            
            // console.log(response.data);
            // Swal.fire("Thành công", "Bài viết đã được cập nhật", "success");
            // navigate("/admin/baiviet");
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                "Đã xảy ra lỗi, vui lòng thử lại sau.";
            Swal.fire({
                icon: "error",
                title: "Có lỗi xảy ra",
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="container">
            <h1>Chỉnh sửa bài viết</h1>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="mb-3">
                    <label>Tiêu đề</label>
                    <input
                        type="text"
                        className="form-control"
                        {...register("title")}
                        style={{ width: "800px" }}
                    />
                    {errors.title?.message && (
                        <p className="text-danger">{errors.title.message.toString()}</p>
                    )}
                </div>
                <div className="mb-3">
                    <label>Tiêu đề phụ</label>
                    <input
                        type="text"
                        className="form-control"
                        {...register("titleHead")}
                        style={{ width: "800px" }}
                    />
                    {errors.titleHead?.message && (
                        <p className="text-danger">{errors.titleHead.message.toString()}</p>
                    )}
                </div>

                <div className="mb-3">
                    <label>Mô tả</label>
                    <CKEditorComponent value={description} onChange={setDescription} />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="mainImage">
                        Ảnh chính
                    </label>
                    <input
                        id="mainImage"
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ width: "800px" }}
                    />
                    {id ? <img src={imgURL} alt="" style={{ width: "100px" }} /> : ""}
                </div>
                <button type="submit" className="btn btn-primary">
                    Cập nhật
                </button>
            </form>
        </div>
    );
};

export default EditBaiviet;
