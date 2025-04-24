<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>500 Internal Server Error</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      height: 100vh;
      background: linear-gradient(135deg, #e0c3fc, #8ec5fc);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      background-color: #fff;
      padding: 60px 40px;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 520px;
      width: 90%;
    }

    .error-code {
      font-size: 120px;
      font-weight: 800;
      color: #6a11cb;
      animation: pulse 1.5s infinite ease-in-out;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .message {
      font-size: 26px;
      color: #333;
      margin-top: -10px;
    }

    .description {
      color: #666;
      margin-top: 12px;
      font-size: 16px;
    }

    .button {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 25px;
      font-size: 16px;
      border-radius: 8px;
      background-color: #6a11cb;
      color: #fff;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #4b0e9d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-code">500</div>
    <div class="message">Lỗi máy chủ nội bộ</div>
    <div class="description">Đã có sự cố xảy ra trên máy chủ.<br>Vui lòng thử lại sau hoặc liên hệ quản trị viên.</div>
    <a href="/" class="button">Quay lại trang chủ</a>
  </div>
</body>
</html>
