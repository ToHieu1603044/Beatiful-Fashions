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

const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const role = localStorage.getItem("role"); 
  return role === "admin" ? element : <Navigate to="/403" />;
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
          ],
        },
        { path: "users", element: <Users /> },

        {
          path: "roles",
          element: <Roles />,
          children: [
           
          ],
        },
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
       
      ],
    },
    {
      path: "/checkout",
      element: <CheckOut />,
    },
    { path: "403", element: <Authorization /> },

  ]);

  return routes;
}

export default App;

