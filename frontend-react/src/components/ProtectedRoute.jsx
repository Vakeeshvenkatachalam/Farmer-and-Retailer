import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const userRole = localStorage.getItem("role") || user?.role;

  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole.toUpperCase() !== role.toUpperCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;