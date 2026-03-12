import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/auth/AdminLogin";
import FarmerProfile from "./pages/farmer/FarmerProfile";
import RetailerProfile from "./pages/retailer/RetailerProfile";
import AdminProfile from "./pages/admin/AdminProfile";
import RetailerDashboard from "./pages/retailer/RetailerDashboard";
/* Public Pages */
import LandingPage from "./pages/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* Admin Pages */
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserApprovals from "./pages/admin/UserApprovals";
import Analytics from "./pages/admin/Analytics";

/* Farmer Pages */
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import AddProduct from "./pages/farmer/AddProduct";
import FarmerOrders from "./pages/farmer/FarmerOrders";

/* Retailer Pages */
import BrowseProducts from "./pages/retailer/BrowseProducts";
import MyOrders from "./pages/retailer/MyOrders";


/* Components */
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/farmer/profile" element={<FarmerProfile />} />
      <Route path="/retailer/profile" element={<RetailerProfile />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="ADMIN">
            <UserApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute role="ADMIN">
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* FARMER */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute role="FARMER">
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/products"
        element={
          <ProtectedRoute role="FARMER">
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute role="FARMER">
            <FarmerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/profile"
        element={
          <ProtectedRoute role="FARMER">
            <FarmerProfile />
          </ProtectedRoute>
        }
      />

      {/* RETAILER */}
      <Route
        path="/retailer"
        element={
          <ProtectedRoute role="RETAILER">
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/browse"
        element={
          <ProtectedRoute role="RETAILER">
            <BrowseProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/orders"
        element={
          <ProtectedRoute role="RETAILER">
            <MyOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/retailer/profile"
        element={
          <ProtectedRoute role="RETAILER">
            <RetailerProfile />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}

export default App;