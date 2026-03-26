import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (userRole.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;