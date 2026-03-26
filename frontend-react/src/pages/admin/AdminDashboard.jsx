import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import axiosInstance from '../../api/axiosInstance';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const [statsData, setStatsData] = useState({
    totalFarmers: 0, pendingFarmers: 0, approvedFarmers: 0, totalRetailers: 0, totalOrders: 0
  });
  const [pendingFarmers, setPendingFarmers] = useState([]);

  useEffect(() => {
    // Fetch live stats from AdminController
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setStatsData(response.data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      }
    };
    
    // Fetch pending farmers queue
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
      
      // Refresh pending queue
      const queueRes = await axiosInstance.get('/admin/pending-farmers');
      setPendingFarmers(queueRes.data);
      
      // Refresh overall stats
      const statsRes = await axiosInstance.get('/admin/stats');
      setStatsData(statsRes.data);
    } catch(err) {
      console.error(`Failed to ${action} farmer:`, err);
    }
  };

  const stats = [
    { label: 'Total Farmers', value: statsData.totalFarmers, icon: '👨‍🌾' },
    { label: 'Pending Farmers', value: statsData.pendingFarmers, icon: '⏳' },
    { label: 'Approved Farmers', value: statsData.approvedFarmers, icon: '✅' },
    { label: 'Total Retailers', value: statsData.totalRetailers, icon: '🏪' },
    { label: 'Total Orders', value: statsData.totalOrders, icon: '📦' },
  ];

  return (
    <DashboardLayout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <div className="top-nav">
            <button 
              className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`nav-btn ${activeTab === 'approvals' ? 'active' : ''}`}
              onClick={() => setActiveTab('approvals')}
            >
              Farmer Approvals
            </button>
            <button 
              className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button className="logout-btn">Logout</button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <h2>Welcome, Admin</h2>
            
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <StatCard key={index} label={stat.label} value={stat.value} icon={stat.icon} />
              ))}
            </div>

            <div className="action-buttons">
              <Button variant="primary" label="Manage Farmer Approvals" onClick={() => setActiveTab('approvals')} />
              <Button variant="secondary" label="View All Farmers" />
              <Button variant="secondary" label="Manage Events" onClick={() => setActiveTab('events')} />
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="dashboard-content">
            <h2>Farmer Approvals</h2>
            {pendingFarmers.length === 0 ? (
              <p style={{color: '#aaa', marginTop: '20px', fontStyle: 'italic'}}>No farmers are currently waiting for approval.</p>
            ) : (
              <div className="table-container" style={{overflowX: 'auto', marginTop: '20px', background: '#1a1a2e', padding: '20px', borderRadius: '12px'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid #444'}}>
                      <th style={{padding: '12px', color: '#aaa'}}>Name</th>
                      <th style={{padding: '12px', color: '#aaa'}}>Email</th>
                      <th style={{padding: '12px', color: '#aaa'}}>Location</th>
                      <th style={{padding: '12px', color: '#aaa'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingFarmers.map(farmer => (
                      <tr key={farmer.id} style={{borderBottom: '1px solid #333'}}>
                        <td style={{padding: '12px', fontWeight: 'bold'}}>{farmer.name}</td>
                        <td style={{padding: '12px'}}>{farmer.email}</td>
                        <td style={{padding: '12px'}}>{farmer.village}, {farmer.state}</td>
                        <td style={{padding: '12px', display: 'flex', gap: '8px'}}>
                          <button onClick={() => handleApproval(farmer.id, 'approve')} style={{background: '#2ecc71', color: '#000', padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Approve</button>
                          <button onClick={() => handleApproval(farmer.id, 'reject')} style={{background: '#e74c3c', color: '#fff', padding: '6px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'}}>Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="dashboard-content">
            <h2>Events</h2>
            <p>Events management content here</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}