import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";

interface ProtectedRouteProps {
  children: ReactNode;
  requireProfileComplete?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requireProfileComplete = true,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setIsAuthenticated(true);

      // Vérifier le profil utilisateur
      const { data: profile } = await supabase
        .from("profiles")
        .select("completion_percentage, role")
        .eq("id", user.id)
        .single();

      const isComplete = profile?.completion_percentage >= 70;
      const userIsAdmin = profile?.role === "admin";

      setProfileComplete(isComplete);
      setIsAdmin(userIsAdmin);

      // Rediriger vers le tableau de bord approprié
      if (
        userIsAdmin &&
        !requireAdmin &&
        window.location.pathname === "/dashboard"
      ) {
        navigate("/admin-dashboard");
        return;
      }

      // Vérifier les permissions administrateur
      if (requireAdmin && !userIsAdmin) {
        navigate("/dashboard");
        return;
      }

      // Rediriger pour compléter le profil si nécessaire
      if (requireProfileComplete && !isComplete) {
        navigate("/complete-profile");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, requireProfileComplete, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
