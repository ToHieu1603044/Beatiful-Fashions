import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const CountDown: React.FC = () => {
  const [showCountdown, setShowCountdown] = useState(true); // Luôn hiển thị popup khi tải trang
  const [countdownTime, setCountdownTime] = useState('');
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [saleTitle, setSaleTitle] = useState('Flash Sale');
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/count-down');
        const sales = response.data;
        console.log(sales);
        const now = new Date();

        // Kiểm tra xem có khuyến mãi nào đang diễn ra
        const activeSale = sales.find((sale: any) => {
          const start = new Date(sale.start_time);
          const end = new Date(sale.end_time);
          return now >= start && now <= end && sale.status === 'active';  // Khuyến mãi đang diễn ra
        });

        if (activeSale) {
          setSaleTitle(activeSale.name || 'Flash Sale');
          setEndTime(new Date(activeSale.end_time)); // Lấy thời gian kết thúc khuyến mãi
        } else {
          // Nếu không có khuyến mãi, đặt thời gian đếm ngược mặc định là 5 phút từ hiện tại
          const defaultEndTime = new Date(now.getTime() + 5 * 60 * 1000);
          setEndTime(defaultEndTime);
        }
      } catch (error) {
        console.error('Lỗi khi lấy flash sale:', error);
        // Trong trường hợp lỗi, cũng đặt thời gian đếm ngược mặc định
        const defaultEndTime = new Date(new Date().getTime() + 5 * 60 * 1000);
        setEndTime(defaultEndTime);
      }
    };

    fetchFlashSale();
  }, []);

  useEffect(() => {
    if (endTime) {
      startCountdown(endTime); // Bắt đầu đếm ngược khi có thời gian kết thúc
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [endTime]);

  const startCountdown = (endTime: Date) => {
    if (countdownInterval) {
      clearInterval(countdownInterval); // Dọn dẹp interval cũ nếu có
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setCountdownTime('Đã kết thúc!');
        setTimeout(() => setShowCountdown(false), 2000); // Tự động ẩn popup sau 2 giây khi kết thúc
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));

      setCountdownTime(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    setCountdownInterval(interval); // Lưu lại interval để có thể dọn dẹp sau này
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  return (
    <Modal
      show={showCountdown}
      onHide={() => setShowCountdown(false)}
      centered
      size="lg" // Đặt kích thước modal lớn hơn
      aria-labelledby="contained-modal-title-vcenter"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="text-warning fw-bold fs-3">
          🔥 {saleTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <h5 className="text-muted">Thời gian còn lại:</h5>
        <h2 className="text-danger fw-bold fs-1">{countdownTime}</h2>
        {endTime && (
          <p className="text-secondary mt-4">
            Khuyến mãi kết thúc vào: <strong>{formatDate(endTime)}</strong>
          </p>
        )}
        <p className="text-secondary mt-4">Chúng tôi có các sản phẩm ưu đãi hấp dẫn chỉ trong thời gian ngắn. Đừng bỏ lỡ cơ hội này!</p>
      </Modal.Body>
    </Modal>
  );
};

export default CountDown;
