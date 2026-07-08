import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiBell, FiPackage, FiTruck, FiCheck, FiXCircle, FiBox } from "react-icons/fi";

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

  function iconForStatus(s) {
    switch (s) {
      case "CONFIRMED": return <FiPackage className="text-blue-500" />;
      case "SHIPPED": return <FiTruck className="text-purple-500" />;
      case "DELIVERED": return <FiCheck className="text-green-500" />;
      case "CANCELLED": return <FiXCircle className="text-red-500" />;
      default: return <FiBell className="text-gray-500" />;
    }
  }

  function bgForStatus(s) {
    switch (s) {
      case "CONFIRMED": return "bg-blue-50";
      case "SHIPPED": return "bg-purple-50";
      case "DELIVERED": return "bg-green-50";
      case "CANCELLED": return "bg-red-50";
      default: return "bg-gray-50";
    }
  }

  // Build notifications from orders
  const orderNotifs = orders
    .filter(o => o.orderStatus !== "PENDING")
    .map(o => ({
      id: `order-${o.id}`,
      type: "order",
      icon: iconForStatus(o.orderStatus),
      bgClass: bgForStatus(o.orderStatus),
      title: `Order #${o.id} — ${o.orderStatus}`,
      body: `Your order for "${o.productName || "a product"}" is now ${o.orderStatus.toLowerCase()}.`,
      time: null,
    }));

  // Build notifications from new products
  const productNotifs = products.map(p => ({
    id: `product-${p.id}`,
    type: "product",
    icon: <FiBox className="text-primary" />,
    bgClass: "bg-primary-light/20",
    title: `New product listed: ${p.productName}`,
    body: `${p.category} • ₹${p.price}/unit • ${p.quantity} kg available`,
    time: null,
  }));

  const all = [...orderNotifs, ...productNotifs];

  return (
    <DashboardLayout title="Notifications">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark mb-1">Notifications</h2>
        <p className="text-text-medium">Order updates and new product alerts.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in max-w-3xl">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : all.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 text-gray-200"><FiBell /></div>
            <h3 className="text-xl font-bold text-text-dark mb-2">All caught up!</h3>
            <p className="text-text-medium">No notifications yet. Check back after placing an order.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {all.map((n, i) => (
              <div 
                key={n.id} 
                className="p-4 sm:p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
                style={{ animationFillMode: "both", animationDelay: `${i * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${n.bgClass}`}>
                  {n.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-dark text-base mb-1 truncate">{n.title}</p>
                  <p className="text-text-medium text-sm leading-relaxed">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default RetailerNotifications;
