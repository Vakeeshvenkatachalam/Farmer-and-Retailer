import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import "../../styles/dashboard.css";

function FarmerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const [productsRes, ordersRes] = await Promise.all([
          axiosInstance.get(`/products/farmer/${user.id}`),
          axiosInstance.get(`/orders/farmer/${user.id}`),
        ]);

        const orders = ordersRes.data;
        const revenue = orders
          .filter((o) => o.paymentStatus === "PAID")
          .reduce((sum, o) => sum + o.totalPrice, 0);

        const pData = productsRes.data;
        setProducts(pData);

        setStats({
          totalProducts: pData.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.orderStatus === "PENDING").length,
          confirmedOrders: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
          totalRevenue: revenue,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
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
        <div className="dashboard-title">🌾 Farmer Dashboard</div>
        <div className="dashboard-nav">
          <button className="primary-btn" onClick={() => navigate("/farmer")}>Dashboard</button>
          <button className="secondary-btn" onClick={() => navigate("/farmer/products")}>My Products</button>
          <button className="secondary-btn" onClick={() => navigate("/farmer/orders")}>Orders</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <h2>Welcome, {user?.name || "Farmer"}! 👋</h2>

      {loading ? (
        <p style={{ color: "#aaa" }}>Loading stats...</p>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">Total Products<div className="stat-number">{stats.totalProducts}</div></div>
          <div className="stat-card">Total Orders<div className="stat-number">{stats.totalOrders}</div></div>
          <div className="stat-card">Total Revenue<div className="stat-number">₹{stats.totalRevenue.toFixed(2)}</div></div>
          <div className="stat-card">Pending Orders<div className="stat-number">{stats.pendingOrders}</div></div>
          <div className="stat-card">Confirmed Orders<div className="stat-number">{stats.confirmedOrders}</div></div>
        </div>
      )}

      {/* Render the Products Grid for the Farmer */}
      <h3 style={{ marginTop: "40px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>My Active Products</h3>
      {!loading && products.length === 0 ? (
        <p style={{ color: "#aaa" }}>You haven't listed any products yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginTop: "20px" }}>
          {products.map(p => (
            <div key={p.id} style={{ padding: "16px", borderRadius: "10px", background: "#1a1a2e", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.productName} style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
              )}
              <h4 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "1.1rem" }}>{p.productName}</h4>
              <p style={{ color: "#dcdde1", fontSize: "0.9rem", margin: "8px 0", lineHeight: "1.4", minHeight: "2.8em" }}>
                {p.description || "Farm fresh organic crop."}
              </p>
              <p style={{ color: "#aaa", margin: "4px 0", fontSize: "14px" }}>Category: {p.category}</p>
              <p style={{ color: "#aaa", margin: "4px 0", fontSize: "14px" }}>Stock: <strong>{p.quantity}</strong> kg</p>
              <p style={{ color: "#00ffcc", fontWeight: "bold", margin: "4px 0" }}>₹{p.price}/kg</p>
            </div>
          ))}
        </div>
      )}

      <div className="action-buttons" style={{ marginTop: "40px" }}>
        <button className="primary-btn" onClick={() => navigate("/farmer/products")}>Add New Product</button>
        <button className="secondary-btn" onClick={() => navigate("/farmer/orders")}>View Orders</button>
      </div>
    </div>
  );
}

export default FarmerDashboard;