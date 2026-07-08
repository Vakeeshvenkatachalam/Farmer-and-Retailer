import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../api/axiosInstance';
import { FiCheckCircle } from 'react-icons/fi';

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
      fetchPendingFarmers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="User Approvals">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-dark mb-2">Farmer Approvals</h2>
        <p className="text-text-medium">Review and securely authorize incoming agricultural partnerships.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : pendingFarmers.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center animate-in fade-in">
          <div className="text-6xl mb-4 text-green-100"><FiCheckCircle /></div>
          <h3 className="text-xl font-bold text-text-dark mb-2">All Caught Up!</h3>
          <p className="text-text-medium">No pending farmers are awaiting your verification.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Identity</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Contact Detail</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold text-text-dark text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingFarmers.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-light/20 text-primary flex items-center justify-center font-bold">
                          {farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-text-dark">{farmer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-medium">{farmer.email}</td>
                    <td className="px-6 py-4">
                      <p className="text-text-dark font-medium">{farmer.village}</p>
                      <p className="text-sm text-text-medium">{farmer.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-sm shadow-sm"
                          onClick={() => handleAction(farmer.id, 'approve')}
                        >
                          Verify & Approve
                        </button>
                        <button 
                          className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors text-sm"
                          onClick={() => handleAction(farmer.id, 'reject')}
                        >
                          Decline
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
    </DashboardLayout>
  );
}