import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Home, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LandlordDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold text-primary">SolidUnion Landlord Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Hello, {user?.email}</span>
          <Button variant="destructive" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">
              <Home className="h-4 w-4 mr-2" /> Properties
            </TabsTrigger>
            <TabsTrigger value="products">
              <ShoppingBag className="h-4 w-4 mr-2" /> Products
            </TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Properties</h2>
              <Button>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Property
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apartment in Kinshasa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>3 Bedrooms • $500/month</p>
                  <Button variant="secondary" className="mt-2">Manage</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Studio in Goma</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>1 Bedroom • $200/month</p>
                  <Button variant="secondary" className="mt-2">Manage</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Your Products</h2>
              <Button>
                <PlusCircle className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generator for Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>$450 • Available</p>
                  <Button variant="secondary" className="mt-2">Manage</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Construction Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>$120 • Available</p>
                  <Button variant="secondary" className="mt-2">Manage</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LandlordDashboard;
