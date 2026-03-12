import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Total Farmers', value: '3', icon: '👨‍🌾' },
    { label: 'Pending Farmers', value: '0', icon: '⏳' },
    { label: 'Approved Farmers', value: '3', icon: '✅' },
    { label: 'Total Retailers', value: '1', icon: '🏪' },
    { label: 'Total Orders', value: '1', icon: '📦' },
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
            <p>Approval management content here</p>
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