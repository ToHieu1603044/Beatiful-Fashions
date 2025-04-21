import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { deleteBrands, getBrands } from '../../../services/brandsService';

type BrandsType = {
    id: number;
    name: string;
    status: string;
    children: BrandsType[];
    created_at: string;
    updated_at: string;


}
const Brands = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isRootBrands = location.pathname === "/admin/brands";

    const [brands, setBrands] = useState<BrandsType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrands, setSelectedBrands] = useState<BrandsType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchBrands();
    }, [searchTerm]);

    const fetchBrands = async () => {
        try {

            const response = await getBrands({ name: searchTerm });

            console.log("Dữ liệu ---:", response.data);
            setBrands(response.data.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;

        try {
            await deleteBrands(id);
            alert("Xóa danh mục thành công!");
            fetchBrands();
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            console.error("Lỗi khi xóa danh mục:", axiosError);
            alert("Không thể xóa danh mục. Vui lòng thử lại.");
        }
    };
    const handleShowModal = (brands: BrandsType) => {
        setSelectedBrands(brands);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedBrands(null);
    };

    return (
        <div className="container mt-4">
            {isRootBrands && (
                <>
                    <div className="d-flex align-items-center mb-3">
                        <h2 className="mb-0">Danh sách Brands</h2>
                        <button className="btn btn-success ms-3" onClick={() => navigate("/admin/brands/create")}>
                            Thêm mới

                        </button>
                    </div>

                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tìm kiếm danh muc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Tên</th>
                                    <th>Status</th>
                                    <th>Ngày tạo</th>
                                    <th>Ngày cập nhật</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {brands.map((brand) => (
                                    <tr key={brand.id}>
                                        <td>{brand.id}</td>
                                        <td>{brand.name}</td>
                                        <td>{brand.status ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                                        <td>{brand.created_at}</td>
                                        <td>{brand.updated_at}</td>
                                        <td>
                                            <button className="btn btn-warning" onClick={() => handleShowModal(brand)}>
                                                Xem
                                            </button>
                                            <button className="btn btn-danger ms-2" onClick={() => handleDelete(brand.id)}>
                                                Xóa
                                            </button>
                                            <button className="btn btn-info ms-2" onClick={() => navigate(`/admin/brands/${brand.id}/edit`)}>
                                                Sửa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </>
            )}

            {selectedBrands && (
                <div className={`modal fade ${showModal ? "show d-block" : ""}`} tabIndex={-1} style={{ background: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Chi tiết danh mục</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>ID:</strong> {selectedBrands.id}</p>
                                <p><strong>Tên:</strong> {selectedBrands.name}</p>
                                <p><strong>Status:</strong> {selectedBrands.status}</p>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={handleCloseModal}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Outlet />
        </div>
    )
}

export default Brands
