import { Navigate, useRoutes } from "react-router-dom";
import Admin from "./layouts/admin/Admin";
import Categories from "./pages/admin/categories/Categories";
import Attributes from "./pages/admin/attributes/Attributes";
import Orders from "./pages/admin/orders/Orders";
import Products from "./pages/admin/products/Products";
import Users from "./pages/admin/users/Users";
import CategoriesAdd from "./pages/admin/categories/CategoriesAdd";
import CategoriesEdit from "./pages/admin/categories/CategoriesEdit";
import AttributesAdd from "./pages/admin/attributes/AttributesAdd";
import AttributesEdit from "./pages/admin/attributes/AttributesEdit";
import ProductsEdit from "./pages/admin/products/ProductsEdit";
import ProductsAdd from "./pages/admin/products/ProductsAdd";
import Brands from "./pages/admin/barnds/Brands";
import BrandsAdd from "./pages/admin/barnds/BrandsAdd";
import BrandsEdit from "./pages/admin/barnds/BrandsEdit";
import Clients from "./layouts/clients/Clients";
import ProductCategories from "./pages/client/ProductCategories";
import DetailProducts from "./pages/client/DetailProducts";
import CheckOut from "./pages/client/CheckOut";
import Login from "./pages/client/Login";
import Register from "./pages/client/Register";
import Cart from "./pages/client/Cart";
import Authorization from "./pages/403";
import Roles from "./pages/admin/roles/Roles";
import RolesAdd from "./pages/admin/roles/Rolesadd";
import EditRole from "./pages/admin/roles/Rolesedit";
import AddUser from "./pages/admin/users/AddUser";
import EditUser from "./pages/admin/users/EditUser";
import OrderCallback from "./pages/client/OrderCallback";
import OrderSuccess from "./pages/client/OrderSuccess";
import OrderFail from "./pages/client/OrderFail";
import OrderPending from "./pages/client/OrderPending";
import Permission from "./pages/admin/permissions/Permission";
import PermissionsAdd from "./pages/admin/permissions/PermissionsAdd";
import PermissionsEdit from "./pages/admin/permissions/PermissionsEdit";
import Staff from "./pages/admin/users/Staff";
import Profile from "./pages/client/Profile"
import ProductTrash from "./pages/admin/products/ProductTrash";
import ResetPassword from "./pages/client/ResetPassword";
import SearchProducts from "./pages/client/SearchProducts";
import Order from "./pages/client/Order";
import Dashboard from "./pages/admin/Dashboard";
import Discount from "./pages/admin/discounts/Discount";
import OrderReturn from "./pages/admin/orders/OrderReturn";
import OrderReturns from "./pages/client/OrderReturns";
import ForgotPassword from "./pages/client/FogotPassword";
import Whislish from "./pages/client/Whishlish";
import Whishlish from "./pages/client/Whishlish";
import Index from "./pages/admin/sales/Index";
import Comment from "./pages/admin/comments/Comment";
import Settings from "./pages/admin/Settings";
import Comments from "./pages/admin/comments/Comments";
import Sales from "./pages/admin/sales/Sales";
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

        { path: "users", element: <Users />,
        },
        { path: "users/add", element: <AddUser/> },
        { path: "users/:id/edit", element: <EditUser /> },

        {
          path: "attributes",
          element: <Attributes />,
          
          children: [
            { path: "create", element: <AttributesAdd /> },
            { path: "edit/:id", element: <AttributesEdit /> },
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
          path: "users/customers", element: <Users />,
        },
        {
          path: "users/staff", element: <Staff />,
        },
        { path: "users/add", element: <AddUser /> },
        { path: "users/:id/edit", element: <EditUser /> },
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
        { path: "orders/return", element: <OrderReturns /> },
        { path: "whishlish", element: <Whishlish /> },
        {path: "sales", element: <Index />},
        { path: "whislist", element: <Whishlish /> },
      ],
    },
    {
      path: "/checkout",
      element: <CheckOut />,
    },
    { path: "403", element: <Authorization /> },
    { path: "momo/callback/", element: <OrderCallback /> },
    { path: "order/success", element: <OrderSuccess /> },

    { path: "order/failed", element: <OrderFail /> },

    { path: "order/pending", element: <OrderPending /> },
   
    
  ]);

  return routes;
}

export default App;
