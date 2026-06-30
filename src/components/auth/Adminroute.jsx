import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  // Wait until both session and profile are fully resolved
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text-light">
        Loading Admin Environment…
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but unauthorized profile role
  if (!isAdmin) {
    console.warn("Unauthorized access attempt to admin panel.");
    return <Navigate to="/dashboard" replace />;
  }

  // Render direct children if provided, fallback to Outlet for nested routes
  return children ? children : <Outlet />;
};

export default AdminRoute;