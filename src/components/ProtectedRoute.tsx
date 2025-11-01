import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = ({
  children,
  role,
}: {
  children: JSX.Element;
  role?: string;
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    checkAuth();
  }, []);

  console.log("Check auth.user: %%%%%%%%%%%%%%%%%%%: ", user);
  if (isLoading) {
    return <div>Loading......</div>;
  }

  if (!isAuthenticated()) {
    console.log(" User not authenticated, redirecting to login...");
    return <Navigate to="/login" />;
  }

  console.log("🔍 ProtectedRoute Debug:", {
    pathname: location.pathname,
    user,
    requiredRole: role,
  });

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
