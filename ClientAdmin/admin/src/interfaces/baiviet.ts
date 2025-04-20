// export interface BaiViet {

//     id: number;
//     title: string;
//     content: string;
//     publishDate: string;
//     images: string;
// }
export interface Baiviet {
    id: string; // ID bài viết
    title: string; // Tiêu đề bài viết
    titleHeader: string;//phan dau bai viet
    content: string; // Nội dung bài viết, dạng mảng các block
    // images?: string; // Mảng URL ảnh (nếu có)
    images?: string; // Mảng URL ảnh (nếu có)
    isActive: boolean; // Trạng thái kích hoạt
    publishDate: Date; // Ngày đăng
}
