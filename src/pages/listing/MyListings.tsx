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
  Briefcase,
  Wrench,
  Building2,
  Clock,
  Users,
  Award,
  Star,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Listing {
  id: string;
  title: string;
  description: string;
  price?: number;
  location: string;
  images: string[];
  created_at: string;
  type: "product" | "property" | "job" | "service";
  status?: string;

  // Product specific
  stock?: number;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;

  // Property specific
  bedrooms?: number;
  bathrooms?: number;
  property_type?: string;
  area_sqft?: number;
  furnished?: boolean;

  // Job specific
  company_name?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  experience_level?: string;
  is_remote?: boolean;
  applications_count?: number;

  // Service specific
  price_type?: string;
  delivery_type?: string;
  duration?: string;
  rating?: number;
  bookings_count?: number;
}

const MyListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "properties" | "jobs" | "services">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Récupérer les produits
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Récupérer les propriétés
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      // Récupérer les offres d'emploi
      const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Récupérer les services
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (servicesError) throw servicesError;

      // Combiner et mapper toutes les annonces
      const allListings: Listing[] = [
        ...(products?.map((p) => ({ ...p, type: "product" as const })) || []),
        ...(properties?.map((p) => ({ ...p, type: "property" as const })) || []),
        ...(jobs?.map((j) => ({ ...j, type: "job" as const, price: j.salary_min })) || []),
        ...(services?.map((s) => ({ ...s, type: "service" as const })) || []),
      ];

      setListings(allListings);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "product" | "property" | "job" | "service") => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      let table = "";
      switch (type) {
        case "product":
          table = "products";
          break;
        case "property":
          table = "properties";
          break;
        case "job":
          table = "jobs";
          break;
        case "service":
          table = "services";
          break;
      }
      
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "Votre annonce a été supprimée avec succès.",
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Prix sur demande";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${formatPrice(min)} - ${formatPrice(max)}/mois`;
    if (min) return `À partir de ${formatPrice(min)}/mois`;
    if (max) return `Jusqu'à ${formatPrice(max)}/mois`;
    return "Salaire sur demande";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Package className="h-4 w-4" />;
      case "property":
        return <Home className="h-4 w-4" />;
      case "job":
        return <Briefcase className="h-4 w-4" />;
      case "service":
        return <Wrench className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "product":
        return "Produit";
      case "property":
        return "Propriété";
      case "job":
        return "Offre d'emploi";
      case "service":
        return "Service";
      default:
        return "Annonce";
    }
  };

  const getConditionLabel = (condition?: string) => {
    switch (condition) {
      case "new":
        return "Neuf";
      case "used":
        return "Occasion";
      case "refurbished":
        return "Reconditionné";
      default:
        return condition || "Non spécifié";
    }
  };

  const getJobTypeLabel = (jobType?: string) => {
    switch (jobType) {
      case "full-time":
        return "Temps plein";
      case "part-time":
        return "Temps partiel";
      case "freelance":
        return "Freelance";
      case "internship":
        return "Stage";
      case "apprenticeship":
        return "Alternance";
      case "remote":
        return "Télétravail";
      case "contract":
        return "Contrat";
      default:
        return jobType || "Non spécifié";
    }
  };

  const getExperienceLabel = (experience?: string) => {
    switch (experience) {
      case "entry":
        return "Débutant";
      case "junior":
        return "Junior";
      case "senior":
        return "Senior";
      case "expert":
        return "Expert";
      default:
        return experience || "Non spécifié";
    }
  };

  const getPriceTypeLabel = (priceType?: string) => {
    switch (priceType) {
      case "fixed":
        return "Prix fixe";
      case "hourly":
        return "À l'heure";
      case "daily":
        return "À la journée";
      case "weekly":
        return "À la semaine";
      case "monthly":
        return "Au mois";
      case "negotiable":
        return "Négociable";
      default:
        return priceType || "Non spécifié";
    }
  };

  const getDeliveryTypeLabel = (deliveryType?: string) => {
    switch (deliveryType) {
      case "online":
        return "En ligne";
      case "onsite":
        return "Sur place";
      case "both":
        return "Les deux";
      case "remote":
        return "À distance";
      default:
        return deliveryType || "Non spécifié";
    }
  };

  const getPropertyTypeLabel = (propertyType?: string) => {
    switch (propertyType) {
      case "apartment":
        return "Appartement";
      case "house":
        return "Maison";
      case "villa":
        return "Villa";
      case "commercial":
        return "Local commercial";
      case "land":
        return "Terrain";
      case "townhouse":
        return "Maison de ville";
      default:
        return propertyType || "Non spécifié";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "filled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "expired":
        return "Expiré";
      case "filled":
        return "Pourvu";
      default:
        return "Actif";
    }
  };

  const filteredListings = listings.filter((listing) => {
    // Filtre par onglet
    if (activeTab !== "all" && listing.type !== activeTab.slice(0, -1)) {
      return false;
    }
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.location.toLowerCase().includes(searchLower) ||
        (listing.company_name && listing.company_name.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement de vos annonces...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mes annonces</h1>
            <p className="text-muted-foreground">
              Gérez tous vos produits, propriétés, offres d'emploi et services
            </p>
          </div>
          <Button asChild>
            <Link to="/create-listing">
              <PlusCircle className="h-4 w-4 mr-2" />
              Créer une annonce
            </Link>
          </Button>
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveTab(value as any)}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="flex flex-wrap h-auto">
              <TabsTrigger value="all" className="flex items-center gap-2">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Propriétés
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Emplois
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Services
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Rechercher une annonce..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              formatSalary={formatSalary}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getConditionLabel={getConditionLabel}
              getJobTypeLabel={getJobTypeLabel}
              getExperienceLabel={getExperienceLabel}
              getPriceTypeLabel={getPriceTypeLabel}
              getDeliveryTypeLabel={getDeliveryTypeLabel}
              getPropertyTypeLabel={getPropertyTypeLabel}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatSalary={formatSalary}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getConditionLabel={getConditionLabel}
              getJobTypeLabel={getJobTypeLabel}
              getExperienceLabel={getExperienceLabel}
              getPriceTypeLabel={getPriceTypeLabel}
              getDeliveryTypeLabel={getDeliveryTypeLabel}
              getPropertyTypeLabel={getPropertyTypeLabel}
            />
          </TabsContent>

          <TabsContent value="properties" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatSalary={formatSalary}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getConditionLabel={getConditionLabel}
              getJobTypeLabel={getJobTypeLabel}
              getExperienceLabel={getExperienceLabel}
              getPriceTypeLabel={getPriceTypeLabel}
              getDeliveryTypeLabel={getDeliveryTypeLabel}
              getPropertyTypeLabel={getPropertyTypeLabel}
            />
          </TabsContent>

          <TabsContent value="jobs" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatSalary={formatSalary}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getConditionLabel={getConditionLabel}
              getJobTypeLabel={getJobTypeLabel}
              getExperienceLabel={getExperienceLabel}
              getPriceTypeLabel={getPriceTypeLabel}
              getDeliveryTypeLabel={getDeliveryTypeLabel}
              getPropertyTypeLabel={getPropertyTypeLabel}
            />
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <ListingGrid
              listings={filteredListings}
              onDelete={handleDelete}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatSalary={formatSalary}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getConditionLabel={getConditionLabel}
              getJobTypeLabel={getJobTypeLabel}
              getExperienceLabel={getExperienceLabel}
              getPriceTypeLabel={getPriceTypeLabel}
              getDeliveryTypeLabel={getDeliveryTypeLabel}
              getPropertyTypeLabel={getPropertyTypeLabel}
            />
          </TabsContent>
        </Tabs>

        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune annonce</h3>
            <p className="text-muted-foreground mb-6">
              Commencez par créer votre première annonce
            </p>
            <Button asChild>
              <Link to="/create-listing">
                <PlusCircle className="h-4 w-4 mr-2" />
                Créer votre première annonce
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Composant de grille d'annonces
const ListingGrid = ({
  listings,
  onDelete,
  formatPrice,
  formatDate,
  formatSalary,
  getTypeIcon,
  getTypeLabel,
  getStatusColor,
  getStatusLabel,
  getConditionLabel,
  getJobTypeLabel,
  getExperienceLabel,
  getPriceTypeLabel,
  getDeliveryTypeLabel,
  getPropertyTypeLabel,
}: {
  listings: Listing[];
  onDelete: (id: string, type: "product" | "property" | "job" | "service") => void;
  formatPrice: (price?: number) => string;
  formatDate: (date: string) => string;
  formatSalary: (min?: number, max?: number) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeLabel: (type: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  getConditionLabel: (condition?: string) => string;
  getJobTypeLabel: (jobType?: string) => string;
  getExperienceLabel: (experience?: string) => string;
  getPriceTypeLabel: (priceType?: string) => string;
  getDeliveryTypeLabel: (deliveryType?: string) => string;
  getPropertyTypeLabel: (propertyType?: string) => string;
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
          <Badge className="absolute top-2 left-2 flex items-center gap-1">
            {getTypeIcon(listing.type)}
            {getTypeLabel(listing.type)}
          </Badge>
          {listing.status && (
            <Badge 
              className={`absolute top-2 right-2 ${getStatusColor(listing.status)}`}
            >
              {getStatusLabel(listing.status)}
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
          {listing.company_name && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {listing.company_name}
            </p>
          )}
          <CardDescription className="line-clamp-2">
            {listing.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-lg font-bold text-primary">
                <DollarSign className="h-4 w-4 mr-1" />
                {listing.type === "job" 
                  ? formatSalary(listing.salary_min, listing.salary_max)
                  : formatPrice(listing.price)
                }
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
            </div>

            {/* Détails spécifiques aux produits */}
            {listing.type === "product" && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  Stock: {listing.stock}
                </span>
                <span>État: {getConditionLabel(listing.condition)}</span>
              </div>
            )}

            {/* Détails spécifiques aux propriétés */}
            {listing.type === "property" && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {listing.bedrooms && <span>🛏️ {listing.bedrooms} ch.</span>}
                {listing.bathrooms && <span>🚿 {listing.bathrooms} sdb</span>}
                {listing.area_sqft && <span>📐 {listing.area_sqft} m²</span>}
                {listing.property_type && (
                  <Badge variant="outline">{getPropertyTypeLabel(listing.property_type)}</Badge>
                )}
              </div>
            )}

            {/* Détails spécifiques aux offres d'emploi */}
            {listing.type === "job" && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {listing.job_type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getJobTypeLabel(listing.job_type)}
                  </Badge>
                )}
                {listing.experience_level && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {getExperienceLabel(listing.experience_level)}
                  </Badge>
                )}
                {listing.is_remote && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    Télétravail
                  </Badge>
                )}
                {listing.applications_count !== undefined && (
                  <span className="flex items-center text-muted-foreground">
                    <Users className="h-3 w-3 mr-1" />
                    {listing.applications_count} candidatures
                  </span>
                )}
              </div>
            )}

            {/* Détails spécifiques aux services */}
            {listing.type === "service" && (
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {listing.price_type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {getPriceTypeLabel(listing.price_type)}
                  </Badge>
                )}
                {listing.delivery_type && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    {getDeliveryTypeLabel(listing.delivery_type)}
                  </Badge>
                )}
                {listing.duration && (
                  <span className="flex items-center text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {listing.duration}
                  </span>
                )}
                {listing.rating && listing.rating > 0 && (
                  <span className="flex items-center text-amber-600">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {listing.rating} / 5
                  </span>
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