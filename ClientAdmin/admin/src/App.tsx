import { useRoutes } from "react-router-dom";
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

function App() {
  const routes = useRoutes([
    {
      path: "/admin",
      element: <Admin />, 
      children: [
        { 
          path: "categories", 
          element: <Categories />, 
          children: [
            { path: "create", element: <CategoriesAdd /> },
            { path: "edit", element: <CategoriesEdit /> }
          ]
        },
        { 
          path: "attributes", 
          element: <Attributes />, 
          children: [
            { path: "create", element: <AttributesAdd /> },
            { path: "edit", element: <AttributesEdit /> }
          ]
        },
        { path: "orders", element: <Orders /> },
        { 
          path: "products", 
          element: <Products />, 
          children: [
            { path: "create", element: <ProductsAdd /> },
            { path: "edit", element: <ProductsEdit /> }
          ]
        },
        { path: "users", element: <Users /> },
      ]
    }
  ]);
  
  return routes;
}

export default App;
