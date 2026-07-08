import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { 
  FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiSearch, 
  FiMapPin, FiTruck, FiTrendingDown, FiStar, FiChevronRight 
} from "react-icons/fi";

function RetailerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [trendingCrops, setTrendingCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        // Fetch all orders
        const ordersRes = await axiosInstance.get(`/orders/retailer/${user.id}`);
        const orders = ordersRes.data;
        
        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.orderStatus === "PENDING").length,
          completedOrders: orders.filter((o) => o.orderStatus === "DELIVERED").length,
          cancelledOrders: orders.filter((o) => o.orderStatus === "CANCELLED").length,
        });

        // Set recent 2 orders
        setRecentOrders(orders.slice(0, 2));

        // Fetch crops to showcase trending products
        const productsRes = await axiosInstance.get("/products/all");
        setTrendingCrops(productsRes.data.slice(0, 3));

      } catch (err) {
        console.error("Failed to load retailer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  // Order Stepper Visualizer helper
  const renderMiniTimeline = (status) => {
    const steps = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentIdx = steps.indexOf(status);
    
    if (status === "CANCELLED") {
      return (
        <div className="flex items-center gap-2 text-xs font-bold text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
          <FiXCircle /> Order Cancelled
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 w-full mt-3">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {idx < 3 && (
                <div className={`absolute top-2 left-[50%] right-[-50%] h-0.5 z-0 ${
                  idx < currentIdx ? "bg-primary" : "bg-gray-200"
                }`}></div>
              )}
              {/* Step circle */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold z-10 border transition-all ${
                isDone 
                  ? "bg-primary text-white border-primary shadow-sm" 
                  : "bg-white text-gray-400 border-gray-200"
              } ${isCurrent ? "scale-125 ring-2 ring-primary/20" : ""}`}>
                {isDone ? "✓" : idx + 1}
              </div>
              <span className={`text-[9px] font-bold mt-1 uppercase ${
                isCurrent ? "text-primary" : "text-text-medium"
              }`}>
                {step.toLowerCase()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout title="Retailer Dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-dark">Welcome back, {user?.name || "Retailer"}! 👋</h2>
          <p className="text-text-medium mt-1">Here is a quick overview of your procurement activities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 bg-white text-text-dark border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
            onClick={() => navigate("/retailer/orders")}
          >
            <FiShoppingBag /> View My Orders
          </button>
          <button 
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-semibold shadow-sm shadow-primary/30"
            onClick={() => navigate("/retailer/browse")}
          >
            <FiSearch /> Browse &amp; Order
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-in fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-text-dark">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                <FiShoppingBag />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-text-dark">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
                <FiClock />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Completed Orders</p>
                <p className="text-3xl font-bold text-text-dark">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl">
                <FiCheckCircle />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Cancelled Orders</p>
                <p className="text-3xl font-bold text-text-dark">{stats.cancelledOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl">
                <FiXCircle />
              </div>
            </div>
          </div>

          {/* NEW: Analytics & Information in Empty Space below Retailer Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Orders Timeline Tracker */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="font-bold text-text-dark text-lg mb-4 flex items-center gap-2">
                <FiTruck className="text-primary" /> Active Delivery Tracker
              </h3>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <p className="text-text-medium text-sm font-medium">No recent orders to track.</p>
                  <button 
                    onClick={() => navigate("/retailer/browse")}
                    className="text-xs text-primary font-bold mt-2 hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentOrders.map(order => (
                    <div key={order.id} className="p-4 bg-gray-50 border border-gray-150 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-xs font-extrabold text-primary">ORDER #{order.id}</span>
                          <h4 className="font-bold text-text-dark text-sm">{order.productName || "Product"}</h4>
                        </div>
                        <span className="text-sm font-bold text-green-600">₹{order.totalPrice}</span>
                      </div>
                      
                      {/* Interactive shipment timeline */}
                      {renderMiniTimeline(order.orderStatus)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Pricing Drop Warnings / Advice Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-text-dark text-lg mb-3 flex items-center gap-2">
                  <FiTrendingDown className="text-orange-500" /> Market Highlights
                </h3>
                <p className="text-xs text-text-medium mb-4">Daily pricing trends and farming news</p>
                
                <div className="space-y-4">
                  <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                    <p className="text-xs font-bold text-orange-700 mb-1">🍅 Tomato Price Drop Alert</p>
                    <p className="text-[10px] text-orange-600 leading-relaxed">Supply in neighboring districts is increasing. Wholesale prices are expected to drop by 15% this weekend. Keep tabs on fresh listings!</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-xs font-bold text-green-700 mb-1">🌿 Verified Organic Surge</p>
                    <p className="text-[10px] text-green-600 leading-relaxed">Retail consumer demand for certified organic crops is up 30%. Farmers are listing fresh basmati and pulses now.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate("/retailer/browse")}
                className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-text-dark font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors mt-4"
              >
                Go to Marketplace <FiChevronRight />
              </button>
            </div>

          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default RetailerDashboard;