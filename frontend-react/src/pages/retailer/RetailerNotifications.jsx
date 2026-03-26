import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

function RetailerNotifications() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axiosInstance.get(`/orders/retailer/${user.id}`).catch(() => ({ data: [] })),
      axiosInstance.get("/products/all").catch(() => ({ data: [] })),
    ]).then(([ordersRes, productsRes]) => {
      setOrders(ordersRes.data);
      // Show recently added products (last 10)
      const sorted = [...productsRes.data].reverse().slice(0, 10);
      setProducts(sorted);
    }).finally(() => setLoading(false));
  }, [user]);

  // Build notifications from orders
  const orderNotifs = orders
    .filter(o => o.orderStatus !== "PENDING")
    .map(o => ({
      id: `order-${o.id}`,
      type: "order",
      icon: iconForStatus(o.orderStatus),
      color: colorForStatus(o.orderStatus),
      title: `Order #${o.id} — ${o.orderStatus}`,
      body: `Your order for "${o.productName || "a product"}" is now ${o.orderStatus.toLowerCase()}.`,
      time: null,
    }));

  // Build notifications from new products
  const productNotifs = products.map(p => ({
    id: `product-${p.id}`,
    type: "product",
    icon: "🌾",
    color: "#34d399",
    title: `New product listed: ${p.productName}`,
    body: `${p.category} • ₹${p.price}/unit • ${p.quantity} kg available`,
    time: null,
  }));

  const all = [...orderNotifs, ...productNotifs];

  return (
    <DashboardLayout>
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.title}>🔔 Notifications</h2>
          <p style={styles.subtitle}>Order updates and new product alerts.</p>
        </div>

        {loading ? (
          <div style={styles.loaderWrap}>
            <div style={styles.spinner}></div>
          </div>
        ) : all.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "3rem" }}>📭</span>
            <h3 style={{ color: "#e2e8f0", margin: "12px 0 6px" }}>All caught up!</h3>
            <p style={{ color: "#64748b" }}>No notifications yet. Check back after placing an order.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {all.map((n, i) => (
              <div key={n.id} style={{ ...styles.item, animationDelay: `${i * 50}ms` }}>
                <div style={{ ...styles.iconBox, background: n.color + "22", border: `1px solid ${n.color}55` }}>
                  <span style={{ fontSize: "1.3rem" }}>{n.icon}</span>
                </div>
                <div style={styles.content}>
                  <p style={styles.nTitle}>{n.title}</p>
                  <p style={styles.nBody}>{n.body}</p>
                </div>
                <div style={{ ...styles.dot, background: n.color }}></div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}

function iconForStatus(s) {
  return { CONFIRMED: "✅", SHIPPED: "🚚", DELIVERED: "📦", CANCELLED: "❌" }[s] || "ℹ️";
}
function colorForStatus(s) {
  return { CONFIRMED: "#60a5fa", SHIPPED: "#a78bfa", DELIVERED: "#34d399", CANCELLED: "#f87171" }[s] || "#94a3b8";
}

const styles = {
  page: { padding: "8px", fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: 24 },
  title: {
    fontSize: "1.8rem", fontWeight: 700, margin: "0 0 4px",
    background: "linear-gradient(135deg, #00e5ff, #7c4dff)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#64748b", margin: 0, fontSize: "0.9rem" },
  loaderWrap: { display: "flex", justifyContent: "center", padding: "60px 0" },
  spinner: {
    width: 36, height: 36, border: "3px solid rgba(124,77,255,0.2)",
    borderTopColor: "#7c4dff", borderRadius: "50%", animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center", padding: "70px 20px",
    background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16,
  },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  item: {
    display: "flex", alignItems: "center", gap: 14,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "14px 16px",
    backdropFilter: "blur(8px)", animation: "slideIn 0.4s ease both",
    transition: "background 0.2s",
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  content: { flex: 1 },
  nTitle: { color: "#e2e8f0", fontWeight: 600, fontSize: "0.92rem", margin: "0 0 3px" },
  nBody: { color: "#64748b", fontSize: "0.82rem", margin: 0 },
  dot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
};

export default RetailerNotifications;
