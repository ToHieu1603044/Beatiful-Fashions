import { Route, Routes } from "react-router-dom";
import Dashboard from "./DashBoard";
import Categories from "./components/Categories";
import Attributes from "./components/Attributes";
import Orders from "./components/Orders";
import Products from "./components/Products";
import Users from "./components/Users";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
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
