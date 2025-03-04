@component('mail::message')
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
@endcomponent
