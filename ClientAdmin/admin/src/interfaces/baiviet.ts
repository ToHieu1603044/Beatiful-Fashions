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
    titleHead: string;//phan dau bai viet
    description: string; // Nội dung bài viết, dạng mảng các block
    image?: string; // Mảng URL ảnh (nếu có)
    isActive: boolean; // Trạng thái kích hoạt
    created_at: Date; // Thoi gian tạo bai viet

}
