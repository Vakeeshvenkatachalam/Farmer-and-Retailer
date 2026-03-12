import "../../styles/dashboard.css";

function RetailerDashboard() {
  return (
    <div className="dashboard-wrapper">

      <div className="dashboard-header">
        <div className="dashboard-title">🛒 Retailer Dashboard</div>
        <div className="dashboard-nav">
          <button className="primary-btn">Dashboard</button>
          <button className="secondary-btn">Browse Products</button>
          <button className="secondary-btn">My Orders</button>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      <h2>Welcome, Retailer!</h2>

      <div className="stats-grid">
        <div className="stat-card">
          Total Orders
          <div className="stat-number">1</div>
        </div>

        <div className="stat-card">
          Pending Orders
          <div className="stat-number">1</div>
        </div>

        <div className="stat-card">
          Completed Orders
          <div className="stat-number">0</div>
        </div>

        <div className="stat-card">
          Cancelled Orders
          <div className="stat-number">0</div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="primary-btn">Browse & Order</button>
        <button className="secondary-btn">View My Orders</button>
      </div>

    </div>
  );
}

export default RetailerDashboard;