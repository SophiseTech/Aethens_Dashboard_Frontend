import { Navigate } from "react-router-dom";
import useCan from "@hooks/useCan";

/**
 * Route-level guard for a single page. Renders children only when the user has
 * `action` (server/lib/rbac.js); otherwise redirects to the dashboard.
 * Place inside a <Protected /> group, which has already loaded the user.
 */
function PermissionGate({ action, children }) {
  const { can } = useCan();
  if (!can(action)) return <Navigate to="/" replace />;
  return children;
}

export default PermissionGate;
