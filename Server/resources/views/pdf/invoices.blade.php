<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Danh sách hóa đơn</title>
    <style>
        body {
            font-family: "DejaVu Sans", sans-serif;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f4f4f4;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>

    @foreach ($orders as $order)
        <h2>🧾 HÓA ĐƠN BÁN HÀNG</h2>
        <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
        <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>

        <h3>🛍️ Thông tin khách hàng</h3>
        <p><strong>Họ tên:</strong> {{ $order->name }}</p>
        <p><strong>Địa chỉ:</strong> {{ $order->address }}, {{ $order->ward }}, {{ $order->district }},
            {{ $order->city }}</p>

        <h3>🛒 Chi tiết đơn hàng</h3>
        <table>
            <tr>
                <th>Sản phẩm</th>
                <th>Biến thể</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
            @foreach ($order->orderDetails as $detail)
                @php
                    $variants = json_decode($detail->variant_details, true);
                    $variantText = collect($variants)->map(fn($value, $key) => "$key: $value")->join(', ');
                @endphp
                <tr>
                    <td>{{ $detail->product_name }}</td>
                    <td>{{ $variantText }}</td>
                    <td>{{ $detail->quantity }}</td>
                    <td>{{ number_format($detail->price) }} VNĐ</td>
                    <td>{{ number_format($detail->subtotal) }} VNĐ</td>
                </tr>
            @endforeach
        </table>

        <h3>🏦 Thanh toán</h3>
        <p><strong>Tổng tiền hàng:</strong> {{ number_format($order->subtotal) }} VNĐ</p>
        <p><strong>Phí vận chuyển:</strong> {{ number_format($order->shipping_fee) }} VNĐ</p>
        <p><strong>Tổng thanh toán:</strong> <strong>{{ number_format($order->total_amount) }} VNĐ</strong> ✅</p>

        <p>Cảm ơn bạn đã mua sắm tại **{{ config('app.name') }}**!</p>

        <!-- Ngắt trang giữa các hóa đơn -->
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach

</body>

</html>
