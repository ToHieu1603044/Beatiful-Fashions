import { Route, Routes } from "react-router-dom";
import Dashboard from "./Layout";
import Categories from "./components/admin/Categories";
import Attributes from "./components/admin/Attributes";
import Orders from "./components/admin/Orders";
import Products from "./components/admin/Products";
import Users from "./components/admin/Users";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<Dashboard />}>
        <Route path="categories" element={<Categories />} />
        <Route path="attributes" element={<Attributes />} />
        <Route path="orders" element={<Orders />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
