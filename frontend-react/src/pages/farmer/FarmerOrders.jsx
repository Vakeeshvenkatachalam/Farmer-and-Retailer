import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import "./FarmerOrders.css";

function FarmerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const res = await axiosInstance.get(`/orders/farmer/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load farmer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const handleAction = async (orderId, action) => {
    setActionStatus((prev) => ({ ...prev, [orderId]: "loading" }));
    try {
      await axiosInstance.put(`/orders/${action}/${orderId}`);
      setActionStatus((prev) => ({ ...prev, [orderId]: "done" }));
      fetchOrders(); // Refresh list
    } catch (err) {
      setActionStatus((prev) => ({ ...prev, [orderId]: "error" }));
    }
  };

  return (
    <DashboardLayout>
      <div className="farmer-orders-container">
        <div className="orders-header">
          <h2>Incoming Retailer Orders</h2>
          <p>Track, manage, and fulfill active purchases directly from your agricultural catalog.</p>
        </div>

        {loading ? (
          <div className="orders-loader">Loading active ledger...</div>
        ) : orders.length === 0 ? (
          <div className="empty-orders-state">
            <span className="icon">📦</span>
            <p>Your fulfillment queue is entirely clear! Check back later as retailers purchase your inventory.</p>
          </div>
        ) : (
          <div className="premium-orders-table-wrapper">
            <table className="premium-orders-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Purchaser</th>
                  <th>Product Title</th>
                  <th>Qty</th>
                  <th>Revenue</th>
                  <th>Fulfillment Status</th>
                  <th>Pipeline Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><span className="order-id">#{o.id}</span></td>
                    <td className="retailer-tag">{o.retailerName || `Retailer ID: ${o.retailerId}`}</td>
                    <td className="primary-identity">{o.productName || `Product ID: ${o.productId}`}</td>
                    <td>{o.quantity} <span style={{fontSize: '0.8em', color: '#888'}}>units</span></td>
                    <td className="total-price">₹{o.totalPrice}</td>
                    <td>
                      <span className={`status-badge ${String(o.orderStatus).toLowerCase()}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>
                      {o.orderStatus === "PENDING" && (
                        <button className="action-btn confirm-act"
                          onClick={() => handleAction(o.id, "confirm")}
                          disabled={actionStatus[o.id] === "loading"}>Confirm Order</button>
                      )}
                      {o.orderStatus === "CONFIRMED" && (
                        <button className="action-btn ship-act"
                          onClick={() => handleAction(o.id, "ship")}
                          disabled={actionStatus[o.id] === "loading"}>Ship Freight</button>
                      )}
                      {o.orderStatus === "SHIPPED" && (
                        <button className="action-btn deliver-act"
                          onClick={() => handleAction(o.id, "deliver")}
                          disabled={actionStatus[o.id] === "loading"}>Mark Completed</button>
                      )}
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

export default FarmerOrders;