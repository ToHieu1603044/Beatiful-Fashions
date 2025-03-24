import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
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
   const navigate = useNavigate();
    const COLORS = ["#FFBB28", "#00C49F", "#FF8042"];

    const fetchDashboard = async () => {
        try {
            const response = await fetchDashboardData();
            setStats(response.stats);
            setOrders(response.orders);
            setProducts(response.products);
            setOrderStatus(response.orderStatus);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu dashboard:", error);
            if(error.response.status === 403) {
                navigate("/403");
            }
            if(error.response.status === 401) {
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchRevenue = async (type) => {
        try {
            const response = await fetchRevenueData(type);
            setRevenueData(response);
            console.log(response.data)
        } catch (error) {
            console.error("Lỗi lấy dữ liệu doanh thu:", error);
        }
    };

    useEffect(() => {
        fetchDashboard();
        fetchRevenue(timeFilter);
    }, [timeFilter]);

    return (
        <div className="container-fluid d-flex">

            <main className={`flex-grow-1 bg-light p-4 ${isSidebarOpen ? 'ms-5' : 'ms-2'}`}>

                <h1 className="text-2xl fw-bold mb-3">Dashboard</h1>

                {/* 🔹 Thống kê tổng quan */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Sản phẩm</h5>
                            {loading ? <Skeleton height={30} width={50} /> : <h2 className="text-primary fw-bold">{stats.totalProducts}</h2>}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Đơn hàng</h5>
                            {loading ? <Skeleton height={30} width={50} /> : <h2 className="text-success fw-bold">{stats.totalOrders}</h2>}
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow border-0 p-3 text-center bg-white">
                            <h5 className="text-muted">Thành viên</h5>
                            {loading ? <Skeleton height={30} width={50} /> : <h2 className="text-danger fw-bold">{stats.totalUsers}</h2>}
                        </div>
                    </div>
                    <div className="col-md-3">
                        
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-md-9">
                            <div className="card shadow border-0 p-3 text-center bg-white">
                                <h5 className="text-muted">Doanh thu (VNĐ)</h5>
                                {loading ? <Skeleton height={30} width={100} /> : <h2 className="text-warning fw-bold">{stats.totalRevenue.toLocaleString()}₫</h2>}
                            </div>
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
                                <LineChart data={revenueData}>
                                    <XAxis dataKey="date" stroke="#8884d8" />
                                    <YAxis stroke="#8884d8" />
                                    <Tooltip formatter={(value) => `${value.toLocaleString()}₫`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
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

                {/* 🔹 Đơn hàng gần đây & Sản phẩm bán chạy */}
                <div className="row mt-4">
                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <h5 className="mb-3">Đơn hàng gần đây</h5>
                            {loading ? <Skeleton count={3} /> : (
                                <ul>
                                    {orders.map((order) => (
                                        <li key={order.id}>{order.name} - ({order.status})- Tôngr tiền: {order.total_amount.toLocaleString()}₫</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="bg-white p-4 shadow rounded">
                            <h5 className="mb-3">Sản phẩm bán chạy</h5>
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
