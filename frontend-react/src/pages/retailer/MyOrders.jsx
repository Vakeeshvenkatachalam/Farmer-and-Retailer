import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./MyOrders.css";

function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await axiosInstance.get(`/orders/retailer/${user.id}`);
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusClass = (status) => {
    const map = {
      PENDING: "status-pending",
      CONFIRMED: "status-confirmed",
      SHIPPED: "status-shipped",
      DELIVERED: "status-delivered",
      CANCELLED: "status-cancelled",
    };
    return map[status] || "status-default";
  };

  return (
    <DashboardLayout>
      <div className="my-orders-container">
        <div className="orders-header">
          <div className="orders-title-block">
            <h2>My Orders</h2>
            <p>Track your purchases and manage payments in real-time.</p>
          </div>
          <div className="orders-summary">
            <span className="summary-chip">{orders.length} Orders</span>
            <span className="summary-chip paid">
              {orders.filter(o => o.paymentStatus === "PAID").length} Paid
            </span>
            <span className="summary-chip pending">
              {orders.filter(o => o.paymentStatus !== "PAID").length} Pending
            </span>
          </div>
        </div>

        {loading ? (
          <div className="orders-loader">
            <div className="loader-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-state">
            <span className="empty-icon">🛍️</span>
            <h3>No Orders Yet</h3>
            <p>Browse products and place your first order!</p>
            <button
              className="browse-btn"
              onClick={() => navigate("/retailer/browse")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Farmer</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o.id} className="order-row" style={{ animationDelay: `${idx * 60}ms` }}>
                    <td>
                      <span className="order-ref">#{o.id}</span>
                    </td>
                    <td>
                      <span className="product-name">{o.productName || `Product #${o.productId}`}</span>
                    </td>
                    <td>
                      <span className="farmer-name">🌾 {o.farmerName || "—"}</span>
                    </td>
                    <td>
                      <span className="qty-badge">{o.quantity} <span className="unit">kg</span></span>
                    </td>
                    <td>
                      <span className="price-tag">₹{o.totalPrice}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-badge ${o.paymentStatus === "PAID" ? "pay-paid" : "pay-pending"}`}>
                        {o.paymentStatus === "PAID" ? "✓ PAID" : "⏳ PENDING"}
                      </span>
                    </td>
                    <td>
                      <div className="action-group">
                        {o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED" && (
                          <button
                            className="action-btn pay-btn"
                            onClick={() => navigate(`/retailer/payment/${o.id}`)}
                          >
                            💳 Pay Now
                          </button>
                        )}
                        {o.orderStatus === "DELIVERED" && (
                          <button
                            className="action-btn feedback-btn"
                            onClick={() => navigate(`/retailer/feedback/${o.productId}`)}
                          >
                            ⭐ Feedback
                          </button>
                        )}
                        {(!( o.paymentStatus !== "PAID" && o.orderStatus !== "CANCELLED") && o.orderStatus !== "DELIVERED") && (
                          <span className="no-action">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MyOrders;