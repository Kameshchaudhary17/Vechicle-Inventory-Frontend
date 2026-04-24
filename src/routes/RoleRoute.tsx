import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roleHome } from "../lib/utils/roleHome";
import type { Role } from "../constants";

export default function RoleRoute({ allow }: { allow: Role[] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allow.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
}
