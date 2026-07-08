import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiStar, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiBox } from "react-icons/fi";

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
    <DashboardLayout title="Leave Feedback">
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
        {/* Product preview */}
        {product && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 mb-6">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.productName} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 text-2xl">
                <FiBox />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-text-medium uppercase tracking-wider mb-1">Reviewing</p>
              <h3 className="text-lg font-bold text-text-dark leading-tight">{product.productName}</h3>
              <p className="text-text-medium text-sm">{product.category} • ₹{product.price}/kg</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-dark mb-1">Leave a Review</h2>
            <p className="text-text-medium">Share your experience with this product.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-text-dark mb-3">Your Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none transition-transform"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                  >
                    <FiStar 
                      className={`text-4xl transition-all duration-200 ${
                        star <= (hovered || rating) 
                          ? "fill-orange-400 text-orange-400 scale-110" 
                          : "text-gray-200"
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 h-6">
                {(hovered || rating) > 0 && (
                  <p className="text-orange-500 font-bold text-sm animate-in fade-in">{labels[hovered || rating]}</p>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-dark mb-2">Your Review</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Describe the quality, freshness, packaging..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-text-dark resize-y"
              />
            </div>

            {/* Status */}
            {status && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 text-sm font-bold animate-in fade-in ${
                status.type === "success" 
                  ? "bg-green-50 text-green-700 border border-green-100" 
                  : "bg-red-50 text-red-700 border border-red-100"
              }`}>
                {status.type === "success" ? <FiCheckCircle className="text-lg shrink-0 mt-0.5" /> : <FiAlertCircle className="text-lg shrink-0 mt-0.5" />}
                {status.msg}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <button 
                type="button" 
                className="px-6 py-2.5 rounded-xl font-bold text-text-medium hover:bg-gray-100 transition-colors flex items-center gap-2" 
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft /> Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white hover:bg-green-600 transition-colors shadow-md shadow-primary/30 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                ) : (
                  <><FiStar className="fill-white" /> Submit Review</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default LeaveFeedback;
