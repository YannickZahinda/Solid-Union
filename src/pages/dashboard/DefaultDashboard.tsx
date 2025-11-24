import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";

const DefaultDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      const user = supabase.auth.getUser(); // returns a promise
      const { data: userData } = await user;

      if (!userData.user) {
        navigate("/login");
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (!profile || profile.role === "none") {
        navigate("/choose-role");
      } else if (profile.role === "buyer") navigate("/buyer-dashboard");
      else if (profile.role === "seller") navigate("/seller-dashboard");
      else if (profile.role === "admin") navigate("/admin-dashboard");
    };

    checkRole();
  }, []);

  return <div>Loading dashboard...</div>;
};

export default DefaultDashboard;
