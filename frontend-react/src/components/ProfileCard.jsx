import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfileCard = ({ role }) => {
  const [user, setUser] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/${role}/${userId}`)
      .then((res) => {
        setUser(res.data);
        setImagePreview(res.data.profileImage);
      })
      .catch((err) => console.error(err));
  }, [role, userId]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUser({ ...user, profileImage: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    Object.keys(user).forEach((key) => {
      formData.append(key, user[key]);
    });

    await axios.put(
      `http://localhost:8080/api/${role}/update/${userId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setEditMode(false);
    alert("Profile Updated Successfully!");
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-header">
          <img
            src={
              imagePreview
                ? imagePreview
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="profile-img"
          />
          {editMode && (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>

        <div className="profile-body">
          <input
            type="text"
            name="name"
            value={user.name || ""}
            disabled={!editMode}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            value={user.email || ""}
            disabled={!editMode}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            value={user.phone || ""}
            disabled={!editMode}
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            value={user.location || ""}
            disabled={!editMode}
            onChange={handleChange}
          />
        </div>

        <div className="profile-actions">
          {!editMode ? (
            <button className="edit-btn" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          ) : (
            <button className="save-btn" onClick={handleUpdate}>
              Save Changes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;