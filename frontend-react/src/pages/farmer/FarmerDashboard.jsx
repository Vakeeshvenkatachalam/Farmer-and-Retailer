import "../../styles/dashboard.css";

function FarmerDashboard() {
  return (
    <div className="dashboard-wrapper">

      <div className="dashboard-header">
        <div className="dashboard-title">🌾 Farmer Dashboard</div>
        <div className="dashboard-nav">
          <button className="primary-btn">Dashboard</button>
          <button className="secondary-btn">My Products</button>
          <button className="secondary-btn">Orders</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      <h2>Welcome, Farmer!</h2>

      <div className="stats-grid">
        <div className="stat-card">
          Total Products
          <div className="stat-number">2</div>
        </div>

        <div className="stat-card">
          Total Orders
          <div className="stat-number">1</div>
        </div>

        <div className="stat-card">
          Total Revenue
          <div className="stat-number">₹0.00</div>
        </div>

        <div className="stat-card">
          Pending Orders
          <div className="stat-number">1</div>
        </div>

        <div className="stat-card">
          Confirmed Orders
          <div className="stat-number">0</div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="primary-btn">Manage Products</button>
        <button className="secondary-btn">View Orders</button>
      </div>

    </div>
  );
}

export default FarmerDashboard;