import { useEffect, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa"; // Import trash icon
import echo from "../utils/echo";
import { deleteNotification, fetchNotifications, updateNotificationStatus } from "../services/homeService";

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    status: 'read' | 'unread';
    created_at: string;
    time_ago: string;
}
const Notifications = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificationList, setNotificationList] = useState<Notification[]>([]);
    const [expandedNotification, setExpandedNotification] = useState<number | null>(null);

    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifi();
    }, []);
    const handleNotificationClick = async (id: number) => {
    
        setExpandedNotification(expandedNotification === id ? null : id);
    
        const notification = notificationList.find(n => n.id === id);
        if (notification?.status === "unread") {
            setNotificationList(prev =>
                prev.map(n => (n.id === id ? { ...n, status: "read" } : n))
            );
    
            try {
                const response = await updateNotificationStatus(id, "read");
                console.log("Log", response);
            } catch (error) {
                console.error(error);
                setNotificationList(prev =>
                    prev.map(n => (n.id === id ? { ...n, status: "unread" } : n))
                );
            }
        }
    };
    const handleDelete = async (id: number) => {
        try {
            console.log(id);
          await deleteNotification(id); 
          await fetchNotifi();
        
        } catch (error) {
          console.error("Lỗi khi xóa thông báo:", error);
        }
      };
      
    const fetchNotifi = async () => {
        try {
            const response = await fetchNotifications();
            console.log("📩 Dữ liệu từ API:", response.data.data);
            if (response.data) {
                setNotificationList(response.data.data);
                const unread = notifications.filter((n: Notification) => n.status === "unread").length;
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông báo:", error);
        }
    };

    useEffect(() => {
        const globalChannel = echo.channel("global-notifications");

        globalChannel.listen(".NewNotification", (data: Notification) => {
            console.log("📢 Nhận thông báo realtime:", data);

            setNotificationList((prev) => {
                const newList = [...prev, data];
                setUnreadCount(newList.length); 
                return newList;
            });
        });

        return () => {
            globalChannel.stopListening(".NewNotification");
        };
    }, []);



    const handleOpenNotifications = () => {
        console.log("🔔 Click vào chuông - Reset số lượng thông báo");
        fetchNotifi();
        setIsOpen(true);
    };

    return (
        <>
            <button className="btn btn-outline position-relative" onClick={handleOpenNotifications}>
                <IoNotificationsOutline size={24} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge bg-danger">
                        {unreadCount}
                    </span>
                )}
            </button>


            <div className={`offcanvas offcanvas-end ${isOpen ? "show" : ""}`}
                style={{ width: "350px", visibility: isOpen ? "visible" : "hidden" }}>
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title">Thông báo</h5>
                    {/* ... header content remains the same ... */}
                </div>
                <div className="offcanvas-body">
                    {notificationList.length === 0 ? (
                        <div className="text-center mt-5">
                            <IoNotificationsOutline size={50} className="text-muted mb-3" />
                            <p className="text-muted">Không có thông báo mới</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notificationList.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`notification-item p-3 border-bottom position-relative 
                                    ${notif.status === 'unread' ? 'bg-light' : ''}`}
                                    onClick={() => handleNotificationClick(notif.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="notification-content w-100">
                                            {/* Title section */}
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0">{notif.title}</h6>
                                                {notif.status === 'unread' && (
                                                    <span className="badge bg-primary rounded-pill ms-2">Mới</span>
                                                )}
                                            </div>

                                            {/* Time ago */}
                                            <small className="text-muted d-block mt-1">{notif.time_ago}</small>

                                            {/* Message - only shown when expanded */}
                                            {expandedNotification === notif.id && (
                                                <div className="message-wrapper mt-2">
                                                    <p className="notification-message mb-0">
                                                        {notif.message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            className="btn btn-link text-danger p-0 ms-2"
                                            onClick={(e) => {
                                    
                                               {handleDelete(notif.id)}
                                            }}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isOpen && <div className="offcanvas-backdrop fade show" onClick={() => setIsOpen(false)}></div>}

            <style jsx>{`
                .notification-item {
                    transition: all 0.2s ease;
                    border-left: 3px solid transparent;
                }
                .notification-item:hover {
                    background-color: #f8f9fa;
                }
                .notification-item.bg-light {
                    border-left-color: #0d6efd;
                }
                .notification-content {
                    flex: 1;
                }
                .message-wrapper {
                    padding-top: 0.5rem;
                    margin-top: 0.5rem;
                    border-top: 1px solid #eee;
                }
                .notification-message {
                    color: #666;
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                .btn-link {
                    opacity: 0.5;
                    transition: opacity 0.2s;
                }
                .btn-link:hover {
                    opacity: 1;
                }
            `}</style>
        </>
    );
};

export default Notifications;
