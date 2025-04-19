import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Pagination, Input, Dropdown, Menu, Table, message } from "antd"; // Import từ Ant Design
import Swal from "sweetalert2";
import axios from "axios";
import { Baiviet } from "../../../interfaces/baiviet";

const ListBaiViet: React.FC = () => {
    const [Baiviets, setBaiviets] = useState<Baiviet[]>([]);
    console.log(Baiviets);
    
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOption, setSortOption] = useState("titleAsc");
    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(7);
    const token = localStorage.getItem("access_token");
    // Fetch data from API
    useEffect(() => {
        const fetchBaiviets = async () => {
            try {
                const response = await axios.get("http://localhost:3000/baiviet");
                const data = response.data || [];
                setBaiviets(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchBaiviets();
    }, []);
    // lọc danh sách bài viết theo tên bài viết hoặc ngày bài viết
    const filteredBaiviets = Baiviets.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(item.publishDate).toLocaleDateString().includes(searchTerm.toLowerCase())
    );
    const handleSortChange = (option: string) => {
        setSortOption(option);
    };
    const sortedBaiviets = filteredBaiviets.sort((a, b) => {
        switch (sortOption) {
            case "titleAsc":
                return a.title.localeCompare(b.title);
            case "titleDesc":
                return b.title.localeCompare(a.title);
            case "dateAsc":
                return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
            case "dateDesc":
                return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
            default:
                return 0;
        }
    });
    const toggleVisibility = async (id: string, isActive: boolean) => {
        try {
            const updatedStatus = !isActive;
            await axios.put(`baiviet/${id}`, { isActive: updatedStatus }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setBaiviets((prev) => prev.map((Baiviet) =>
                Baiviet.id === id ? { ...Baiviet, isActive: updatedStatus } : Baiviet
            ));
            message.success("Trạng thái đã được cập nhật.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau.";
            message.error(errorMessage);
        }
    };
    // end loc
    const handleDelete = async (id: string) => {
        console.log(id);

        try {
            const result = await Swal.fire({
                title: "Bạn có chắc không?",
                text: "Bạn sẽ không thể hoàn tác hành động này!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Có, xóa nó!",
                cancelButtonText: "Không, hủy bỏ",
                reverseButtons: true,
            });

            if (result.isConfirmed) {
                await axios.delete(`http://localhost:3000/baiviet/${id}`);
                // {
                //     headers: token ? { Authorization: `Bearer ${token}` } : {},
                // }
                setBaiviets((prev) => prev.filter((Baiviet) => Baiviet.id !== id));
                message.success("Bài viết của bạn đã được xóa.");
            } else {
                message.info("Đã hủy, bài viết của bạn an toàn.");
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại sau.";
            message.error(errorMessage);
        }
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = sortedBaiviets.slice(indexOfFirstPost, indexOfLastPost);

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'id',
            dataIndex: 'id',
           
        },
        {
            title: 'Tiêu Đề',
            dataIndex: 'title',
            render: (title) => <p style={{
                maxWidth: "400px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}>{title}</p>,
        },
        {
            title: 'Hình Ảnh',
            dataIndex: 'images',
            render: (images) => <img src={images} alt="Hình ảnh" width="50px" />,
        },
        {
            title: 'Ngày Đăng',
            dataIndex: 'publishDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'isActive',
            render: (isActive) => (isActive ? "Hiển thị" : "Ẩn"),
        },
        {
            title: 'Hành Động',
            render: (_, record) => (
                <div>
                    <Button onClick={() => handleDelete(record.id)} type="link" danger>
                        <i className="fa-solid fa-trash"></i>
                    </Button>
                    <Link to={`/admin/baiviet/edit/${record.id}`}>
                        <Button type="link" style={{ color: "red" }}>
                            <i className="fa-solid fa-pen"></i>
                        </Button>
                    </Link>
                    <Button onClick={() => toggleVisibility(record.id, record.isActive)}>
                        {record.isActive ? "Ẩn" : "Hiện"}
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container">
            <div className="my-3">
                <div style={{ marginBottom: "17px" }}>
                    <Input.Search
                        placeholder="Tìm kiếm theo tên hoặc ngày tạo"
                        onSearch={(value) => setSearchTerm(value)}
                        style={{ width: 500, marginBottom: 16 }}
                    />
                    <Dropdown
                        overlay={
                            <Menu>
                                <Menu.Item onClick={() => handleSortChange("titleAsc")}>Từ A-Z</Menu.Item>
                                <Menu.Item onClick={() => handleSortChange("titleDesc")}>Từ Z-A</Menu.Item>
                                <Menu.Item onClick={() => handleSortChange("dateAsc")}>Ngày tăng dần</Menu.Item>
                                <Menu.Item onClick={() => handleSortChange("dateDesc")}>Ngày giảm dần</Menu.Item>
                            </Menu>
                        }
                    >
                        <Button>
                            Sắp xếp
                        </Button>
                    </Dropdown>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <h3>Danh Sách Bài viết</h3>
                        <Link to="/admin/baiviet/add">
                            <Button type="primary" icon={<i className="fa-solid fa-plus"></i>}>
                                Thêm mới
                            </Button>
                        </Link>

                    </div>
                    <Table
                        columns={columns}
                        dataSource={currentPosts}
                        pagination={false}
                        rowKey="_id"
                    />
                    <Pagination
                        current={currentPage}
                        pageSize={postsPerPage}
                        total={sortedBaiviets.length}
                        onChange={(page) => setCurrentPage(page)}
                        style={{ marginTop: 16, textAlign: 'center' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ListBaiViet;