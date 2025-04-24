// Format thành dạng DD/MM/YYYY
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  // Format dạng đầy đủ có giờ: DD/MM/YYYY HH:mm
  export function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  // ISO 8601 -> YYYY-MM-DD (dùng cho input type="date")
  export function toInputDateFormat(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
// Format số thành tiền tệ: 1000000 -> 1.000.000 ₫
export function formatCurrencyVND(amount) {
    return amount.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    });
  }
  
  // Format số thành USD
  export function formatCurrencyUSD(amount) {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
  export function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  export function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  }
  export function removeVietnameseTones(str) {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
  export function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
  }
            