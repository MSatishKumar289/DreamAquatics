import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ user, loading, children }) => {
  const location = useLocation();

  if (loading) return null; // or a loader

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
