import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

function RetailerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const res = await axiosInstance.get(`/orders/retailer/${user.id}`);
        const orders = res.data;
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.orderStatus === "PENDING").length,
          completedOrders: orders.filter((o) => o.orderStatus === "DELIVERED").length,
          cancelledOrders: orders.filter((o) => o.orderStatus === "CANCELLED").length,
        });
      } catch (err) {
        console.error("Failed to load retailer stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div className="dashboard-title">🛒 Retailer Dashboard</div>
        <div className="dashboard-nav">
          <button className="primary-btn" onClick={() => navigate("/retailer")}>Dashboard</button>
          <button className="secondary-btn" onClick={() => navigate("/retailer/browse")}>Browse Products</button>
          <button className="secondary-btn" onClick={() => navigate("/retailer/orders")}>My Orders</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <h2>Welcome, {user?.name || "Retailer"}! 👋</h2>

      {loading ? (
        <p style={{ color: "#aaa" }}>Loading stats...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">Total Orders<div className="stat-number">{stats.totalOrders}</div></div>
          <div className="stat-card">Pending Orders<div className="stat-number">{stats.pendingOrders}</div></div>
          <div className="stat-card">Completed Orders<div className="stat-number">{stats.completedOrders}</div></div>
          <div className="stat-card">Cancelled Orders<div className="stat-number">{stats.cancelledOrders}</div></div>
        </div>
      )}

      <div className="action-buttons">
        <button className="primary-btn" onClick={() => navigate("/retailer/browse")}>Browse &amp; Order</button>
        <button className="secondary-btn" onClick={() => navigate("/retailer/orders")}>View My Orders</button>
      </div>
    </div>
  );
}

export default RetailerDashboard;