import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../api/axiosInstance';
import { 
  FiUsers, FiClock, FiCheckCircle, FiShoppingCart, FiBox, 
  FiTrendingUp, FiActivity, FiServer, FiMapPin, FiCpu 
} from 'react-icons/fi';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [statsData, setStatsData] = useState({
    totalFarmers: 0, pendingFarmers: 0, approvedFarmers: 0, totalRetailers: 0, totalOrders: 0
  });
  const [pendingFarmers, setPendingFarmers] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setStatsData(response.data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    };
    
    const fetchPendingFarmers = async () => {
      try {
        const response = await axiosInstance.get('/admin/pending-farmers');
        setPendingFarmers(response.data);
      } catch (err) {
        console.error("Failed to load pending farmers", err);
      }
    };
    
    fetchStats();
    fetchPendingFarmers();
  }, []);

  const handleApproval = async (id, action) => {
    try {
      await axiosInstance.put(`/admin/${action}/${id}`);
      
      const queueRes = await axiosInstance.get('/admin/pending-farmers');
      setPendingFarmers(queueRes.data);
      
      const statsRes = await axiosInstance.get('/admin/stats');
      setStatsData(statsRes.data);
    } catch(err) {
      console.error(`Failed to ${action} farmer:`, err);
    }
  };

  const TabButton = ({ id, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`px-6 py-2.5 font-semibold rounded-full transition-all duration-200 ${
        activeTab === id 
          ? 'bg-primary text-white shadow-md shadow-primary/30' 
          : 'bg-white text-text-medium hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <DashboardLayout title="Admin Panel">
      <div className="mb-8 flex gap-3 pb-6 border-b border-gray-200">
        <TabButton id="dashboard" label="Dashboard Overview" />
        <TabButton id="approvals" label="Farmer Approvals" />
      </div>

      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-text-dark mb-6">Welcome back, Administrator</h2>
          
          {/* Main Stat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Total Farmers</p>
                <p className="text-3xl font-bold text-text-dark">{statsData.totalFarmers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl">
                <FiUsers />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Pending Approval</p>
                <p className="text-3xl font-bold text-text-dark">{statsData.pendingFarmers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
                <FiClock />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Approved Farmers</p>
                <p className="text-3xl font-bold text-text-dark">{statsData.approvedFarmers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl">
                <FiCheckCircle />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Total Retailers</p>
                <p className="text-3xl font-bold text-text-dark">{statsData.totalRetailers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl">
                <FiShoppingCart />
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-text-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-text-dark">{statsData.totalOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center text-xl">
                <FiBox />
              </div>
            </div>
          </div>

          {/* NEW: Analytics Integration in Dashboard Empty Space */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart: Monthly Transaction Analytics (Pure SVG Trend Chart) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-text-dark text-lg flex items-center gap-2">
                    <FiTrendingUp className="text-primary" /> Monthly Transaction Volume
                  </h3>
                  <p className="text-text-medium text-xs">Simulated live trading volume trends</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  +12.5% Growth
                </span>
              </div>

              {/* Pure SVG Line Chart */}
              <div className="relative w-full h-56 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <svg viewBox="0 0 500 150" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="5,5" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="5,5" />

                  {/* Area fill */}
                  <path 
                    d="M 0,150 L 0,110 Q 75,70 120,95 T 250,50 T 380,85 T 500,40 L 500,150 Z" 
                    fill="url(#chartGrad)" 
                  />

                  {/* Line path */}
                  <path 
                    d="M 0,110 Q 75,70 120,95 T 250,50 T 380,85 T 500,40" 
                    fill="none" 
                    stroke="#22C55E" 
                    strokeWidth="3.5"
                    strokeLinecap="round" 
                  />

                  {/* Hotspots */}
                  <circle cx="120" cy="95" r="5" fill="#22C55E" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="250" cy="50" r="5" fill="#22C55E" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="380" cy="85" r="5" fill="#22C55E" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="500" cy="40" r="5" fill="#22C55E" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between mt-2 text-[10px] text-text-medium px-1 font-bold">
                  <span>JAN</span>
                  <span>FEB</span>
                  <span>MAR</span>
                  <span>APR</span>
                  <span>MAY</span>
                  <span>JUN</span>
                  <span>JUL</span>
                </div>
              </div>
            </div>

            {/* Side Card: Platform Health & Operations */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-text-dark text-lg mb-4 flex items-center gap-2">
                  <FiActivity className="text-blue-500" /> Platform Operations
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiServer className="text-blue-500 text-lg" />
                      <div>
                        <p className="text-xs font-bold text-text-dark">Backend API Server</p>
                        <p className="text-[10px] text-text-medium">Spring Boot v3.3.6</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiCpu className="text-purple-500 text-lg" />
                      <div>
                        <p className="text-xs font-bold text-text-dark">Payment Gateway</p>
                        <p className="text-[10px] text-text-medium">Razorpay Integrator</p>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-orange-500 text-lg" />
                      <div>
                        <p className="text-xs font-bold text-text-dark">District Centers</p>
                        <p className="text-[10px] text-text-medium">Coverage Area</p>
                      </div>
                    </div>
                    <span className="text-xs text-text-dark font-extrabold">12 Regions</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 text-center">
                <span className="text-xs font-semibold text-text-medium">Last system sync: Just Now</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-dark">Farmer Approvals</h2>
            <span className="bg-orange-100 text-orange-600 text-sm font-bold px-3 py-1 rounded-full">{pendingFarmers.length} Pending</span>
          </div>
          
          {pendingFarmers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
              <div className="text-6xl mb-4 text-green-100"><FiCheckCircle /></div>
              <h3 className="text-xl font-bold text-text-dark mb-2">All Caught Up!</h3>
              <p className="text-text-medium">No farmers are currently waiting for approval.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Farmer Details</th>
                      <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Location</th>
                      <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingFarmers.map(farmer => (
                      <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                              {farmer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-text-dark">{farmer.name}</p>
                              <p className="text-sm text-text-medium">{farmer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-text-dark font-medium">{farmer.village}</p>
                          <p className="text-sm text-text-medium">{farmer.state}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproval(farmer.id, 'approve')} 
                              className="px-4 py-2 bg-green-50 text-green-600 font-semibold rounded-lg hover:bg-green-100 transition-colors text-sm"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleApproval(farmer.id, 'reject')} 
                              className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}