import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../api/axiosInstance";
import { 
  FiUsers, FiCheckCircle, FiClock, FiShoppingBag, 
  FiBox, FiDollarSign, FiTrendingUp, FiAlertTriangle 
} from "react-icons/fi";
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from "recharts";

const COLORS = ['#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#8B5E3C'];

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get("/admin/analytics");
        setData(response.data);
      } catch (err) {
        setError("Failed to load analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="System Analytics">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title="System Analytics">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>
      </DashboardLayout>
    );
  }

  const { 
    stats, 
    categoryDistribution, 
    farmerApprovalStatus, 
    monthlyOrdersGrowth, 
    revenueAnalytics, 
    inventoryInsights 
  } = data;

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-sm font-medium text-text-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-dark">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${colorClass} text-white shadow-sm`}>
          <Icon />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-sm font-medium text-primary mt-2 relative z-10">
          <FiTrendingUp />
          <span>{trend}</span>
          <span className="text-text-medium font-normal ml-1">vs last month</span>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout title="System Analytics">
      
      {/* SECTION 1: STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Farmers" value={stats.totalFarmers} icon={FiUsers} colorClass="from-blue-400 to-blue-600" />
        <StatCard title="Approved Farmers" value={stats.approvedFarmers} icon={FiCheckCircle} colorClass="from-green-400 to-green-600" />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={FiClock} colorClass="from-orange-400 to-orange-600" />
        <StatCard title="Total Retailers" value={stats.totalRetailers} icon={FiShoppingBag} colorClass="from-purple-400 to-purple-600" />
        
        <StatCard title="Total Products" value={stats.totalProducts} icon={FiBox} colorClass="from-emerald-400 to-emerald-600" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={FiShoppingBag} colorClass="from-indigo-400 to-indigo-600" />
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={FiDollarSign} colorClass="from-teal-400 to-teal-600" trend={stats.monthlyGrowth} />
        <StatCard title="Monthly Growth" value={stats.monthlyGrowth} icon={FiTrendingUp} colorClass="from-green-500 to-emerald-600" />
      </div>

      {/* SECTION 2: MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Revenue Analytics (Area Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-primary rounded-full"></div>
            Revenue Analytics
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueAnalytics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Orders Growth (Line Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
            Monthly Orders Growth
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyOrdersGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Distribution (Donut Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-text-dark mb-2 flex items-center gap-2">
            <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
            Category Distribution
          </h3>
          <div className="h-72 w-full flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-medium">No product data available</p>
            )}
          </div>
        </div>

        {/* Farmer Approval Status (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-purple-500 rounded-full"></div>
            Farmer Approval Status
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmerApprovalStatus} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{fill: '#F3F4F6'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {farmerApprovalStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'Approved' ? '#22C55E' : 
                      entry.name === 'Pending' ? '#F59E0B' : '#EF4444'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 4: INVENTORY INSIGHTS & TOP PERFORMERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inventory Insights */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-bold text-text-dark mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-red-500 rounded-full"></div>
            Inventory Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><FiAlertTriangle /></div>
                <div>
                  <p className="text-sm font-bold text-orange-800">Low Stock</p>
                  <p className="text-xs text-orange-600">&lt; 10 items remaining</p>
                </div>
              </div>
              <span className="text-xl font-bold text-orange-600">{inventoryInsights.lowStock}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><FiBox /></div>
                <div>
                  <p className="text-sm font-bold text-red-800">Out of Stock</p>
                  <p className="text-xs text-red-600">Requires attention</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600">{inventoryInsights.outOfStock}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><FiTrendingUp /></div>
                <div>
                  <p className="text-sm font-bold text-green-800">Top Category</p>
                  <p className="text-xs text-green-600">Most listed products</p>
                </div>
              </div>
              <span className="text-sm font-bold text-green-600">{inventoryInsights.mostAddedCategory}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity / Top Performers (Mocked structure for UI) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-text-dark flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              Top Performing Farmers
            </h3>
            <button className="text-sm font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm text-text-medium">
                  <th className="pb-3 font-semibold">Farmer</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Products</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.topFarmers && data.topFarmers.length > 0 ? (
                  data.topFarmers.map((farmer) => (
                    <tr key={farmer.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-light/20 text-primary flex items-center justify-center font-bold">
                            {farmer.name ? farmer.name.charAt(0).toUpperCase() : 'F'}
                          </div>
                          <div>
                            <p className="font-bold text-text-dark text-sm">{farmer.name}</p>
                            <p className="text-xs text-text-medium">{farmer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Active</span>
                      </td>
                      <td className="py-4 text-sm text-text-dark font-medium">{farmer.productCount} Listed</td>
                      <td className="py-4 text-right">
                        <button className="text-sm text-primary font-medium hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg transition-colors">Review</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-text-medium">No active farmers with products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Analytics;