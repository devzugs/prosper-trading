import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Avoid a flash-redirect to /login while the session is still being checked
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text-light">
        Loading…
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so Login can send them back after sign-in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;