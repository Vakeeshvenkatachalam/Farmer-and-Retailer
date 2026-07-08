import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";
import { FiUser, FiMail, FiMapPin, FiBriefcase, FiHome, FiShoppingBag, FiActivity, FiStar } from "react-icons/fi";

const ProfileCard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    axiosInstance
      .get(`/profile/${user.id}`)
      .then((res) => {
        setProfileData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  if (!profileData || !profileData.user) return (
    <DashboardLayout>
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-2xl mx-auto text-center font-bold">
        Error loading profile.
      </div>
    </DashboardLayout>
  );

  const userData = profileData.user;

  return (
    <DashboardLayout title="My Profile">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-dark mb-1">Account Information</h2>
          <p className="text-text-medium">View and manage your personal and platform details.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="h-32 bg-gradient-to-r from-green-400 to-primary"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="flex items-end gap-5">
                <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md">
                  <div className="w-full h-full rounded-xl bg-green-50 text-primary flex items-center justify-center text-4xl font-bold">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="pb-2">
                  <h2 className="text-2xl font-bold text-text-dark leading-tight">{userData.name}</h2>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mt-1 inline-block">
                    {userData.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-text-dark mb-4 pb-2 border-b border-gray-100">
                  <FiUser className="text-primary" /> Personal Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">Email Address</span>
                    <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <FiMail className="text-gray-400" /> {userData.email}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">State Location</span>
                    <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                      <FiMapPin className="text-gray-400" /> {userData.state || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-text-dark mb-4 pb-2 border-b border-gray-100">
                  <FiBriefcase className="text-primary" /> Role Specifics
                </h3>
                <div className="space-y-4">
                  {userData.role === "FARMER" && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">Farm Type</span>
                        <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <FiActivity className="text-gray-400" /> {userData.farmType || "Not specified"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">Village / Region</span>
                        <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <FiHome className="text-gray-400" /> {userData.village || "Not specified"}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {userData.role === "RETAILER" && (
                    <>
                      <div>
                        <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">Shop / Business Name</span>
                        <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <FiShoppingBag className="text-gray-400" /> {userData.shopName || "Not specified"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-text-medium uppercase tracking-wider block mb-1">City</span>
                        <div className="flex items-center gap-2 text-text-dark font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                          <FiMapPin className="text-gray-400" /> {userData.city || "Not specified"}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {userData.role === "ADMIN" && (
                    <div className="text-text-medium italic p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                      Admin accounts have global access.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-green-50 p-6 rounded-2xl border border-green-100">
              <h3 className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <FiStar /> Platform Activity
              </h3>
              {userData.role === "FARMER" && (
                <p className="text-green-800">You currently have <strong className="text-xl mx-1">{profileData.totalProducts || 0}</strong> products listed on the platform.</p>
              )}
              {userData.role === "RETAILER" && (
                <p className="text-green-800">You have placed <strong className="text-xl mx-1">{profileData.totalOrders || 0}</strong> orders on the platform.</p>
              )}
              {userData.role === "ADMIN" && (
                <p className="text-green-800">There are <strong className="text-xl mx-1">{profileData.pendingApprovals || 0}</strong> users waiting for your approval right now.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileCard;