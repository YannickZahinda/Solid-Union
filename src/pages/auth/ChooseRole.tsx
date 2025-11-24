import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/services/supabase";

const ChooseRole = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const saveRole = async (role: string) => {
    setLoading(true);

    const session = await supabase.auth.getSession(); 
    const accessToken = session.data.session?.access_token;

    const { data, error } = await supabase.functions.invoke("set-role", {
      body: { role },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (error) {
      console.error("Error updating role:", error);
      setLoading(false);
      return;
    }

    console.log("Role updated successfully:", data);

    // Wait a bit and verify the role was updated before navigating
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify role was saved
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.data.session?.user.id)
      .single();

    console.log("Verified role:", profile?.role);

    setLoading(false);

    // Redirect after role set
    if (role === "buyer") navigate("/buyer-dashboard");
    else if (role === "seller") navigate("/seller-dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
    else if (role === "proprietaire immobilier") navigate("/landlord-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Choose your role
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            className="w-full border rounded-md p-2"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Select Role --</option>
            <option value="buyer">Acheteur</option>
            <option value="seller">Vendeur</option>
            <option value="proprietaire immobilier">Propriétaire Immobilier</option>
            <option value="admin">Admin</option>
          </select>

          <Button
            disabled={!selectedRole || loading}
            onClick={() => saveRole(selectedRole)}
            className="w-full"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChooseRole;