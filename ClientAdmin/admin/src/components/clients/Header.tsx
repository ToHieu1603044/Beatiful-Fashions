import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { fetchNotifications as fetchNotificationAPI, getCartCount, getCategories, updateNotificationStatus } from "../../services/homeService";
import { Category } from '../../interfaces/Categories';
import { useNavigate } from 'react-router-dom';
import { Heart, Bell } from 'lucide-react';
import UserInfo from '../UserInfo';
import axios from 'axios';
import { Modal, Button, List, Avatar, Badge, Typography, Divider } from 'antd';
import echo from '../../utils/echo';
import moment from 'moment';

const { Text } = Typography;

interface Notification {
  id: number;
  message: string;
  status: 'read' | 'unread';
  created_at: string;
}

const Header = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const [site, setSite] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [expandedNotification, setExpandedNotification] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('access_token');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sites = await axios.get('http://127.0.0.1:8000/api/site-setting');
        setSite(sites.data.data);

        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);

    if (notification.status === "unread") {
      try {
        const response = await updateNotificationStatus(notification.id, "read");
        console.log("Mark read:", response);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, status: "read" } : n
          )
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
      }
    }
  };

  useEffect(() => {
    const globalChannel = echo.channel("global-notifications");

    globalChannel.listen(".NewNotification", (data: Notification) => {
      console.log("📢 Nhận thông báo realtime:", data);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      globalChannel.stopListening(".NewNotification");
    };
  }, []);

  const checkLogin = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/account');
    }
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    navigate(`/searchs?query=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    const fetchCartCountAsync = async () => {
      try {
        const response = await getCartCount();
        setCartCount(response.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
      }
    };
    fetchCartCountAsync();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/notifications');
      setNotifications(response.data.data);
      const unread = response.data.data.filter((n: Notification) => n.status === "unread").length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    }
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container d-flex align-items-center justify-content-start">
        <a className="navbar-brand me-3 text-white" href="/">
        <img
  src={"../../../src/assets/logo.png"}
  alt={site.site_name || "Logo"}
  className="img-fluid"
  style={{ width: '50px', height: '50px', objectFit: 'contain' }}
/>

        </a>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {categories.map((category) => (
              <li key={category.id} className="nav-item">
                <a className="nav-link text-white" href={`/category/${category.id}/${category.slug}`}>
                  {category.name}
                </a>
              </li>
            ))}
          </ul>

          <ul className="navbar-nav ms-auto d-flex align-items-center gap-3">
            <li className="nav-item">
              <a className="nav-link text-white" href="#" onClick={(e) => { e.preventDefault(); setIsSearchOpen(true); }}>
                <FaSearch size={20} />
              </a>
            </li>

            <li className="nav-item position-relative">
              <a className="nav-link text-white" href="/cart">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "12px", padding: "5px 7px" }}>
                    {cartCount}
                  </span>
                )}
              </a>
            </li>

            <li className="nav-item">
              <UserInfo />
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="/whislist">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
              </a>
            </li>

            <li className="nav-item position-relative">
              <a className="nav-link text-white" href="#" onClick={() => setIsNotificationsOpen(true)}>
                <Badge count={unreadCount}>
                  <Bell size={20} />
                </Badge>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal thông báo */}
      <Modal
        title={<span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Thông báo</span>}
        open={isNotificationsOpen}
        onCancel={() => setIsNotificationsOpen(false)}
        footer={null}
        centered
        width={600}
        bodyStyle={{ padding: '0' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={notifications}
          className="notification-list"
          renderItem={(notification: Notification) => (
            <List.Item
              className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#f56a00' }}>U</Avatar>}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{notification.message}</Text>
                    <Text type="secondary" style={{ fontSize: '0.8em' }}>
                      {moment(notification.created_at).fromNow()}
                    </Text>
                  </div>
                }
                description={notification.status === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Details Modal */}
      <Modal
        title={<span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>Chi tiết thông báo</span>}
        open={isDetailsModalOpen}
        onCancel={handleDetailsModalClose}
        footer={[
          <Button key="close" onClick={handleDetailsModalClose}>
            Đóng
          </Button>,
        ]}
        centered
        width={600}
      >
        {selectedNotification && (
          <div>
            <Typography.Title level={5}>
              {selectedNotification.message}
            </Typography.Title>
            <Divider />
            <Text type="secondary">
              Được gửi: {moment(selectedNotification.created_at).format('LLL')}
            </Text>
          </div>
        )}
      </Modal>

      {/* Modal tìm kiếm */}
      {isSearchOpen && (
        <div className="search-modal-container">
          <div className="search-modal-content">
            <button className="close-btn" onClick={() => setIsSearchOpen(false)}>
              <span>×</span>
            </button>
            <div className="search-form d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-primary" onClick={handleSearch}>
                Tìm
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
