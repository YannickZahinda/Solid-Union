import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: JSX.Element;
  role?: string;
}) => {
  const { user, isAuthenticated } = useAuth();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchRole = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      // Load role from DB
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      setProfileRole(data?.role || null);
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Role not chosen yet → redirect
  if (!profileRole || profileRole === "none") {
    return <Navigate to="/choose-role" replace />;
  }

  // If specific role required but doesn’t match
  if (role && profileRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
