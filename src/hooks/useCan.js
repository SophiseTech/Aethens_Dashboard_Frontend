import { useCallback } from "react";
import { useStore } from "zustand";
import userStore from "@stores/UserStore";

/**
 * Permission checks backed by the server's role map (server/lib/rbac.js), which is
 * sent with the login / auth-check response. Use this instead of role lists for
 * migrated modules (enquiries, targets, tasks).
 *
 *   const { can, canAllCenters } = useCan();
 *   can("enquiry:demo")            // may the user book demos?
 *   canAllCenters("target:view")   // may they see every center?
 */
export default function useCan() {
  const permissions = useStore(userStore, (s) => s.permissions);

  const can = useCallback((action) => Boolean(permissions?.[action]), [permissions]);
  const canAllCenters = useCallback((action) => permissions?.[action] === "all", [permissions]);

  return { can, canAllCenters };
}
