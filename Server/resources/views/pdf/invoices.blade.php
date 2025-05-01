<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hóa đơn bán hàng</title>
    <style>
        @page { margin: 20mm; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 80mm; /* Kích thước giấy in nhiệt phổ biến */
            margin: 0 auto;
            padding: 10mm;
            border: 1px solid #ddd;
            background-color: #fff;
        }
        .header {
            text-align: center;
            margin-bottom: 10mm;
        }
        .header img {
            max-width: 40mm;
            height: auto;
        }
        .header h1 {
            font-size: 14pt;
            margin: 5mm 0;
            text-transform: uppercase;
        }
        .header p {
            font-size: 10pt;
            margin: 2mm 0;
            color: #555;
        }
        .order-info, .customer-info, .payment-info {
            margin-bottom: 8mm;
        }
        .order-info p, .customer-info p, .payment-info p {
            font-size: 10pt;
            margin: 2mm 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8mm;
        }
        th, td {
            border: 1px dashed #999;
            padding: 3mm;
            font-size: 10pt;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        .total {
            font-weight: bold;
            font-size: 11pt;
        }
        .footer {
            text-align: center;
            font-size: 10pt;
            color: #555;
            margin-top: 8mm;
        }
        .barcode {
            text-align: center;
            margin-top: 5mm;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    @foreach ($orders as $order)
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="{{ public_path('images/logo.png') }}" alt="Logo">
                <h1>{{ config('app.name') }}</h1>
                <p>Địa chỉ: Hưng Hà Thái Bình </p>
                <p>Hotline: 0344451632 | Email: tthieu160304@gmail.com</p>
                <p>Website: {{ config('app.url') }}</p>
            </div>

            <!-- Order Info -->
            <div class="order-info">
                <h2 style="font-size: 12pt; text-align: center;">HÓA ĐƠN BÁN HÀNG</h2>
                <p><strong>Mã đơn hàng:</strong> #{{ $order->id }}</p>
                <p><strong>Ngày đặt hàng:</strong> {{ $order->created_at->format('d/m/Y H:i') }}</p>
                <p><strong>Phương thức thanh toán:</strong> {{ $order->payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online' }}</p>
            </div>

            <!-- Customer Info -->
            <div class="customer-info">
                <h3 style="font-size: 11pt;">Thông tin khách hàng</h3>
                <p><strong>Họ tên:</strong> {{ $order->name }}</p>
                <p><strong>Điện thoại:</strong> {{ $order->phone }}</p>
                <p><strong>Địa chỉ:</strong> {{ $order->address }}, {{ $order->ward }}, {{ $order->district }}, {{ $order->city }}</p>
            </div>

            <!-- Order Details -->
            <h3 style="font-size: 11pt;">Chi tiết đơn hàng</h3>
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%;">Sản phẩm</th>
                        <th style="width: 30%;">Biến thể</th>
                        <th style="width: 10%;">SL</th>
                        <th style="width: 20%;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($order->orderDetails as $detail)
                        @php
                            $variants = json_decode($detail->variant_details, true);
                            $variantText = collect($variants)->map(fn($value, $key) => "$key: $value")->join(', ');
                        @endphp
                        <tr>
                            <td>{{ $detail->product_name }}</td>
                            <td>{{ $variantText ?: 'Không có' }}</td>
                            <td>{{ $detail->quantity }}</td>
                            <td>{{ number_format($detail->subtotal) }} VNĐ</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Payment Info -->
            <div class="payment-info">
                <p><strong>Tổng tiền hàng:</strong> {{ number_format($order->subtotal ?? $order->total_amount - $order->price_shipped) }} VNĐ</p>
                <p><strong>Phí vận chuyển:</strong> {{ number_format($order->price_shipped ?? 0) }} VNĐ</p>
                @if ($order->discount_amount > 0)
                    <p><strong>Giảm giá:</strong> -{{ number_format($order->discount_amount) }} VNĐ</p>
                @endif
                <p class="total"><strong>Tổng thanh toán:</strong> {{ number_format($order->total_amount) }} VNĐ</p>
            </div>

            <!-- Barcode (Tùy chọn) -->
            <div class="barcode">
                <img src="https://barcode.tec-it.com/barcode.ashx?data={{ $order->id }}&code=Code128&dpi=96" alt="Barcode">
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>Cảm ơn bạn đã mua sắm tại <strong>Beautiful Fashion</strong>!</p>
                <p>Vui lòng kiểm tra kỹ hàng hóa trước khi nhận.</p>
                <p>Liên hệ hỗ trợ: 034451632</p>
            </div>
        </div>

        <!-- Ngắt trang giữa các hóa đơn -->
        @if (!$loop->last)
            <div class="page-break"></div>
        @endif
    @endforeach
</body>
</html>