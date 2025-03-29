import { useState } from "react";
import { Tabs, Tab } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LucideEdit } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState({
    avatar: "/avatar.png",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    points: 500,
  });

  return (
    <div className="container mx-auto p-6">
      <Card className="p-4 flex items-center gap-4">
        <Avatar src={user.avatar} className="w-16 h-16" />
        <div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-gray-500">Số điện thoại: {user.phone}</p>
        </div>
        <Button variant="outline" className="ml-auto flex items-center gap-2">
          <LucideEdit size={16} /> Chỉnh sửa
        </Button>
      </Card>
      
      <Tabs className="mt-6">
        <Tab label="Đơn hàng">
          <CardContent>
            <p>Danh sách đơn hàng của bạn.</p>
          </CardContent>
        </Tab>
        <Tab label="Ví Voucher">
          <CardContent>
            <p>Danh sách mã giảm giá.</p>
          </CardContent>
        </Tab>
        <Tab label="Shopee Xu">
          <CardContent>
            <p>Bạn có <strong>{user.points}</strong> Shopee Xu.</p>
          </CardContent>
        </Tab>
        <Tab label="Địa chỉ nhận hàng">
          <CardContent>
            <p>Quản lý địa chỉ giao hàng của bạn.</p>
          </CardContent>
        </Tab>
        <Tab label="Bảo mật & Cài đặt">
          <CardContent>
            <p>Thay đổi mật khẩu và cài đặt bảo mật.</p>
          </CardContent>
        </Tab>
      </Tabs>
    </div>
  );
}
