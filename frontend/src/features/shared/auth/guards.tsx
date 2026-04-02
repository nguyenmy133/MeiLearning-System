import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth-context";
import { getRoleHomePath } from "./role-utils";
import type { UserRole } from "./types";

interface GuardProps {
  children: JSX.Element;
}

interface RoleRouteProps extends GuardProps {
  allowRoles: UserRole[];
}

export function PublicOnlyRoute({ children }: GuardProps) {
  const { isAuthenticated, isInitializing, role } = useAuth();

  // Đang khôi phục session → chờ, không redirect vội
  if (isInitializing) return null;

  if (isAuthenticated && role) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return children;
}

export function RoleRoute({ allowRoles, children }: RoleRouteProps) {
  const { isAuthenticated, isInitializing, role } = useAuth();
  const location = useLocation();

  // Đang khôi phục session → render nothing, tránh flash về /login
  if (isInitializing) return null;

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
