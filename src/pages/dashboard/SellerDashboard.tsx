import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";

const SellerDashboard = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    loadProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <p>Welcome {profile?.full_name}</p>
    </div>
  );
};

export default SellerDashboard;
