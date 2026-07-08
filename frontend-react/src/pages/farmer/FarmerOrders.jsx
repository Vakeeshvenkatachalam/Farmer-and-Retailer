import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { FiPackage, FiTruck, FiCheck, FiClock, FiShoppingBag, FiActivity, FiXCircle } from "react-icons/fi";

function FarmerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState({});

  // Stepper tracking toggle state
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const res = await axiosInstance.get(`/orders/farmer/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to load farmer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  const handleAction = async (orderId, action) => {
    setActionStatus((prev) => ({ ...prev, [orderId]: "loading" }));
    try {
      await axiosInstance.put(`/orders/${action}/${orderId}`);
      setActionStatus((prev) => ({ ...prev, [orderId]: "done" }));
      fetchOrders(); // Refresh list
    } catch (err) {
      setActionStatus((prev) => ({ ...prev, [orderId]: "error" }));
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
        return <span className="bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiClock /> Pending</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiPackage /> Confirmed</span>;
      case 'SHIPPED':
        return <span className="bg-purple-100 text-purple-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiTruck /> Shipped</span>;
      case 'DELIVERED':
        return <span className="bg-green-100 text-green-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiCheck /> Delivered</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 w-max"><FiXCircle /> Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-full text-xs w-max">{status}</span>;
    }
  };

  const renderTimelineStepper = (status) => {
    const steps = [
      { key: "PENDING", label: "Placed", desc: "Awaiting confirmation" },
      { key: "CONFIRMED", label: "Confirmed", desc: "Packing products" },
      { key: "SHIPPED", label: "Shipped", desc: "Crop package dispatched" },
      { key: "DELIVERED", label: "Delivered", desc: "Fulfillment complete" }
    ];
    
    const currentIdx = steps.findIndex(s => s.key === status);
    
    if (status === "CANCELLED") {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 max-w-md mx-auto my-2 text-xs font-bold">
          <FiXCircle /> Order Cancelled by Retailer.
        </div>
      );
    }

    return (
      <div className="py-4 px-6 bg-gray-50/70 border border-gray-100 rounded-xl max-w-2xl mx-auto my-2 animate-in slide-in-from-top-1">
        <div className="flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative text-center">
                {idx < steps.length - 1 && (
                  <div className={`absolute top-3 left-[50%] right-[-50%] h-0.5 z-0 ${
                    idx < currentIdx ? "bg-primary" : "bg-gray-200"
                  }`}></div>
                )}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 border transition-all ${
                  isCompleted 
                    ? "bg-primary text-white border-primary" 
                    : "bg-white text-gray-400 border-gray-200"
                } ${isCurrent ? "scale-110 ring-2 ring-primary/20" : ""}`}>
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 uppercase ${
                  isCurrent ? "text-primary" : isCompleted ? "text-text-dark" : "text-text-medium"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="Farmer Orders">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark mb-1">Incoming Retailer Orders</h2>
        <p className="text-text-medium">Track, manage, and fulfill active purchases directly from your agricultural catalog.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 text-gray-200"><FiShoppingBag /></div>
            <h3 className="text-xl font-bold text-text-dark mb-2">No orders yet</h3>
            <p className="text-text-medium max-w-md">Your fulfillment queue is entirely clear! Check back later as retailers purchase your inventory.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Order Ref</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Purchaser</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <>
                    <tr key={o.id} className={`hover:bg-gray-50/50 transition-colors ${trackingOrderId === o.id ? "bg-gray-50/30" : ""}`}>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary">#{o.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-text-dark">{o.retailerName || `ID: ${o.retailerId}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-text-dark">{o.productName || `Product: ${o.productId}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-dark">{o.quantity}</span> <span className="text-xs text-text-medium">units</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-green-600">₹{o.totalPrice}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(o.orderStatus)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setTrackingOrderId(trackingOrderId === o.id ? null : o.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 font-bold rounded-lg transition-colors text-sm shadow-sm border ${
                              trackingOrderId === o.id 
                                ? "bg-gray-150 text-text-dark border-gray-250 hover:bg-gray-200" 
                                : "bg-purple-50 text-purple-650 border-purple-100 hover:bg-purple-100"
                            }`}
                          >
                            <FiActivity /> {trackingOrderId === o.id ? "Hide Tracker" : "Track"}
                          </button>
                          
                          {o.orderStatus === "PENDING" && (
                            <button 
                              className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors text-sm shadow-sm"
                              onClick={() => handleAction(o.id, "confirm")}
                              disabled={actionStatus[o.id] === "loading"}
                            >
                              Confirm Order
                            </button>
                          )}
                          {o.orderStatus === "CONFIRMED" && (
                            <button 
                              className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm shadow-sm"
                              onClick={() => handleAction(o.id, "ship")}
                              disabled={actionStatus[o.id] === "loading"}
                            >
                              Ship Freight
                            </button>
                          )}
                          {o.orderStatus === "SHIPPED" && (
                            <button 
                              className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors text-sm shadow-sm"
                              onClick={() => handleAction(o.id, "deliver")}
                              disabled={actionStatus[o.id] === "loading"}
                            >
                              Mark Delivered
                            </button>
                          )}
                          {o.orderStatus === "DELIVERED" && (
                            <span className="text-gray-400 text-sm font-medium py-2 px-1">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                    {trackingOrderId === o.id && (
                      <tr className="bg-gray-50/40">
                        <td colSpan="7" className="px-6 py-2 border-b border-gray-100">
                          {renderTimelineStepper(o.orderStatus)}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default FarmerOrders;