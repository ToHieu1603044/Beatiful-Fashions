
@component('mail::message')
# 🧾 HÓA ĐƠN BÁN HÀNG

**Mã đơn hàng:** #{{ $order->id }}  
{{-- 📅 **Ngày đặt hàng:** {{ $order->created_at }}   --}}

---

## 🛍️ Thông tin khách hàng
**Họ tên:** {{ $order->name }}  
📧 **Email:** {{ $order->email }}  
📞 **Số điện thoại:** {{ $order->phone }}  
🏠 **Địa chỉ:** {{ $order->address }}, {{ $order->ward }}, {{ $order->district }}, {{ $order->city }}  

---

## 🛒 Chi tiết đơn hàng
| Sản phẩm | Biến thể | Số lượng | Đơn giá | Thành tiền |
|----------|---------|---------:|---------:|-----------:|
@foreach ($order->orderDetails as $detail)
@php
  $variants = json_decode($detail->variant_details, true);
  $variantText = collect($variants)->map(fn($value, $key) => "$key: $value")->join(', ');
@endphp
| **{{ $detail->product_name }}** | {{ $variantText }} | {{ $detail->quantity }} | {{ $detail->price}} VNĐ | {{ $detail->subtotal }} VNĐ |
@endforeach

---

### 🏦 Thanh toán
{{-- - **Tổng tiền hàng:** {{$order->subtotal}} VNĐ   --}}
- **Phí vận chuyển:** {{ $order->shipping_fee }} VNĐ  
- **Tổng thanh toán:** **{{ $order->total_amount }} VNĐ** ✅  

---

@component('mail::button', ['url' => env('FRONTEND_URL') . "/order/detail/{$order->id}"])
📦 Xem chi tiết đơn hàng
@endcomponent

Cảm ơn bạn đã mua sắm tại **{{ config('app.name') }}**!  
Nếu có bất kỳ câu hỏi nào, hãy liên hệ ngay với chúng tôi.  

**{{ config('app.name') }}**  
📞 Hỗ trợ: {{ config('app.support_phone') }}  
📧 Email: {{ config('app.support_email') }}  

@endcomponent
