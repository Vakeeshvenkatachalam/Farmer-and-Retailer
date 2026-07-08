import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FiHome, FiBox, FiPlusSquare, FiShoppingBag, 
  FiUser, FiUsers, FiCheckSquare, FiPieChart, FiBell, FiLogOut, FiSettings 
} from "react-icons/fi";

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, label }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
          active 
            ? "bg-primary text-white shadow-md shadow-primary/30" 
            : "text-text-medium hover:bg-green-50 hover:text-primary"
        }`}
      >
        <Icon className={`text-xl ${active ? "text-white" : "text-gray-400"}`} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen fixed left-0 top-0 flex flex-col shadow-sm z-20 hidden md:flex">
      <Link to="/" className="h-20 flex items-center px-6 border-b border-gray-50 hover:opacity-90">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <span>🌾</span> FarmConnect
        </h2>
      </Link>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {user?.role === "ADMIN" && (
          <>
            <NavLink to="/admin" icon={FiHome} label="Dashboard" />
            <NavLink to="/admin/users" icon={FiCheckSquare} label="User Approvals" />
            <NavLink to="/admin/farmers" icon={FiUser} label="Farmers" />
            <NavLink to="/admin/retailers" icon={FiUsers} label="Retailers" />
            <NavLink to="/admin/products" icon={FiBox} label="Products" />
            <NavLink to="/admin/orders" icon={FiShoppingBag} label="Orders" />
            <NavLink to="/admin/analytics" icon={FiPieChart} label="Analytics" />
            <NavLink to="/admin/notifications" icon={FiBell} label="Notifications" />
            <NavLink to="/admin/profile" icon={FiSettings} label="Profile" />
          </>
        )}

        {user?.role === "FARMER" && (
          <>
            <NavLink to="/farmer" icon={FiHome} label="Dashboard" />
            <NavLink to="/farmer/my-products" icon={FiBox} label="My Products" />
            <NavLink to="/farmer/add-product" icon={FiPlusSquare} label="Add Product" />
            <NavLink to="/farmer/orders" icon={FiShoppingBag} label="Orders" />
            <NavLink to="/farmer/notifications" icon={FiBell} label="Notifications" />
            <NavLink to="/farmer/profile" icon={FiUser} label="Profile" />
          </>
        )}

        {user?.role === "RETAILER" && (
          <>
            <NavLink to="/retailer" icon={FiHome} label="Dashboard" />
            <NavLink to="/retailer/browse" icon={FiBox} label="Browse Products" />
            <NavLink to="/retailer/orders" icon={FiShoppingBag} label="My Orders" />
            <NavLink to="/retailer/notifications" icon={FiBell} label="Notifications" />
            <NavLink to="/retailer/profile" icon={FiUser} label="Profile" />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button 
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors font-semibold" 
          onClick={logout}
        >
          <FiLogOut /> Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;