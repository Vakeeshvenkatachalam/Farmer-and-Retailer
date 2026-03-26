import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";

function LeaveFeedback() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error"
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/products/${productId}`).then(r => setProduct(r.data)).catch(() => {});
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setStatus({ type: "error", msg: "Please select a star rating." }); return; }
    if (!comment.trim()) { setStatus({ type: "error", msg: "Please write a comment." }); return; }
    setLoading(true);
    setStatus(null);
    try {
      await axiosInstance.post("/feedback/add", null, {
        params: {
          productId,
          comment,
          rating,
          retailerId: user?.id,
          reviewerName: user?.name || "Anonymous",
        },
      });
      setStatus({ type: "success", msg: "Review submitted! Thank you for your feedback." });
      setComment("");
      setRating(0);
    } catch (err) {
      setStatus({ type: "error", msg: "Failed to submit. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const labels = ["", "Terrible", "Poor", "Average", "Good", "Excellent"];

  return (
    <DashboardLayout>
      <div style={styles.page}>
        {/* Product preview */}
        {product && (
          <div style={styles.productPreview}>
            {product.imageUrl && <img src={product.imageUrl} alt={product.productName} style={styles.previewImg} />}
            <div>
              <p style={styles.previewLabel}>Reviewing</p>
              <h3 style={styles.previewName}>{product.productName}</h3>
              <p style={styles.previewMeta}>{product.category} • ₹{product.price}/unit</p>
            </div>
          </div>
        )}

        <div style={styles.card}>
          <h2 style={styles.title}>Leave a Review</h2>
          <p style={styles.subtitle}>Share your experience with this product.</p>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div style={styles.starSection}>
              <p style={styles.fieldLabel}>Your Rating</p>
              <div style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    style={styles.starBtn}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                  >
                    <span style={{
                      fontSize: "2.2rem",
                      color: star <= (hovered || rating) ? "#f59e0b" : "rgba(255,255,255,0.15)",
                      transition: "color 0.15s, transform 0.15s",
                      display: "inline-block",
                      transform: star <= (hovered || rating) ? "scale(1.15)" : "scale(1)",
                    }}>★</span>
                  </button>
                ))}
              </div>
              {(hovered || rating) > 0 && (
                <p style={styles.ratingLabel}>{labels[hovered || rating]}</p>
              )}
            </div>

            {/* Comment */}
            <div style={styles.fieldGroup}>
              <p style={styles.fieldLabel}>Your Review</p>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe the quality, freshness, packaging..."
                rows={4}
                style={styles.textarea}
              />
            </div>

            {/* Status */}
            {status && (
              <div style={{
                ...styles.statusBox,
                background: status.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${status.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                color: status.type === "success" ? "#34d399" : "#f87171",
              }}>
                {status.type === "success" ? "✓" : "⚠"} {status.msg}
              </div>
            )}

            <div style={styles.actions}>
              <button type="button" style={styles.cancelBtn} onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Submitting..." : "Submit Review ⭐"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }`}</style>
    </DashboardLayout>
  );
}

const styles = {
  page: { padding: "8px", fontFamily: "'Inter', sans-serif", maxWidth: 560, animation: "fadeUp 0.5s ease" },
  productPreview: {
    display: "flex", alignItems: "center", gap: 14,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "14px 18px", marginBottom: 20,
  },
  previewImg: { width: 60, height: 60, borderRadius: 10, objectFit: "cover" },
  previewLabel: { color: "#64748b", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" },
  previewName: { color: "#e2e8f0", fontWeight: 700, margin: "0 0 2px", fontSize: "1rem" },
  previewMeta: { color: "#64748b", fontSize: "0.8rem", margin: 0 },
  card: {
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18, padding: "28px 24px", backdropFilter: "blur(12px)",
  },
  title: {
    fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px",
    background: "linear-gradient(135deg,#f59e0b,#f97316)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#64748b", margin: "0 0 24px", fontSize: "0.88rem" },
  starSection: { marginBottom: 22 },
  fieldLabel: { color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" },
  starsRow: { display: "flex", gap: 4 },
  starBtn: { background: "none", border: "none", cursor: "pointer", padding: "0 2px" },
  ratingLabel: { color: "#f59e0b", fontWeight: 600, fontSize: "0.88rem", margin: "6px 0 0" },
  fieldGroup: { marginBottom: 20 },
  textarea: {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#e2e8f0", padding: "12px 14px",
    fontSize: "0.9rem", resize: "vertical", outline: "none",
    fontFamily: "'Inter', sans-serif", lineHeight: 1.5,
  },
  statusBox: { borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: "0.88rem", fontWeight: 500 },
  actions: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: {
    padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8",
    fontWeight: 600, cursor: "pointer", fontSize: "0.88rem",
  },
  submitBtn: {
    padding: "10px 24px", borderRadius: 10,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#fff", fontWeight: 700, border: "none", cursor: "pointer", fontSize: "0.88rem",
    boxShadow: "0 4px 16px rgba(245,158,11,0.3)", transition: "opacity 0.2s",
  },
};

export default LeaveFeedback;
