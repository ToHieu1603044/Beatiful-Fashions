import { Navigate, useRoutes } from "react-router-dom";
import Admin from "./layouts/admin/Admin";
import Clients from "./layouts/clients/Clients";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/categories/Categories";
import CategoriesAdd from "./pages/admin/categories/CategoriesAdd";
import CategoriesEdit from "./pages/admin/categories/CategoriesEdit";
import Attributes from "./pages/admin/attributes/Attributes";
import AttributesAdd from "./pages/admin/attributes/AttributesAdd";
import AttributesEdit from "./pages/admin/attributes/AttributesEdit";
import Products from "./pages/admin/products/Products";
import ProductsAdd from "./pages/admin/products/ProductsAdd";
import ProductsEdit from "./pages/admin/products/ProductsEdit";
import ProductTrash from "./pages/admin/products/ProductTrash";
import Brands from "./pages/admin/barnds/Brands";
import BrandsAdd from "./pages/admin/barnds/BrandsAdd";
import BrandsEdit from "./pages/admin/barnds/BrandsEdit";
import Orders from "./pages/admin/orders/Orders";
import OrderReturn from "./pages/admin/orders/OrderReturn";
import Users from "./pages/admin/users/Users";
import Staff from "./pages/admin/users/Staff";
import AddUser from "./pages/admin/users/AddUser";
import EditUser from "./pages/admin/users/EditUser";
import Roles from "./pages/admin/roles/Roles";
import RolesAdd from "./pages/admin/roles/Rolesadd";
import EditRole from "./pages/admin/roles/Rolesedit";
import Permission from "./pages/admin/permissions/Permission";
import PermissionsAdd from "./pages/admin/permissions/PermissionsAdd";
import PermissionsEdit from "./pages/admin/permissions/PermissionsEdit";
import Discount from "./pages/admin/discounts/Discount";
// import Comment from "./pages/admin/comments/Comment";

// Client Pages
import ProductCategories from "./pages/client/ProductCategories";
import DetailProducts from "./pages/client/DetailProducts";
import Cart from "./pages/client/Cart";
import Login from "./pages/client/Login";
import Register from "./pages/client/Register";
import Profile from "./pages/client/Profile";
import ResetPassword from "./pages/client/ResetPassword";
import ForgotPassword from "./pages/client/FogotPassword";
import Order from "./pages/client/Order";
import OrderCallback from "./pages/client/OrderCallback";
import OrderSuccess from "./pages/client/OrderSuccess";
import OrderFail from "./pages/client/OrderFail";
import OrderPending from "./pages/client/OrderPending";
import OrderReturns from "./pages/client/OrderReturns";
import SearchProducts from "./pages/client/SearchProducts";
import Whishlish from "./pages/client/Whishlish";

import Index from "./pages/admin/sales/Index";
import Comment from "./pages/admin/comments/Comment";
import Settings from "./pages/admin/Settings";
import Comments from "./pages/admin/comments/Comments";
import Sales from "./pages/admin/sales/Sales";
import { getMaintenanceStatus } from "./services/homeService"; // API check bảo trì
import MaintenancePage from "./pages/client/MaintenancePage"; // Trang hiển thị bảo trì
import { Spin } from "antd";
import { useEffect, useState } from "react";
import BannerSlideForm from "./pages/admin/BannerSlideForm";
import BannerSlide from "./pages/admin/BannerSlide";
import CategoriesTrash from "./pages/admin/categories/CategoriesTrash";
import ChinhSachBaoMat from "./pages/client/chinhsach/ChinhSachBaoMat";
import ChinhSachThanhToan from "./pages/client/chinhsach/ChinhSachThanhToan";
import ChinhSachVanChuyen from "./pages/client/chinhsach/ChinhSachVanChuyen";
import ChinhSachDoiHang from "./pages/client/chinhsach/ChinhSachDoiHang";
import HuongDan from "./pages/client/chinhsach/HuongDan";
import GioiThieu from "./pages/client/chinhsach/Gioithieu";
import Dieukhoan from "./pages/client/chinhsach/Dieukhoan";
import Authorization from "./pages/403";
import BannerSlideFormUpdate from "./pages/admin/BannerSlideFormUpdate";
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const [allowed, setAllowed] = useState<null | boolean>(null);


  

  if (allowed === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
        <Spin size="large" tip="Đang kiểm tra phân quyền..." />
      </div>
    );
  }

  return allowed ? element : <Navigate to="/403" />;
};

