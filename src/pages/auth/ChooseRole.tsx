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

    setLoading(false);

    if (error) {
      console.error("Error updating role:", error);
      return;
    }

    console.log("Role updated successfully:", data);

    // Redirect immediately after successful update
    if (role === "buyer") navigate("/buyer-dashboard");
    else if (role === "seller") navigate("/seller-dashboard");
    else if (role === "admin") navigate("/admin-dashboard");
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
            value={selectedRole}
          >
            <option value="">-- Select Role --</option>
            <option value="buyer">Acheteur (Buyer)</option>
            <option value="seller">Vendeur / Propriétaire (Seller)</option>
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
