import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  Package,
  Home,
  DollarSign,
  MapPin,
  Calendar,
  Filter,
  Search,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
  type: "product" | "property";

  // Product specific
  stock?: number;
  negotiable?: boolean;
  condition?: string;

  // Property specific
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
}

const MyListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "properties">(
    "all"
  );

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Fetch properties
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      // Combine and map listings
      const allListings: Listing[] = [
        ...(products?.map((p) => ({ ...p, type: "product" })) || []),
        ...(properties?.map((p) => ({ ...p, type: "property" })) || []),
      ];

      setListings(allListings);
    } catch (error: any) {
      toast({
        title: "Error fetching listings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "product" | "property") => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const table = type === "product" ? "products" : "properties";
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Listing deleted",
        description: "Your listing has been removed successfully.",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error deleting listing",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const filteredListings = listings.filter((listing) => {
    if (activeTab === "all") return true;
    if (activeTab === "products") return listing.type === "product";
    if (activeTab === "properties") return listing.type === "property";
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading your listings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">
              Manage all your products and properties in one place
            </p>
          </div>
          <Button asChild>
            <Link to="/create-listing">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Listing
            </Link>
          </Button>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="all">All Listings</TabsTrigger>
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="properties">
                <Home className="h-4 w-4 mr-2" />
                Properties
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search listings..."
                  className="pl-9 pr-4 py-2 border rounded-lg w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="properties" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start selling by creating your first listing
            </p>
            <Button asChild>
              <Link to="/create-listing">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Listing Grid Component
const ListingGrid = ({
  listings,
  onDelete,
  formatPrice,
  formatDate,
}: {
  listings: Listing[];
  onDelete: (id: string, type: "product" | "property") => void;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {listings.map((listing) => (
      <Card
        key={listing.id}
        className="overflow-hidden hover:shadow-lg transition-shadow"
      >
        <div className="relative h-48">
          <img
            src={
              listing.images?.[0] ||
              `https://via.placeholder.com/400x300?text=${listing.type}`
            }
            alt={listing.title}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 left-2">
            {listing.type === "product" ? "Product" : "Property"}
          </Badge>
          {listing.type === "product" && listing.negotiable && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Negotiable
            </Badge>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg line-clamp-1">
              {listing.title}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {listing.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-lg font-bold text-primary">
                <DollarSign className="h-4 w-4 mr-1" />
                {formatPrice(listing.price)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
            </div>

            {listing.type === "product" && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Stock: {listing.stock}
                </span>
                <span>Condition: {listing.condition}</span>
              </div>
            )}

            {listing.type === "property" && (
              <div className="flex items-center gap-4 text-sm">
                {listing.bedrooms && <span>🏠 {listing.bedrooms} bed</span>}
                {listing.bathrooms && <span>🚿 {listing.bathrooms} bath</span>}
                {listing.property_type && (
                  <Badge variant="outline">{listing.property_type}</Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 border-t flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            {formatDate(listing.created_at)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(listing.id, listing.type)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

export default MyListings;
