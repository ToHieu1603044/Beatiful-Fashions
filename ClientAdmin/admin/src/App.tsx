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

// Other Pages
import Authorization from "./pages/403";

import Dieukhoan from "./pages/client/chinhsach/Dieukhoan";
import GioiThieu from "./pages/client/chinhsach/Gioithieu";
import HuongDan from "./pages/client/chinhsach/HuongDan";
import ChinhSachBaoMat from "./pages/client/chinhsach/ChinhSachBaoMat";
import ChinhSachThanhToan from "./pages/client/chinhsach/ChinhSachThanhToan";
import ChinhSachVanChuyen from "./pages/client/chinhsach/ChinhSachVanChuyen";
import ChinhSachDoiHang from "./pages/client/chinhsach/ChinhSachDoiHang";



const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/403" />;
  }

  return role === "admin" || role === "manager" ? element : <Navigate to="/403" />;
};

function App() {
  const routes = useRoutes([
    {
      path: "/admin",
      element: <ProtectedRoute element={<Admin />} />,
      children: [
        { index: true, element: <Dashboard /> },

        {
          path: "categories",
          element: <Categories />,
          children: [
            { path: "create", element: <CategoriesAdd /> },
            { path: ":id/edit", element: <CategoriesEdit /> },
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

        { path: "discounts", element: <Discount /> },
        // { path: "comments", element: <Comment /> },
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
