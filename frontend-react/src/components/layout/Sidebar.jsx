import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar">
      <h2>🌾 FarmConnect</h2>

      {user?.role === "ADMIN" && (
        <>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/users">User Approvals</Link>
          <Link to="/admin/analytics">Analytics</Link>
        </>
      )}

      {user?.role === "FARMER" && (
        <>
          <Link to="/farmer">Dashboard</Link>
          <Link to="/farmer/my-products">My Products</Link>
          <Link to="/farmer/add-product">Add Product</Link>
          <Link to="/farmer/orders">Orders</Link>
          <Link to="/farmer/profile">Profile</Link>
        </>
      )}

      {user?.role === "RETAILER" && (
        <>
          <Link to="/retailer">Dashboard</Link>
          <Link to="/retailer/browse">Browse Products</Link>
          <Link to="/retailer/orders">My Orders</Link>
          <Link to="/retailer/notifications">🔔 Notifications</Link>
          <Link to="/retailer/profile">Profile</Link>
        </>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Sidebar;