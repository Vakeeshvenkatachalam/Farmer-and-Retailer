import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

const NOTIFICATION_ICON = {
  PENDING:   "🕐",
  CONFIRMED: "✅",
  SHIPPED:   "🚚",
  DELIVERED: "📦",
  CANCELLED: "❌",
};

function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;
      try {
        // Notifications are derived from order status changes
        let endpoint = user.role === "FARMER"
          ? `/orders/farmer/${user.id}`
          : `/orders/retailer/${user.id}`;

        const res = await axiosInstance.get(endpoint);

        // Transform orders into notification-style messages
        const notifs = res.data.map((order) => ({
          id: order.id,
          icon: NOTIFICATION_ICON[order.orderStatus] || "📋",
          title: `Order #${order.id} — ${order.orderStatus}`,
          message: user.role === "FARMER"
            ? `Retailer placed an order for Product #${order.productId} — ${order.quantity} kg at ₹${order.totalPrice}`
            : `Your order for Product #${order.productId} is ${order.orderStatus}. Payment: ${order.paymentStatus || "UNPAID"}`,
          status: order.orderStatus,
        }));

        setNotifications(notifs.reverse()); // newest first
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const STATUS_BG = {
    PENDING:   "#2c1f00",
    CONFIRMED: "#002c1a",
    SHIPPED:   "#1a0c2e",
    DELIVERED: "#0d2e0d",
    CANCELLED: "#2e0d0d",
  };

  return (
    <DashboardLayout>
      <h2>🔔 Notifications</h2>

      {loading ? (
        <p style={{ color: "#aaa" }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{ color: "#aaa", textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "48px" }}>🔕</p>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: STATUS_BG[n.status] || "#1a1a2e",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: "28px" }}>{n.icon}</span>
              <div>
                <p style={{ fontWeight: "bold", margin: "0 0 4px", color: "#fff" }}>{n.title}</p>
                <p style={{ margin: 0, color: "#bbb", fontSize: "14px" }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default NotificationsPage;
