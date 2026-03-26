import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../api/axiosInstance';
import './UserApprovals.css';

export default function UserApprovals() {
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingFarmers();
  }, []);

  const fetchPendingFarmers = async () => {
    try {
      const res = await axiosInstance.get('/admin/pending-farmers');
      setPendingFarmers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axiosInstance.put(`/admin/${action}/${id}`);
      fetchPendingFarmers(); // Immediately refresh the queue visually!
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="approvals-container">
        <div className="approvals-header">
          <h2>Farmer Approvals</h2>
          <p>Review and securely authorize incoming agricultural partnerships.</p>
        </div>

        {loading ? (
          <div className="loader">Securing active verification queue...</div>
        ) : pendingFarmers.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🌾</span>
            <p>You're completely caught up! No pending farmers are awaiting your verification.</p>
          </div>
        ) : (
          <div className="premium-table-wrapper">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Contact Detail</th>
                  <th>Regional Location</th>
                  <th>Queue Status</th>
                  <th>Authorization Network</th>
                </tr>
              </thead>
              <tbody>
                {pendingFarmers.map(farmer => (
                  <tr key={farmer.id}>
                    <td>
                      <div className="user-identity">
                        <span className="avatar">{farmer.name.charAt(0).toUpperCase()}</span>
                        <span className="name">{farmer.name}</span>
                      </div>
                    </td>
                    <td>{farmer.email}</td>
                    <td>{farmer.village}, {farmer.state}</td>
                    <td><span className="badge pending">Pending Verification</span></td>
                    <td>
                      <div className="action-row">
                        <button className="auth-btn approve" onClick={() => handleAction(farmer.id, 'approve')}>
                          Verify & Approve
                        </button>
                        <button className="auth-btn reject" onClick={() => handleAction(farmer.id, 'reject')}>
                          Decline Request
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}