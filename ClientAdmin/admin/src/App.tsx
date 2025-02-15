import { useRoutes } from "react-router-dom";
import Admin from "./layouts/admin/Admin";
import Categories from "./pages/admin/categories/Categories";
import Attributes from "./pages/admin/attributes/Attributes";
import Orders from "./pages/admin/orders/Orders";
import Products from "./pages/admin/products/Products";
import Users from "./pages/admin/users/Users";
import AttributesAdd from "./pages/admin/attributes/AttributesAdd";
import AttributesEdit from "./pages/admin/attributes/AttributesEdit";
import ProductAdd from "./pages/admin/products/ProductsAdd";
import ProductsEdit from "./pages/admin/products/ProductsEdit";
import CategoriesAdd from "./pages/admin/categories/CategoriesAdd";
import CategoriesEdit from "./pages/admin/categories/CategoriesEdit";

function App() {
  const routes = useRoutes([
    {
      path: "admin",
      element: <Admin />,
      children: [
        { 
          path: "categories", 
          element: <Categories />, 
          children: [
            { path: "add", element: <CategoriesAdd /> },
            { path: "edit", element: <CategoriesEdit /> },
          ],
        },
        { 
          path: "attributes", 
          element: <Attributes />, 
          children: [
            { path: "add", element: <AttributesAdd /> },
            { path: "edit", element: <AttributesEdit /> },
          ],
        },
        { path: "orders", element: <Orders /> },
        { 
          path: "products", 
          element: <Products />, 
          children: [
            { path: "add", element: <ProductAdd /> },
            { path: "edit", element: <ProductsEdit /> },
          ],
        },
        { path: "users", element: <Users /> },
      ],
    },
  ]);

  return routes;
}

export default App;
