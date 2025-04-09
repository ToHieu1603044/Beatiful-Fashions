import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Device {
    id: number;
    name: string;
    created_at: string;
    last_used_at: string | null;
    is_current_device: boolean;
    user_agent?: string;
    ip_address?: string;
}


const MyDevices: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy token từ localStorage hoặc chỗ bạn đang lưu
    const token = localStorage.getItem('access_token');

    const api = axios.create({
        baseURL: 'http://localhost:8000/api', // đổi lại theo cấu hình thực tế
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    });

    const getDevices = async () => {
        try {
            const response = await api.get('/devices');
            setDevices(response.data.devices);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách thiết bị:', error);
        } finally {
            setLoading(false);
        }
    };

    const revokeDevice = async (id: number) => {
        if (!window.confirm('Bạn chắc chắn muốn đăng xuất thiết bị này?')) return;
        try {
            await api.delete(`/devices/${id}`);
            await getDevices();
        } catch (error) {
            alert('Không thể đăng xuất thiết bị');
        }
    };

    useEffect(() => {
        getDevices();
    }, []);

    if (loading) return <p>Đang tải danh sách thiết bị...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Danh sách thiết bị đã đăng nhập</h2>
            <ul className="space-y-2">
                {devices.map((device) => (
                    <li
                        key={device.id}
                        className="border rounded p-4 flex justify-between items-center bg-white shadow-sm"
                    >
                        <div>
                            <p className="font-semibold">{device.name}</p>
                            <p className="text-sm text-gray-500">
                                Đăng nhập lúc: {new Date(device.created_at).toLocaleString()}
                            </p>
                            {device.last_used_at && (
                                <p className="text-sm text-gray-500">
                                    Hoạt động gần nhất: {new Date(device.last_used_at).toLocaleString()}
                                </p>
                            )}
                            {device.is_current_device && (
                                <span className="text-green-500 text-sm font-medium">Thiết bị hiện tại</span>
                            )}
                        </div>
                        {device.user_agent && (
                            <p className="text-sm text-gray-500">Trình duyệt: {device.user_agent}</p>
                        )}
                        {device.ip_address && (
                            <p className="text-sm text-gray-500">IP: {device.ip_address}</p>
                        )}

                        {!device.is_current_device && (
                            <button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                onClick={() => revokeDevice(device.id)}
                            >
                                Đăng xuất
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyDevices;