function App() {
  const routes = useRoutes([
    {
      path: "/admin",
      element: <Admin />,
      children: [
        { index: true, element: <Dashboard /> },

        {
          path: "categories",
          element: <ProtectedRoute element={<Categories />} />,
          children: [
            { path: "create", element: <ProtectedRoute element={<CategoriesAdd />} />, },
            { path: ":id/edit",  element: <ProtectedRoute element={<CategoriesEdit />} />, },
           
          ],
        },

        {
          path: "attributes",
          element: <Attributes />,
          children: [
            { path: "create", element: <AttributesAdd /> },
            { path: "edit/:id", element: <AttributesEdit /> },
          ],
        },

        {
          path: "products",
          element: <Products />,
          children: [
            { path: "create", element: <ProductsAdd /> },
            { path: ":id/edit", element: <ProductsEdit /> },
            { path: "trash", element: <ProductTrash /> },
          ],
        },

        {
          path: "brands",
          element: <Brands />,
          children: [
            { path: "create", element: <BrandsAdd /> },
            { path: ":id/edit", element: <BrandsEdit /> },
          ],
        },

        { path: "orders", element: <Orders /> },
        { path: "orders/returns", element: <OrderReturn /> },

        { path: "users", element: <Users /> },
        { path: "users/add", element: <AddUser /> },
        { path: "users/:id/edit", element: <EditUser /> },
        { path: "users/customers", element: <Users /> },
        { path: "users/staff", element: <Staff /> },

        { path: "roles", element: <Roles /> },
        { path: "roles/create", element: <RolesAdd /> },
        { path: "roles/:id/edit", element: <EditRole /> },

        { path: "permissions", element: <Permission /> },
        { path: "permissions/create", element: <PermissionsAdd /> },
        { path: "permissions/:id/edit", element: <PermissionsEdit /> },

        { path: "settings", element: <Settings />, },
        { path: "comments", element: <Comments /> },
        { path: "discounts", element: <Discount />, },
        { path: "sales", element: <Sales />, },
        { path: "index-sales", element: <Index />, },
        { path: "slider/create", element: <BannerSlideForm />, },
        { path: "slider/edit/:id", element: <BannerSlideFormUpdate />, },
        { path: "slider", element: <BannerSlide />, },
        { path: "categories/trashed", element: <ProtectedRoute element={<CategoriesTrash />} />, },

      ],
    },
    {
      path: "/",
      element: <Clients />,
      children: [
        { path: "category/:id/:slug", element: <ProductCategories /> },
        { path: "products/:id/detail", element: <DetailProducts /> },
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "cart", element: <Cart /> },
        { path: "auth/reset-password", element: <ResetPassword /> },
        { path: "auth/forgot-password", element: <ForgotPassword /> },
        { path: "orders", element: <Order /> },
        { path: "account", element: <Profile /> },
        { path: "searchs", element: <SearchProducts /> },
        { path: "order-callback", element: <OrderCallback /> },
        { path: "order-success", element: <OrderSuccess /> },
        { path: "order-fail", element: <OrderFail /> },
        { path: "order-pending", element: <OrderPending /> },
        { path: "wishlist", element: <Whishlish /> },
        { path: "order-returns", element: <OrderReturns /> },

        { path: "dieu-khoan", element: <Dieukhoan /> },
        { path: "gioi-thieu", element: <GioiThieu /> },
        { path: "huong-dan", element: <HuongDan /> },
        { path: "chinh-sach-bao-mat", element: <ChinhSachBaoMat /> },
        { path: "chinh-sach-thanh-toan", element: <ChinhSachThanhToan /> },
        { path: "chinh-sach-van-chuyen", element: <ChinhSachVanChuyen /> },
        { path: "chinh-sach-doi-hang", element: <ChinhSachDoiHang /> },

      ],
    },
    { path: "/403", element: <Authorization /> },
  ]);

  return routes;
}

export default App;
