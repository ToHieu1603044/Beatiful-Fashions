import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout";
import Categories from "./components/admin/categories/Categories";
import Attributes from "./components/admin/Attributes";
import Orders from "./components/admin/Orders";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";
import CategoryCreate from "./components/admin/categories/CategoryCreate";
import CategoryEdit from "./components/admin/categories/CategoryEdit";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />}>
        <Route path="categories" element={<Categories />} />
        <Route path="categories/create" element={<CategoryCreate />} />
        <Route path="categories/:id/edit" element={<CategoryEdit />} />
        <Route path="attributes" element={<Attributes />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
