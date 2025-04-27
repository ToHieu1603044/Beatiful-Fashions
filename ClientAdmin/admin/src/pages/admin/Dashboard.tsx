import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    CartesianGrid
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchDashboardData, fetchRevenueData } from "../../services/homeService";

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [orderStatus, setOrderStatus] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState("daily");

    // Bộ lọc ngày cho phần tổng quan
    const [overviewStartDate, setOverviewStartDate] = useState("");
    const [overviewEndDate, setOverviewEndDate] = useState("");

    // Bộ lọc ngày cho phần sản phẩm bán chạy
    const [productStartDate, setProductStartDate] = useState("");
    const [productEndDate, setProductEndDate] = useState("");

    const navigate = useNavigate();

    const COLORS = ["#FFBB28", "#00C49F", "#FF8042"];

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const response = await fetchDashboardData(overviewStartDate, overviewEndDate);
            setStats(response.stats);
            setOrders(response.orders);
            setProducts(response.products);
            setOrderStatus(response.orderStatus);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu dashboard:", error);
            if (error.response?.status === 403) navigate("/403");
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenue = async (type) => {
        try {
            const response = await fetchRevenueData(type);
            setRevenueData(response);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu doanh thu:", error);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchRevenue(timeFilter);
    }, [timeFilter, overviewStartDate, overviewEndDate]);

    useEffect(() => {
        // Tải lại danh sách sản phẩm bán chạy khi lọc theo ngày
        const fetchProducts = async () => {
            try {
                const response = await fetchDashboardData(productStartDate, productEndDate);
                setProducts(response.products);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm bán chạy:", error);
            }
        };

        fetchProducts();
    }, [productStartDate, productEndDate]);

    const handleFilterOverview = () => {
        fetchDashboard();
    };

    const handleFilterProducts = () => {
        // Lọc sản phẩm bán chạy
        const fetchProducts = async () => {
            try {
                const response = await fetchDashboardData(productStartDate, productEndDate);
                setProducts(response.products);
            } catch (error) {
                console.error("Lỗi lấy sản phẩm bán chạy:", error);
            }
        };

        fetchProducts();
    };

    return (
        <div className="container-fluid d-flex">
            <main className={`flex-grow-1 bg-light p-4 ${isSidebarOpen ? 'ms-5' : 'ms-2'}`}>
                <h1 className="text-2xl fw-bold mb-3">Dashboard</h1>
                <div className="row mb-4">
                    <div className="d-flex mb-3 gap-2">
                        <input type="date" className="form-control" value={overviewStartDate} onChange={(e) => setOverviewStartDate(e.target.value)} />
                        <input type="date" className="form-control" value={overviewEndDate} onChange={(e) => setOverviewEndDate(e.target.value)} />
                        <button onClick={handleFilterOverview} className="btn btn-primary">Lọc</button>
                    </div>
                    <div className="col-md-3">
                        <div className=" shadow-sm border-0 p-4 text-center bg-white rounded-4">
                            <div className="mb-2 text-secondary">🛍️ Sản phẩm</div>
                            {loading ? (
                                <Skeleton height={30} width={50} />
                            ) : (
                                <h3 className="text-primary fw-bold">{stats.totalProducts}</h3>
                            )}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className=" shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Đơn hàng</h5>
                            {loading ? <Skeleton height={30} width={50} /> : <h2 className="text-success fw-bold">{stats.totalOrders}</h2>}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className=" shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Thành viên</h5>
                            {loading ? <Skeleton height={30} width={50} /> : <h2 className="text-danger fw-bold">{stats.totalUsers}</h2>}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className=" shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Doanh thu (VNĐ)</h5>
                            {loading ? <Skeleton height={30} width={100} /> : <h2 className="text-warning fw-bold">{stats.totalRevenue.toLocaleString()}₫</h2>}
                        </div>
                    </div>
                </div>

                <div className="row">
                    {/* 🔹 Biểu đồ doanh thu */}
                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-3">Biểu đồ doanh thu</h5>
                                <select className="form-select w-50" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                                    <option value="daily">Theo ngày</option>
                                    <option value="weekly">Theo tuần</option>
                                    <option value="monthly">Theo tháng</option>
                                    <option value="yearly">Theo năm</option>
                                </select>
                            </div>

                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" stroke="#6c757d" />
                                    <YAxis stroke="#6c757d" tickFormatter={(value) => `${value / 1000}k`} />
                                    <Tooltip formatter={(value) => [`${value.toLocaleString()}₫`, "Doanh thu"]} />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#0d6efd"
                                        strokeWidth={3}
                                        dot={{ r: 4, stroke: "#0d6efd", strokeWidth: 2, fill: "#fff" }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 🔹 Biểu đồ tình trạng đơn hàng */}
                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <h5 className="mb-3">Tình trạng đơn hàng</h5>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={orderStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {orderStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <h5 className="mb-3">Đơn hàng gần đây</h5>
                            <ul className="list-group list-group-flush">
                                {orders.map(order => (
                                    <li key={order.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{order.name}</strong> - {order.status}
                                        </div>
                                        <span className="text-muted">{order.total_amount.toLocaleString()}₫</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5>Sản phẩm bán chạy</h5>
                            </div>

                            {/* Bộ lọc thời gian cho sản phẩm bán chạy */}
                            <div className="d-flex mb-3 gap-2">
                                <input type="date" className="form-control" value={productStartDate} onChange={(e) => setProductStartDate(e.target.value)} />
                                <input type="date" className="form-control" value={productEndDate} onChange={(e) => setProductEndDate(e.target.value)} />
                                <button onClick={handleFilterProducts} className="btn btn-primary">Lọc</button>
                            </div>

                            {loading ? <Skeleton count={3} /> : (
                                <ul>
                                    {products.map((product) => (
                                        <li key={product.id}>{product.name} - {product.total_sold} sản phẩm</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
