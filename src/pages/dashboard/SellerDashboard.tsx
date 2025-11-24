import { useEffect, useState } from "react";
import { supabase } from "@/services/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LogOut,
  Package,
  Home,
  Plus,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Edit,
  Trash2,
  Box,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("products");

  // Product form state
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    stock: "",
    negociable: false,
  });

  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    furnished: false,
    availability: "available",
    contact_phone: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      setProducts(productsData || []);

      // Load properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
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

  const handleAddProduct = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("products").insert({
        seller_id: user.id,
        title: productForm.title,
        description: productForm.description,
        price: parseFloat(productForm.price),
        location: productForm.location,
        stock: parseInt(productForm.stock),
        negociable: productForm.negociable,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      setIsProductDialogOpen(false);
      setProductForm({
        title: "",
        description: "",
        price: "",
        location: "",
        stock: "",
        negociable: false,
      });
      loadData();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleAddProperty = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("properties").insert({
        owner_id: user.id,
        title: propertyForm.title,
        description: propertyForm.description,
        price: parseFloat(propertyForm.price),
        location: propertyForm.location,
        bedrooms: propertyForm.bedrooms
          ? parseInt(propertyForm.bedrooms)
          : null,
        bathrooms: propertyForm.bathrooms
          ? parseInt(propertyForm.bathrooms)
          : null,
        furnished: propertyForm.furnished,
        availability: propertyForm.availability,
        contact_phone: propertyForm.contact_phone,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property added successfully",
      });

      setIsPropertyDialogOpen(false);
      setPropertyForm({
        title: "",
        description: "",
        price: "",
        location: "",
        bedrooms: "",
        bathrooms: "",
        furnished: false,
        availability: "available",
        contact_phone: "",
      });
      loadData();
    } catch (error) {
      console.error("Error adding property:", error);
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadData();
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
      loadData();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Seller Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                Welcome, {profile?.full_name || "Seller"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-2"
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
          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                My Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{products.length}</div>
              <p className="text-xs opacity-75 mt-1">Total listings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{properties.length}</div>
              <p className="text-xs opacity-75 mt-1">Total properties</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Total Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
              </div>
              <p className="text-xs opacity-75 mt-1">Units available</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">
                Available Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  properties.filter((p) => p.availability === "available")
                    .length
                }
              </div>
              <p className="text-xs opacity-75 mt-1">Ready to rent/sell</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="grid grid-cols-2 w-full sm:w-auto">
              <TabsTrigger value="products" className="gap-2">
                <Package className="w-4 h-4" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-2">
                <Home className="w-4 h-4" />
                Properties ({properties.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2 w-full sm:w-auto">
              <Dialog
                open={isProductDialogOpen}
                onOpenChange={setIsProductDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2 flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Fill in the details to list a new product
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={productForm.title}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="Product name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your product"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price (USD $) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={productForm.location}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            location: e.target.value,
                          })
                        }
                        placeholder="City, District"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="negociable"
                        checked={productForm.negociable}
                        onCheckedChange={(checked) =>
                          setProductForm({
                            ...productForm,
                            negociable: checked,
                          })
                        }
                      />
                      <Label htmlFor="negociable">Price is negotiable</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsProductDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProduct}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Add Product
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isPropertyDialogOpen}
                onOpenChange={setIsPropertyDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2 flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4" />
                    Add Property
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Property</DialogTitle>
                    <DialogDescription>
                      Fill in the details to list a new property
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="prop-title">Title *</Label>
                      <Input
                        id="prop-title"
                        value={propertyForm.title}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="Property name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="prop-description">Description</Label>
                      <Textarea
                        id="prop-description"
                        value={propertyForm.description}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your property"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="prop-price">Price (RWF) *</Label>
                        <Input
                          id="prop-price"
                          type="number"
                          value={propertyForm.price}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              price: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="prop-location">Location</Label>
                        <Input
                          id="prop-location"
                          value={propertyForm.location}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              location: e.target.value,
                            })
                          }
                          placeholder="City, District"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={propertyForm.bedrooms}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              bedrooms: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={propertyForm.bathrooms}
                          onChange={(e) =>
                            setPropertyForm({
                              ...propertyForm,
                              bathrooms: e.target.value,
                            })
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact">Contact Phone</Label>
                      <Input
                        id="contact"
                        value={propertyForm.contact_phone}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            contact_phone: e.target.value,
                          })
                        }
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Select
                        value={propertyForm.availability}
                        onValueChange={(value) =>
                          setPropertyForm({
                            ...propertyForm,
                            availability: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="taken">Taken</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="furnished"
                        checked={propertyForm.furnished}
                        onCheckedChange={(checked) =>
                          setPropertyForm({
                            ...propertyForm,
                            furnished: checked,
                          })
                        }
                      />
                      <Label htmlFor="furnished">Furnished</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsPropertyDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProperty}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Add Property
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Box className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No products yet
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Start by adding your first product
                  </p>
                  <Button
                    onClick={() => setIsProductDialogOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">
                          {product.title}
                        </CardTitle>
                        {product.negociable && (
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            Negotiable
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {product.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-600" />
                        <span className="text-2xl font-bold text-slate-900">
                          {Number(product.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-600">RWF</span>
                      </div>

                      {product.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="text-sm truncate">
                            {product.location}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-600">
                          Stock: {product.stock} units
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Home className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No properties yet
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Start by adding your first property
                  </p>
                  <Button
                    onClick={() => setIsPropertyDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-1">
                          {property.title}
                        </CardTitle>
                        <Badge
                          className={
                            property.availability === "available"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {property.availability}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {property.description || "No description"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-600" />
                        <span className="text-2xl font-bold text-slate-900">
                          {Number(property.price).toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-600">RWF</span>
                      </div>

                      {property.location && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="text-sm truncate">
                            {property.location}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-slate-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span className="text-sm">{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span className="text-sm">
                              {property.bathrooms}
                            </span>
                          </div>
                        )}
                        {property.furnished && (
                          <Badge variant="outline" className="text-xs">
                            Furnished
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDeleteProperty(property.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SellerDashboard;
