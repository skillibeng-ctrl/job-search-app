import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ allowedRole }) {
  // In a real app, you'd get this from your AuthContext or localStorage
  const storedUser = JSON.parse(localStorage.getItem("jobflow_user") || "null");

  // If not logged in, kick them to the login page
  if (!storedUser) {
    return <Navigate to="/signin" replace />;
  }

  // If they are logged in but don't have the right role, kick them to the homepage
  if (allowedRole && storedUser.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // If they pass the checks, let them see the page
  return <Outlet />;
}