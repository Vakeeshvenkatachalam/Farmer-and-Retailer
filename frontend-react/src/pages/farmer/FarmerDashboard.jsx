import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiPlus, FiShoppingBag, FiBox, FiDollarSign, FiClock, FiCheckCircle } from "react-icons/fi";

function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const [productsRes, ordersRes] = await Promise.all([
          axiosInstance.get(`/products/farmer/${user.id}`),
          axiosInstance.get(`/orders/farmer/${user.id}`),
        ]);

        const orders = ordersRes.data;
        const revenue = orders
          .filter((o) => o.paymentStatus === "PAID")
          .reduce((sum, o) => sum + o.totalPrice, 0);

        const pData = productsRes.data;
        setProducts(pData);

        setStats({
          totalProducts: pData.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.orderStatus === "PENDING").length,
          confirmedOrders: orders.filter((o) => o.orderStatus === "CONFIRMED").length,
          totalRevenue: revenue,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <DashboardLayout title="Farmer Dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-dark">Welcome back, {user?.name || "Farmer"}! 👋</h2>
          <p className="text-text-medium mt-1">Here is what's happening with your farm today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            className="flex items-center gap-2 bg-white text-text-dark border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
            onClick={() => navigate("/farmer/orders")}
          >
            <FiShoppingBag /> View Orders
          </button>
          <button 
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors font-medium shadow-sm shadow-primary/30"
            onClick={() => navigate("/farmer/add-product")}
          >
            <FiPlus /> Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10 animate-in fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-medium mb-1">Total Products</p>
              <p className="text-3xl font-bold text-text-dark">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
              <FiBox />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-medium mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-text-dark">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
              <FiShoppingBag />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-medium mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-text-dark">₹{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl">
              <FiDollarSign />
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
              <p className="text-sm font-semibold text-text-medium mb-1">Confirmed Orders</p>
              <p className="text-3xl font-bold text-text-dark">{stats.confirmedOrders}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl">
              <FiCheckCircle />
            </div>
          </div>
        </div>
      )}

      {/* Render the Products Grid for the Farmer */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-text-dark">My Active Products</h3>
      </div>
      
      {!loading && products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-6xl mb-4 text-gray-200"><FiBox /></div>
          <p className="text-text-medium mb-6 text-lg">You haven't listed any products yet.</p>
          <button 
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-green-600 transition-colors font-bold shadow-md shadow-primary/30"
            onClick={() => navigate("/farmer/add-product")}
          >
            <FiPlus /> Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              {p.imageUrl ? (
                <div className="h-48 overflow-hidden relative">
                  <img src={p.imageUrl} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.isOrganic && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      🌿 Organic
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-50 flex items-center justify-center text-gray-300 relative overflow-hidden group-hover:bg-gray-100 transition-colors">
                  <FiBox size={48} />
                  {p.isOrganic && (
                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      🌿 Organic
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-text-dark leading-tight">{p.productName}</h4>
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded text-sm whitespace-nowrap ml-2">₹{p.price}/kg</span>
                </div>
                
                <p className="text-text-medium text-sm mb-4 line-clamp-2 flex-1">
                  {p.description || "Farm fresh organic crop directly from the farm."}
                </p>
                
                <div className="flex justify-between items-center text-xs font-medium pt-4 border-t border-gray-100">
                  <span className="text-text-medium bg-gray-100 px-2 py-1 rounded">{p.category}</span>
                  <span className="text-text-dark bg-blue-50 text-blue-700 px-2 py-1 rounded">Stock: {p.quantity} kg</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default FarmerDashboard;