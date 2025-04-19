import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Swal from "sweetalert2";
import "../../../App.css";
import { CKEditorComponent } from "../../../components/CKEditorComponent";
import { Baiviet } from "../../../interfaces/baiviet";


const BaivietForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [description, setDescription] = useState<string>("");
    const [image, setimage] = useState<string>("");
    console.log("image", image);

    const [loading, setLoading] = useState(false);
    const [imgURL, setImgURL] = useState<string>("");
    const token = localStorage.getItem("access_token");
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<Baiviet>();
    // chi tiet bai viet 
    useEffect(() => {
        if (id) {
            (async () => {
                try {
                    setLoading(true);
                    const { data } = await axios.get(`http://localhost:3000/baiviet/${id}`);
                    console.log("data", data);
                    setValue("title", data.title);
                    setValue("titleHeader", data.titleHeader);
                    setValue("content", data.content);
                    setValue("images", data.images);
                    setDescription(data.content);
                    setImgURL(data.images); // Hiển thị ảnh hiện tại
                } catch {
                    Swal.fire("Lỗi", "Không tải được bài viết", "error");
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [id, setValue]);
    // =====================================
    // Hàm upload file lên Cloudinary
    // const uploadFile = async (file: File) => {
    //     const CLOUD_NAME = "db1hqzmrb";
    //     const PRESET_NAME = "datn_upload";
    //     const FOLDER_NAME = "datn";
    //     const api = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    //     const formData = new FormData();
    //     formData.append("upload_preset", PRESET_NAME);
    //     formData.append("folder", FOLDER_NAME);
    //     formData.append("file", file);

    //     const response = await axios.post(api, formData, {
    //         headers: { "Content-Type": "multipart/form-data"},
    //     });
    //     return response.data.secure_url;
    // };
    // Xử lý khi người dùng chọn file ảnh
    // const handleImgChange = async (
    //     event: React.ChangeEvent<HTMLInputElement>
    // ) => {
    //     const files = event.target.files;
    //     if (files && files.length > 0) {
    //         try {
    //             // setLoading(true);
    //             const url = await uploadFile(files[0]); // Upload ảnh lên Cloudinary
    //             setImgURL(url); // Lưu URL ảnh để hiển thị
    //             setValue("images", url); // Gán giá trị URL ảnh vào form
    //             Swal.fire("Thành công", "Ảnh đã được tải lên", "success");
    //          } catch (error:any) {
    //                 console.error("Upload error:", error.response ? error.response.data : error);
    //                 Swal.fire("Lỗi", "Không thể tải ảnh lên", "error");
    //             }
    //     }
    // };
    // ===================================
    const handleSubmitForm = async (data: any) => {
        console.log("data", data);
        if (!description.trim()) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Nội dung bài viết không được để trống.",
            });
            return;
        }

        // Hiển thị hộp thoại xác nhận
        const result = await Swal.fire({
            title: id ? "Xác nhận cập nhật" : "Xác nhận tạo mới",
            text: id
                ? "Bạn có chắc chắn muốn cập nhật bài viết này?"
                : "Bạn có chắc chắn muốn tạo mới bài viết?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: id ? "Cập nhật" : "Tạo mới",
            cancelButtonText: "Hủy",
        });

        if (!result.isConfirmed) {
            return; // Người dùng hủy xác nhận
        }

        try {
            setLoading(true);
            const payload = { ...data, content: description, images: image };
            console.log("payload", payload);
            if (id) {
                await axios.put(`http://localhost:3000/baiviet/${id}`, payload, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                Swal.fire("Thành công", "Bài viết đã được cập nhật", "success");
            } else {
                await axios.post("http://localhost:3000/baiviet", payload);
                // {
                //     headers: token ? { Authorization: `Bearer ${token}` } : {},
                // }
                Swal.fire("Thành công", "Bài viết mới đã được tạo", "success");
            }
            navigate("/admin/baiviet");
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
    const handleImageChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setimage(reader.result as string); // Thiết lập URL hoặc chuỗi base64
            };
            reader.readAsDataURL(file);
        }
    };
    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="container">
            <h1>{id ? "Chỉnh sửa bài viết" : "Tạo mới bài viết"}</h1>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
                <div className="mb-3">
                    <label>Tiêu đề</label>
                    <input
                        type="text"
                        className="form-control"
                        {...register("title")}
                        style={{width:"800px"}}
                    />
                    {errors.title?.message && (
                        <p className="text-danger">
                            {errors.title.message.toString()}
                        </p>
                    )}
                </div>
                <div className="mb-3">
                    <label>Tiêu đề</label>
                    <input
                        type="text"
                        className="form-control"
                        {...register("titleHeader")}
                        style={{width:"800px"}}
                    />
                    {errors.titleHeader?.message && (
                        <p className="text-danger">
                            {errors.titleHeader.message.toString()}
                        </p>
                    )}
                </div>

                <div className="mb-3">
                    <label>Mô tả</label>
                    <CKEditorComponent
                        value={description}
                        onChange={setDescription}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="mainImage">Ảnh chính</label>
                    <input
                        id="mainImage"
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{width:"800px"}}
                    />
                    {id ? <img src={imgURL} alt="" style={{ width: "100px" }} /> : ""}
                </div>
                <button type="submit" className="btn btn-primary">
                    {id ? "Cập nhật" : "Tạo mới"}
                </button>
            </form>
        </div>
    );
};

export default BaivietForm;
