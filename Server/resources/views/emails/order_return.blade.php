<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận yêu cầu hoàn hàng</title>
</head>
<body>
    <h2>Xin chào {{ $order->user->name }},</h2>
    <p>Bạn đã gửi yêu cầu hoàn hàng cho đơn hàng <strong>#{{ $order->id }}</strong>.</p>
    
    <h3>Thông tin sản phẩm hoàn trả:</h3>
    <table border="1" cellpadding="10" cellspacing="0">
        <thead>
            <tr>
                <th>Sản phẩm</th>
                <th>Phân loại</th>
                <th>SKU</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($returnItems as $item)
                <tr>
                    <td>{{ $item['product_name'] }}</td>
                    <td>
                        @foreach ($item['variant_details'] as $key => $value)
                            {{ $key }}: {{ $value }}<br>
                        @endforeach
                    </td>
                    <td>{{ $item['sku'] }}</td>
                    <td>{{ $item['quantity'] }}</td>
                    <td>{{ number_format($item['price'], 0, ',', '.') }} VNĐ</td>
                    <td>{{ number_format($item['subtotal'], 0, ',', '.') }} VNĐ</td>
                    <td>{{ ucfirst($item['return_status']) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p>Nếu có bất kỳ vấn đề gì, vui lòng liên hệ bộ phận hỗ trợ.</p>
    <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
</body>
</html>
