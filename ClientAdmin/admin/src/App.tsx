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
import Account from "./pages/client/Account";

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
import ProductTrash from "./pages/admin/products/ProductTrash";
import ResetPassword from "./pages/client/ResetPassword";



const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("access_token"); // Kiểm tra token đăng nhập

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
          path: "brands",
          element: <Brands />,
          children: [
            { path: "create", element: <BrandsAdd /> },
            { path: ":id/edit", element: <BrandsEdit /> },
          ],
        },
        { path: "orders", element: <Orders /> },

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
          path: "users", element: <Users />,
        },
        { path: "users/add", element: <AddUser /> },
        { path: "users/:id/edit", element: <EditUser /> },



        { path: "roles", element: <Roles /> },
        { path: "roles/create", element: <RolesAdd /> },
        { path: "roles/:id/edit", element: <EditRole /> },


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
        { path: "account", element: <Account /> },
        { path: "cart", element: <Cart /> },
        { path: "auth/reset-password", element: <ResetPassword /> },

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
