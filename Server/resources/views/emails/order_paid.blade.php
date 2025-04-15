{{-- @component('mail::message')
# Cảm ơn bạn đã mua hàng! 🎉

Đơn hàng #{{ $order->id }} của bạn đã được thanh toán thành công.

## **Thông tin đơn hàng**
- **Họ tên:** {{ $order->name }}  
- **Email:** {{ $order->email }}  
- **Số điện thoại:** {{ $order->phone }}  
- **Địa chỉ:** {{ $order->address }}, {{ $order->ward }}, {{ $order->district }}, {{ $order->city }}  
- **Tổng tiền:** {{ number_format($order->total_amount) }} VNĐ  
- **Thanh toán:** Thành công ✅  
- **Trạng thái:** Chờ xác nhận  

---

## **🛒 Danh sách sản phẩm**
@foreach ($order->orderDetails as $detail)
### {{ $detail->product_name }}
- **Biến thể:**  
  @php
    $variants = json_decode($detail->variant_details, true);
  @endphp
  @foreach ($variants as $key => $value)
    - {{ $key }}: {{ $value }}  
  @endforeach
- **Số lượng:** {{ $detail->quantity }}  
- **Giá:** {{ number_format($detail->price) }} VNĐ  
- **Thành tiền:** {{ number_format($detail->subtotal) }} VNĐ  
@endforeach  

---

@component('mail::button', ['url' => env('FRONTEND_URL') . "/order/detail/{$order->id}"])
Xem đơn hàng
@endcomponent
    
Cảm ơn bạn đã tin tưởng chúng tôi!  
**{{ config('app.name') }}**
@endcomponent --}}


@component('mail::message')
# 🧾 HÓA ĐƠN BÁN HÀNG

**Mã đơn hàng:** #{{ $order->id }}  
📅 **Ngày đặt hàng:** {{ $order->created_at->format('d/m/Y H:i') }}  

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
| **{{ $detail->product_name }}** | {{ $variantText }} | {{ $detail->quantity }} | {{ number_format($detail->price) }} VNĐ | {{ number_format($detail->subtotal) }} VNĐ |
@endforeach

---

### 🏦 Thanh toán
- **Tổng tiền hàng:** {{ number_format($order->subtotal) }} VNĐ  
- **Phí vận chuyển:** {{ number_format($order->shipping_fee) }} VNĐ  
- **Tổng thanh toán:** **{{ number_format($order->total_amount) }} VNĐ** ✅  

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
