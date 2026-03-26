import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

function BrowseProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [orderStatus, setOrderStatus] = useState({});
  const [toastMessage, setToastMessage] = useState("");
  const [reviews, setReviews] = useState({}); // productId -> reviews[]
  const [reviewsOpen, setReviewsOpen] = useState({}); // productId -> bool

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = "/products/all";
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (category) params.append("category", category);
      
      if (params.toString()) {
         url = "/products/filter?" + params.toString();
      }
      
      const res = await axiosInstance.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (product) => {
    const qty = parseInt(quantities[product.id] || 1);
    if (!qty || qty < 1) return;
    setOrderStatus((prev) => ({ ...prev, [product.id]: "loading" }));
    try {
      await axiosInstance.post("/orders/place", {
        productId: product.id,
        retailerId: user.id,
        quantity: qty,
        totalPrice: qty * product.price,
      });
      setOrderStatus((prev) => ({ ...prev, [product.id]: "success" }));
      
      // Show Notification Toast
      setToastMessage("✅ Order Placed Successfully! Farmer has been notified.");
      setTimeout(() => setToastMessage(""), 4000);
      
      // Update local stock immediately
      setProducts(products.map(p => p.id === product.id ? { ...p, quantity: p.quantity - qty } : p));
      
    } catch (err) {
      setOrderStatus((prev) => ({ ...prev, [product.id]: "error" }));
      setToastMessage("❌ Failed to place order. " + (err.response?.data || ""));
      setTimeout(() => setToastMessage(""), 4000);
    }
  };

  const toggleReviews = async (productId) => {
    const isOpen = reviewsOpen[productId];
    setReviewsOpen(prev => ({ ...prev, [productId]: !isOpen }));
    if (!reviews[productId]) {
      try {
        const res = await axiosInstance.get(`/feedback/product/${productId}`);
        setReviews(prev => ({ ...prev, [productId]: res.data }));
      } catch {
        setReviews(prev => ({ ...prev, [productId]: [] }));
      }
    }
  };

  const avgRating = (fbs) => fbs?.length ? (fbs.reduce((s,f) => s+f.rating, 0)/fbs.length).toFixed(1) : null;
  const stars = (n) => "★".repeat(n) + "☆".repeat(5-n);

  return (
    <DashboardLayout>
      <h2>Browse Products</h2>

      {toastMessage && (
        <div style={toastStyle}>
          {toastMessage}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Filter by category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        />
        <button className="primary-btn" onClick={fetchProducts}>Search</button>
      </div>

      {loading ? (
        <p style={{ color: "#aaa" }}>Loading products...</p>
      ) : products.length === 0 ? (
        <p style={{ color: "#aaa" }}>No products found.</p>
      ) : (
        <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
          {products.map((p) => (
            <div key={p.id} className="card" style={{ padding: "16px", borderRadius: "10px", background: "#1a1a2e" }}>
              {p.imageUrl && (
                <img src={p.imageUrl} alt={p.productName} style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px", marginBottom: "12px" }} />
              )}
              <h4 style={{ margin: "0 0 8px", color: "#ffffff", fontSize: "1.2rem" }}>{p.productName}</h4>
              <p style={{ color: "#dcdde1", fontSize: "0.9rem", margin: "8px 0", lineHeight: "1.4", minHeight: "2.8em" }}>
                {p.description || "No description provided."}
              </p>
              <p style={{ color: "#aaa", margin: "4px 0" }}>Category: {p.category}</p>
              <p style={{ color: "#aaa", margin: "4px 0" }}>Stock: {p.quantity} kg</p>
              <p style={{ color: "#00ffcc", fontWeight: "bold", margin: "4px 0" }}>₹{p.price}/kg</p>
              {p.isOrganic && <span style={{ background: "#2ecc71", color: "#000", padding: "2px 8px", borderRadius: "20px", fontSize: "12px" }}>Organic</span>}

              <div style={{ display: "flex", gap: "8px", marginTop: "12px", alignItems: "center" }}>
                <input
                  type="number"
                  min="1"
                  max={p.quantity}
                  placeholder="Qty"
                  value={quantities[p.id] || ""}
                  onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  style={{ width: "60px", padding: "6px", borderRadius: "6px", border: "1px solid #444", background: "#0d0d1a", color: "#fff" }}
                />
                <button
                  className="primary-btn"
                  onClick={() => handleOrder(p)}
                  disabled={orderStatus[p.id] === "loading" || p.quantity === 0}
                  style={{ flex: 1 }}
                >
                  {orderStatus[p.id] === "loading" ? "Ordering..." :
                   orderStatus[p.id] === "success" ? "✅ Ordered!" :
                   orderStatus[p.id] === "error" ? "❌ Failed" : "Order"}
                </button>
              </div>

              {/* Reviews Toggle */}
              <button
                onClick={() => toggleReviews(p.id)}
                style={{
                  marginTop: 10, width: "100%", padding: "6px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8, color: "#a78bfa", cursor: "pointer",
                  fontSize: "0.8rem", fontWeight: 600,
                }}
              >
                {reviewsOpen[p.id] ? "▲ Hide Reviews" : `⭐ Reviews${avgRating(reviews[p.id]) ? ` (${avgRating(reviews[p.id])})` : ""}`}
              </button>

              {reviewsOpen[p.id] && (
                <div style={{ marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 }}>
                  {(!reviews[p.id] || reviews[p.id].length === 0) ? (
                    <p style={{ color: "#475569", fontSize: "0.82rem", textAlign: "center" }}>No reviews yet.</p>
                  ) : reviews[p.id].map(f => (
                    <div key={f.id} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", marginBottom: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "0.8rem" }}>{f.reviewerName || "Anonymous"}</span>
                        <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>{stars(f.rating)}</span>
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: "0.78rem", margin: "4px 0 0", lineHeight: 1.4 }}>{f.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#1a1a2e",
  color: "#fff",
  minWidth: "180px",
};

const toastStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  background: "#2ecc71",
  color: "#fff",
  padding: "16px 24px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  fontWeight: "bold",
  zIndex: 1000,
  animation: "fadeIn 0.3s ease-in-out",
};

export default BrowseProducts;