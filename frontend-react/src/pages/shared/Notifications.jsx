import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiBell, FiPackage, FiTruck, FiCheck, FiXCircle, FiBox, FiTrendingDown, FiAlertTriangle, FiUserPlus, FiSmile } from "react-icons/fi";

function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/notifications`, {
        params: {
          userId: user.id,
          role: user.role
        }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notifications/read-all", null, {
        params: {
          userId: user.id,
          role: user.role
        }
      });
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  function getNotificationIcon(type) {
    switch (type) {
      case "ORDER":
        return <FiPackage className="text-blue-500" />;
      case "PAYMENT":
        return <FiCheck className="text-green-500" />;
      case "LOW_STOCK":
        return <FiAlertTriangle className="text-orange-500 animate-pulse" />;
      case "REGISTRATION":
        return <FiUserPlus className="text-purple-500" />;
      case "WELCOME":
        return <FiSmile className="text-emerald-500" />;
      case "PRICE_DROP":
        return <FiTrendingDown className="text-red-500" />;
      default:
        return <FiBell className="text-gray-500" />;
    }
  }

  function getNotificationBg(type) {
    switch (type) {
      case "ORDER": return "bg-blue-50";
      case "PAYMENT": return "bg-green-50";
      case "LOW_STOCK": return "bg-orange-50";
      case "REGISTRATION": return "bg-purple-50";
      case "WELCOME": return "bg-emerald-50";
      case "PRICE_DROP": return "bg-red-50";
      default: return "bg-gray-50";
    }
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">Notifications</h2>
          <p className="text-text-medium">Stay updated with system and transactional alerts.</p>
        </div>
        {notifications.some(n => !n.readStatus) && (
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 text-xs font-bold text-primary hover:bg-green-50 border border-primary/20 rounded-xl transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in max-w-3xl">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 text-gray-200"><FiBell /></div>
            <h3 className="text-xl font-bold text-text-dark mb-2">All caught up!</h3>
            <p className="text-text-medium">No notification alerts for your account yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n, i) => (
              <div 
                key={n.id} 
                className={`p-4 sm:p-6 flex items-start gap-4 transition-colors ${!n.readStatus ? "bg-green-50/20 hover:bg-green-50/40" : "hover:bg-gray-50/50"}`}
                style={{ animationFillMode: "both", animationDelay: `${i * 50}ms` }}
                onClick={() => !n.readStatus && markAsRead(n.id)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${getNotificationBg(n.type)}`}>
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-bold text-text-dark text-base truncate">{n.title}</p>
                    {!n.readStatus && (
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1.5" title="Unread"></span>
                    )}
                  </div>
                  <p className="text-text-medium text-sm leading-relaxed mb-2">{n.message}</p>
                  <span className="text-gray-400 text-xs block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
