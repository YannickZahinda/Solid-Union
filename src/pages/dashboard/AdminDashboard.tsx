import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LogOut,
  Users,
  Package,
  Home,
  Search,
  Trash2,
  Shield,
  TrendingUp,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all users with their profiles
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch all products with seller info
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          seller:profiles!seller_id(full_name, email, role)
        `
        )
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch all properties with owner info
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
          *,
          owner:profiles!owner_id(full_name, email, role)
        `
        )
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleDeleteProduct = async (id) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProperty = async (id) => {
    try {
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      fetchAllData();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const viewDetails = (item, type) => {
    setSelectedItem({ ...item, type });
    setIsDetailDialogOpen(true);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "seller":
        return "bg-blue-500";
      case "buyer":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.owner?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalProperties: properties.length,
    totalRevenue:
      products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0) +
      properties.reduce((sum, p) => sum + Number(p.price), 0),
    buyers: users.filter((u) => u.role === "buyer").length,
    sellers: users.filter((u) => u.role === "seller").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">System Management Panel</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs opacity-75 mt-1">
                {stats.buyers} buyers · {stats.sellers} sellers · {stats.admins}{" "}
                admins
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs opacity-75 mt-1">Total listings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Home className="w-4 h-4" />
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProperties}</div>
              <p className="text-xs opacity-75 mt-1">Available properties</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(stats.totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs opacity-75 mt-1">RWF</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users, products, or properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-6 bg-slate-800 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-slate-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-slate-700"
            >
              Users ({filteredUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-slate-700"
            >
              Products ({filteredProducts.length})
            </TabsTrigger>
            <TabsTrigger
              value="properties"
              className="data-[state=active]:bg-slate-700"
            >
              Properties ({filteredProperties.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Users</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest registered users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {user.full_name || "No name"}
                          </p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Products</CardTitle>
                  <CardDescription className="text-slate-400">
                    Latest product listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.slice(0, 5).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white truncate">
                            {product.title}
                          </p>
                          <p className="text-sm text-slate-400">
                            by {product.seller?.full_name || "Unknown"}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-400 ml-2">
                          {Number(product.price).toLocaleString()} RWF
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage system users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-900 hover:bg-slate-900 border-slate-700">
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">
                          Location
                        </TableHead>
                        <TableHead className="text-slate-300">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="border-slate-700 hover:bg-slate-750"
                        >
                          <TableCell className="text-white font-medium">
                            {user.full_name || "No name"}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {user.city || "N/A"}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Products</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all product listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-900 hover:bg-slate-900 border-slate-700">
                        <TableHead className="text-slate-300">
                          Product
                        </TableHead>
                        <TableHead className="text-slate-300">Seller</TableHead>
                        <TableHead className="text-slate-300">Price</TableHead>
                        <TableHead className="text-slate-300">Stock</TableHead>
                        <TableHead className="text-slate-300">
                          Location
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow
                          key={product.id}
                          className="border-slate-700 hover:bg-slate-750"
                        >
                          <TableCell className="text-white font-medium">
                            {product.title}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {product.seller?.full_name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-green-400 font-semibold">
                            {Number(product.price).toLocaleString()} RWF
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {product.stock}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {product.location || "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => viewDetails(product, "product")}
                                className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">All Properties</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage all property listings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-900 hover:bg-slate-900 border-slate-700">
                        <TableHead className="text-slate-300">
                          Property
                        </TableHead>
                        <TableHead className="text-slate-300">Owner</TableHead>
                        <TableHead className="text-slate-300">Price</TableHead>
                        <TableHead className="text-slate-300">
                          Location
                        </TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow
                          key={property.id}
                          className="border-slate-700 hover:bg-slate-750"
                        >
                          <TableCell className="text-white font-medium">
                            {property.title}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {property.owner?.full_name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-green-400 font-semibold">
                            {Number(property.price).toLocaleString()} RWF
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {property.location || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                property.availability === "available"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }
                            >
                              {property.availability}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  viewDetails(property, "property")
                                }
                                className="text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteProperty(property.id)
                                }
                                className="text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.type === "product"
                ? "Product Details"
                : "Property Details"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete information about this listing
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedItem.title}</h3>
                <p className="text-slate-400 mt-1">
                  {selectedItem.description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <DollarSign className="w-4 h-4" />
                  <span>{Number(selectedItem.price).toLocaleString()} RWF</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedItem.location || "N/A"}</span>
                </div>
              </div>

              {selectedItem.type === "product" && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Package className="w-4 h-4" />
                  <span>Stock: {selectedItem.stock} units</span>
                </div>
              )}

              {selectedItem.type === "property" && (
                <div className="grid grid-cols-2 gap-4 text-slate-300">
                  <div>Bedrooms: {selectedItem.bedrooms || "N/A"}</div>
                  <div>Bathrooms: {selectedItem.bathrooms || "N/A"}</div>
                  <div>Furnished: {selectedItem.furnished ? "Yes" : "No"}</div>
                  <div>Phone: {selectedItem.contact_phone || "N/A"}</div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                <h4 className="font-semibold mb-2">
                  {selectedItem.type === "product"
                    ? "Seller Information"
                    : "Owner Information"}
                </h4>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {selectedItem.seller?.full_name ||
                        selectedItem.owner?.full_name ||
                        "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>
                      {selectedItem.seller?.email ||
                        selectedItem.owner?.email ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Listed:{" "}
                      {new Date(selectedItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
              className="border-slate-600"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
