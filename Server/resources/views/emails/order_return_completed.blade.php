@component('mail::message')
# Xác nhận hoàn trả đơn hàng

Chào {{ $orderReturn->user->name }},

Đơn hàng hoàn trả của bạn đã được **hoàn tất**.

- Mã đơn hàng: **#{{ $orderReturn->order_id }}**
- Tổng tiền hoàn: **{{ number_format($orderReturn->returnItems->sum('refund_amount'), 0, ',', '.') }} VNĐ**
- Ngày hoàn tất: **{{ now()->format('d/m/Y') }}**

Cảm ơn bạn đã tin tưởng chúng tôi!

@component('mail::button', ['url' => url('/orders/'.$orderReturn->order_id)])
Xem đơn hàng
@endcomponent

Trân trọng,<br>
{{ config('app.name') }}
@endcomponent
