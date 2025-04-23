<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>401 Unauthorized</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      height: 100vh;
      background: linear-gradient(135deg, #ffecd2, #fcb69f);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container {
      background-color: #fff;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      text-align: center;
      max-width: 500px;
      width: 90%;
    }

    .error-code {
      font-size: 120px;
      font-weight: 800;
      color: #ff6b6b;
    }

    .message {
      font-size: 24px;
      color: #333;
      margin-top: -15px;
    }

    .description {
      color: #777;
      margin-top: 10px;
      font-size: 16px;
    }

    .button {
      display: inline-block;
      margin-top: 30px;
      padding: 12px 25px;
      font-size: 16px;
      border-radius: 8px;
      background-color: #ff6b6b;
      color: #fff;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }

    .button:hover {
      background-color: #ff4c4c;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-code">401</div>
    <div class="message">Truy cập bị từ chối</div>
    <div class="description">Bạn không có quyền truy cập vào trang này.<br>Hãy đăng nhập hoặc quay lại trang chính.</div>
    <a href="/" class="button">Quay về trang chủ</a>
  </div>
</body>
</html>
