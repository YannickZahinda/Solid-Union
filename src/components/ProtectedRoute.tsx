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
      if (!isAuthenticated() || !user) {
        setLoading(false);
        return;
      }

      try {
        // First, try to get the profile
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching role:", error);
          setLoading(false);
          return;
        }

        // If no profile exists, create one
        if (!data) {
          console.log("Profile doesn't exist, creating one...");
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email,
              role: "buyer",
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating profile:", insertError);
            setLoading(false);
            return;
          }

          setProfileRole(newProfile?.role || null);
        } else {
          setProfileRole(data.role || null);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }

      setLoading(false);
    };

    fetchRole();
  }, [user, location.pathname]);

  if (loading) return <div>Loading...</div>;

  // Not logged in → redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Role not set or null → redirect to choose role
  if (!profileRole) {
    return <Navigate to="/choose-role" replace />;
  }

  // If specific role required but doesn't match
  if (role && profileRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
