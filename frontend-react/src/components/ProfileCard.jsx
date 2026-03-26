import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "./layout/DashboardLayout";

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

  if (loading) return <DashboardLayout><p>Loading Profile...</p></DashboardLayout>;
  if (!profileData || !profileData.user) return <DashboardLayout><p>Error loading profile.</p></DashboardLayout>;

  const userData = profileData.user;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ padding: "30px", background: "#1a1a2e", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
          
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #333", paddingBottom: "20px", marginBottom: "20px" }}>
            <div style={{ 
              width: "80px", height: "80px", borderRadius: "50%", background: "#4caf50", 
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold", color: "#fff", marginRight: "20px" 
            }}>
              {userData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: "0 0 5px 0", color: "#fff" }}>{userData.name}</h2>
              <div style={{ display: "inline-block", padding: "4px 12px", background: "#2196f3", color: "#fff", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                {userData.role}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ color: "#4caf50", marginBottom: "12px", borderBottom: "1px dotted #333", paddingBottom: "5px" }}>Personal Details</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "15px", color: "#bbb" }}>
              <p><strong style={{ color: "#fff" }}>Email:</strong><br/>{userData.email}</p>
              <p><strong style={{ color: "#fff" }}>State:</strong><br/>{userData.state || "N/A"}</p>
              
              {userData.role === "FARMER" && (
                <>
                  <p><strong style={{ color: "#fff" }}>Farm Type:</strong><br/>{userData.farmType || "N/A"}</p>
                  <p><strong style={{ color: "#fff" }}>Village:</strong><br/>{userData.village || "N/A"}</p>
                </>
              )}
              
              {userData.role === "RETAILER" && (
                <>
                  <p><strong style={{ color: "#fff" }}>Shop Name:</strong><br/>{userData.shopName || "N/A"}</p>
                  <p><strong style={{ color: "#fff" }}>City:</strong><br/>{userData.city || "N/A"}</p>
                </>
              )}
            </div>
          </div>

          <div style={{ background: "#0d0d1a", padding: "15px", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#4caf50" }}>Platform Activity</h3>
            {userData.role === "FARMER" && (
              <p style={{ margin: 0, fontSize: "16px" }}>You have <strong>{profileData.totalProducts || 0}</strong> products listed on the platform.</p>
            )}
            {userData.role === "RETAILER" && (
              <p style={{ margin: 0, fontSize: "16px" }}>You have placed <strong>{profileData.totalOrders || 0}</strong> orders on the platform.</p>
            )}
            {userData.role === "ADMIN" && (
              <p style={{ margin: 0, fontSize: "16px" }}>There are <strong>{profileData.pendingApprovals || 0}</strong> users waiting for your approval.</p>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileCard;