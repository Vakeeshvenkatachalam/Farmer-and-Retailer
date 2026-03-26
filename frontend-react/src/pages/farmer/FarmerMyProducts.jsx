import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

function FarmerMyProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({}); // productId -> feedbacks[]
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    axiosInstance.get(`/products/farmer/${user.id}`)
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const loadFeedback = async (productId) => {
    if (feedbacks[productId]) {
      setExpanded(expanded === productId ? null : productId);
      return;
    }
    try {
      const res = await axiosInstance.get(`/feedback/product/${productId}`);
      setFeedbacks(prev => ({ ...prev, [productId]: res.data }));
      setExpanded(productId);
    } catch (e) {
      setFeedbacks(prev => ({ ...prev, [productId]: [] }));
      setExpanded(productId);
    }
  };

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);
  const avgRating = (fbs) => fbs.length ? (fbs.reduce((s, f) => s + f.rating, 0) / fbs.length).toFixed(1) : null;

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>My Products</h2>
            <p style={styles.subtitle}>Manage your listings and view customer reviews.</p>
          </div>
          <button style={styles.addBtn} onClick={() => navigate("/farmer/add-product")}>
            + Add New Product
          </button>
        </div>

        {loading ? (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <p style={{ color: "#94a3b8" }}>Loading your products...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: "3rem" }}>🌾</span>
            <h3 style={{ color: "#e2e8f0", margin: "12px 0 8px" }}>No Products Yet</h3>
            <p style={{ color: "#64748b" }}>Add your first product to start selling!</p>
            <button style={styles.addBtn} onClick={() => navigate("/farmer/add-product")}>
              Add Product
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((p) => {
              const fbs = feedbacks[p.id] || [];
              const avg = avgRating(fbs);
              const isOpen = expanded === p.id;
              return (
                <div key={p.id} style={styles.card}>
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.productName} style={styles.img} />
                  )}
                  {!p.imageUrl && (
                    <div style={styles.imgPlaceholder}>🥬</div>
                  )}
                  <div style={styles.cardBody}>
                    <div style={styles.cardTop}>
                      <span style={styles.category}>{p.category}</span>
                      {p.isOrganic && <span style={styles.organicBadge}>🌿 Organic</span>}
                    </div>
                    <h3 style={styles.productName}>{p.productName}</h3>
                    {p.description && <p style={styles.desc}>{p.description}</p>}
                    <div style={styles.statsRow}>
                      <span style={styles.price}>₹{p.price}/unit</span>
                      <span style={styles.qty}>📦 {p.quantity} kg</span>
                    </div>
                    <div style={styles.footerRow}>
                      <button
                        style={styles.reviewsBtn}
                        onClick={() => loadFeedback(p.id)}
                      >
                        {isOpen ? "▲ Hide Reviews" : `⭐ Reviews${avg ? ` (${avg})` : ""}`}
                      </button>
                    </div>

                    {isOpen && (
                      <div style={styles.reviewsPanel}>
                        {fbs.length === 0 ? (
                          <p style={styles.noReviews}>No reviews yet.</p>
                        ) : (
                          fbs.map((f) => (
                            <div key={f.id} style={styles.review}>
                              <div style={styles.reviewTop}>
                                <span style={styles.reviewer}>{f.reviewerName || "Anonymous"}</span>
                                <span style={styles.stars}>{stars(f.rating)}</span>
                              </div>
                              <p style={styles.comment}>{f.comment}</p>
                              <span style={styles.reviewDate}>{f.createdAt?.split(" ")[0]}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity:0; transform: translateY(20px); }
          to   { opacity:1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}

const styles = {
  container: { padding: "8px", fontFamily: "'Inter', sans-serif", animation: "fadeUp 0.5s ease" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 },
  title: {
    fontSize: "1.8rem", fontWeight: 700, margin: "0 0 4px",
    background: "linear-gradient(135deg,#00e5ff,#7c4dff)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#64748b", margin: 0, fontSize: "0.9rem" },
  addBtn: {
    padding: "10px 20px", borderRadius: 10,
    background: "linear-gradient(135deg,#7c4dff,#5b21b6)",
    color: "#fff", fontWeight: 600, border: "none", cursor: "pointer",
    fontSize: "0.88rem", transition: "opacity 0.2s",
  },
  loader: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" },
  spinner: {
    width: 40, height: 40, border: "3px solid rgba(124,77,255,0.2)",
    borderTopColor: "#7c4dff", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    textAlign: "center", padding: "70px 20px",
    background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)",
    borderRadius: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    background: "rgba(255,255,255,0.04)", borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
    backdropFilter: "blur(12px)", transition: "transform 0.2s, box-shadow 0.2s",
  },
  img: { width: "100%", height: 160, objectFit: "cover" },
  imgPlaceholder: {
    width: "100%", height: 120,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "3rem", background: "rgba(0,0,0,0.2)",
  },
  cardBody: { padding: "16px" },
  cardTop: { display: "flex", gap: 8, marginBottom: 8 },
  category: {
    background: "rgba(0,229,255,0.12)", color: "#00e5ff",
    border: "1px solid rgba(0,229,255,0.25)", padding: "2px 10px",
    borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
  },
  organicBadge: {
    background: "rgba(16,185,129,0.12)", color: "#34d399",
    border: "1px solid rgba(16,185,129,0.25)", padding: "2px 10px",
    borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
  },
  productName: { color: "#e2e8f0", fontSize: "1.05rem", fontWeight: 700, margin: "0 0 6px" },
  desc: { color: "#64748b", fontSize: "0.82rem", margin: "0 0 10px", lineHeight: 1.4 },
  statsRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  price: { fontWeight: 700, color: "#34d399", fontSize: "1rem" },
  qty: { color: "#94a3b8", fontSize: "0.82rem" },
  footerRow: { borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 10 },
  reviewsBtn: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#a78bfa", padding: "6px 14px", borderRadius: 8,
    fontSize: "0.8rem", cursor: "pointer", fontWeight: 600,
    transition: "background 0.2s",
  },
  reviewsPanel: {
    marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12,
  },
  noReviews: { color: "#475569", fontSize: "0.85rem", textAlign: "center", padding: "10px 0" },
  review: {
    background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px",
    marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)",
  },
  reviewTop: { display: "flex", justifyContent: "space-between", marginBottom: 4 },
  reviewer: { color: "#e2e8f0", fontWeight: 600, fontSize: "0.82rem" },
  stars: { color: "#f59e0b", fontSize: "0.85rem" },
  comment: { color: "#94a3b8", fontSize: "0.82rem", margin: "0 0 4px", lineHeight: 1.4 },
  reviewDate: { color: "#334155", fontSize: "0.72rem" },
};

export default FarmerMyProducts;
