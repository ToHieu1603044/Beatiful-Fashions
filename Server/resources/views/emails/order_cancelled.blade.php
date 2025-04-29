<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Đơn hàng bị hủy</title>
</head>
<body>
    <h2>Xin chào {{ $order->name ?? 'Khách hàng' }},</h2>

    <p>Chúng tôi rất tiếc phải thông báo rằng đơn hàng <strong>#{{ $order->id }}</strong> của bạn đã bị hủy do quá thời gian chờ thanh toán.</p>

    <p><strong>Chi tiết đơn hàng:</strong></p>
    <ul>
        <li>Mã đơn hàng: #{{ $order->id }}</li>
        <li>Ngày đặt: {{ $order->created_at->format('d/m/Y H:i') }}</li>
        <li>Phương thức thanh toán: {{ $order->payment_method}}</li>
        {{-- <li>Tổng tiền: {{$order->total}} VNĐ</li> --}}
    </ul>

    @if ($order->used_points)
        <p>Chúng tôi đã hoàn lại <strong>{{ $order->used_points }}</strong> điểm vào tài khoản của bạn.</p>
    @endif

    @if ($order->code)
        <p>Mã giảm giá <strong>{{ $order->code }}</strong> đã được khôi phục và bạn có thể sử dụng lại.</p>
    @endif

    <p>Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.</p>

    <p>Trân trọng,<br>
    {{ config('app.name') }} Team</p>
</body>
</html>
