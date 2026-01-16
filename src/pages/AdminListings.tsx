import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  AlertTriangle,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  User,
  DollarSign,
  Package,
  Home,
  MessageSquare,
  Phone,
  Image as ImageIcon,
  Tag,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface Listing {
  id: string;
  title: string;
  type: "product" | "property";
  price: number;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  status: "active" | "pending" | "reported" | "suspended";
  description?: string;
  location?: string;
  images?: string[];
  category?: string;
  tags?: string[];

  // Product specific
  stock?: number;
  condition?: string;
  negotiable?: boolean;

  // Property specific
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  furnished?: boolean;
  property_type?: string;
  availability?: string;
}

interface ListingDetails {
  id: string;
  type: "product" | "property";
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  created_at: string;
  status: string;
  category: string;
  tags: string[];

  // Additional details based on type
  details: any;
}

const AdminListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedListing, setSelectedListing] = useState<ListingDetails | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      // Récupérer les produits
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          user:profiles(full_name, email),
          category:categories(name)
        `
        )
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Récupérer les propriétés
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
          *,
          user:profiles(full_name, email),
          category:categories(name)
        `
        )
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      // Combiner et formater les données
      const allListings: Listing[] = [
        ...(products?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "product" as const,
          price: p.price,
          user_id: p.user_id,
          user_name: p.user?.full_name || "Utilisateur inconnu",
          user_email: p.user?.email || "",
          created_at: p.created_at,
          updated_at: p.updated_at,
          description: p.description,
          location: p.location,
          images: p.images || [],
          category: p.category?.name || "Non catégorisé",
          tags: p.tags || [],
          stock: p.stock,
          condition: p.condition,
          negotiable: p.negotiable,
          status: (Math.random() > 0.7
            ? "reported"
            : Math.random() > 0.5
            ? "pending"
            : "active") as "active" | "pending" | "reported" | "suspended",
        })) || []),
        ...(properties?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "property" as const,
          price: p.price,
          user_id: p.user_id,
          user_name: p.user?.full_name || "Utilisateur inconnu",
          user_email: p.user?.email || "",
          created_at: p.created_at,
          updated_at: p.updated_at,
          description: p.description,
          location: p.location,
          images: p.images || [],
          category: p.category?.name || "Non catégorisé",
          tags: p.tags || [],
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqft: p.area_sqft,
          furnished: p.furnished,
          property_type: p.property_type,
          availability: p.availability,
          status: (Math.random() > 0.7
            ? "reported"
            : Math.random() > 0.5
            ? "pending"
            : "active") as "active" | "pending" | "reported" | "suspended",
        })) || []),
      ];

      // Filtrer les annonces
      let filteredListings = allListings;
      if (filter !== "all") {
        filteredListings = allListings.filter(
          (listing) => listing.status === filter
        );
      }

      // Filtrer par recherche
      if (searchTerm) {
        filteredListings = filteredListings.filter(
          (listing) =>
            listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.user_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            listing.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      setListings(filteredListings);
    } catch (error) {
      console.error("Erreur lors du chargement des annonces:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchListingDetails = async (
    id: string,
    type: "product" | "property"
  ) => {
    setLoadingDetails(true);
    try {
      const table = type === "product" ? "products" : "properties";
      const { data, error } = await supabase
        .from(table)
        .select(
          `
          *,
          user:profiles(full_name, email, phone),
          category:categories(name)
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const listingDetails: ListingDetails = {
        id: data.id,
        type: type,
        title: data.title,
        description: data.description || "Aucune description",
        price: data.price,
        location: data.location || "Localisation non spécifiée",
        images: data.images || [],
        user: {
          id: data.user_id,
          name: data.user?.full_name || "Utilisateur inconnu",
          email: data.user?.email || "",
          phone: data.user?.phone || "Non spécifié",
        },
        created_at: data.created_at,
        status: data.status || "active",
        category: data.category?.name || "Non catégorisé",
        tags: data.tags || [],
        details: data,
      };

      setSelectedListing(listingDetails);
      setIsDetailsOpen(true);
      if (listingDetails.images.length > 0) {
        setSelectedImage(listingDetails.images[0]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'annonce",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApprove = async (id: string, type: "product" | "property") => {
    try {
      const table = type === "product" ? "products" : "properties";
      const { error } = await supabase
        .from(table)
        .update({ status: "active" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce approuvée",
        description: "L'annonce a été approuvée avec succès",
        variant: "default",
      });

      // Mettre à jour la liste
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: "active" } : listing
        )
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'annonce",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, type: "product" | "property") => {
    try {
      const table = type === "product" ? "products" : "properties";
      const { error } = await supabase
        .from(table)
        .update({ status: "suspended" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce rejetée",
        description: "L'annonce a été rejetée",
        variant: "destructive",
      });

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: "suspended" } : listing
        )
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'annonce",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (id: string, type: "product" | "property") => {
    try {
      const table = type === "product" ? "products" : "properties";
      const { error } = await supabase
        .from(table)
        .update({ status: "suspended" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce suspendue",
        description: "L'annonce a été suspendue temporairement",
        variant: "destructive",
      });

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? { ...listing, status: "suspended" } : listing
        )
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suspendre l'annonce",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: "product" | "property") => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) return;

    try {
      const table = type === "product" ? "products" : "properties";
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée définitivement",
        variant: "destructive",
      });

      setListings((prev) => prev.filter((listing) => listing.id !== id));
      setIsDetailsOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "reported":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Signalée
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Suspendue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Modération des annonces</h1>
            <p className="text-muted-foreground">
              Gérez et modérez toutes les annonces de la plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchListings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Liste des annonces ({listings.length})</CardTitle>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    {["all", "active", "pending", "reported", "suspended"].map(
                      (status) => (
                        <Button
                          key={status}
                          variant={filter === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilter(status)}
                        >
                          {status === "all"
                            ? "Toutes"
                            : status === "active"
                            ? "Actives"
                            : status === "pending"
                            ? "En attente"
                            : status === "reported"
                            ? "Signalées"
                            : "Suspendues"}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, utilisateur..."
                    className="pl-9 w-full md:w-64"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      fetchListings();
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-lg font-medium">
                        Aucune annonce trouvée
                      </p>
                      <p className="text-muted-foreground">
                        {filter !== "all"
                          ? `Aucune annonce avec le statut "${filter}"`
                          : "Aucune annonce disponible"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((listing) => (
                    <TableRow key={listing.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[200px]">
                          {listing.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {listing.type === "product" ? (
                            <>
                              <Package className="h-3 w-3 mr-1" />
                              Produit
                            </>
                          ) : (
                            <>
                              <Home className="h-3 w-3 mr-1" />
                              Propriété
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(listing.price)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {listing.user_name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {listing.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(listing.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              fetchListingDetails(listing.id, listing.type)
                            }
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {listing.status !== "active" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleApprove(listing.id, listing.type)
                                  }
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Approuver
                                </DropdownMenuItem>
                              )}
                              {listing.status !== "suspended" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleSuspend(listing.id, listing.type)
                                  }
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
                                  Suspendre
                                </DropdownMenuItem>
                              )}
                              {listing.status !== "suspended" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleReject(listing.id, listing.type)
                                  }
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Rejeter
                                </DropdownMenuItem>
                              )}
                              <Separator className="my-1" />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDelete(listing.id, listing.type)
                                }
                                className="text-red-600"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Supprimer définitivement
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de détails de l'annonce */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            {loadingDetails ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Chargement des détails...</div>
              </div>
            ) : selectedListing ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedListing.type === "product" ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <Home className="h-5 w-5" />
                    )}
                    {selectedListing.title}
                  </DialogTitle>
                  <DialogDescription>
                    Détails complets de l'annonce
                  </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-6">
                    {/* Images */}
                    {selectedListing.images.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <h3 className="font-semibold">Photos</h3>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedListing.images.map((img, index) => (
                            <div
                              key={index}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                                selectedImage === img
                                  ? "border-primary"
                                  : "border-transparent"
                              }`}
                              onClick={() => setSelectedImage(img)}
                            >
                              <img
                                src={img}
                                alt={`Image ${index + 1}`}
                                className="h-20 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        {selectedImage && (
                          <div className="mt-4">
                            <img
                              src={selectedImage}
                              alt="Image principale"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 border rounded-lg text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          Aucune image disponible pour cette annonce
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Informations principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Informations principales
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Prix:
                              </span>
                              <span className="font-bold">
                                {formatCurrency(selectedListing.price)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Localisation:
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {selectedListing.location}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Catégorie:
                              </span>
                              <Badge variant="outline">
                                {selectedListing.category}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Statut:
                              </span>
                              {getStatusBadge(selectedListing.status)}
                            </div>
                          </div>
                        </div>

                        {/* Détails spécifiques */}
                        <div>
                          <h3 className="font-semibold mb-2">
                            Détails{" "}
                            {selectedListing.type === "product"
                              ? "du produit"
                              : "de la propriété"}
                          </h3>
                          <div className="space-y-2">
                            {selectedListing.type === "product" ? (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Stock:
                                  </span>
                                  <span>
                                    {selectedListing.details.stock ||
                                      "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Condition:
                                  </span>
                                  <span>
                                    {selectedListing.details.condition ||
                                      "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Prix négociable:
                                  </span>
                                  <span>
                                    {selectedListing.details.negotiable ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-600" />
                                    )}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Type:
                                  </span>
                                  <span>
                                    {selectedListing.details.property_type ||
                                      "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Chambres:
                                  </span>
                                  <span>
                                    {selectedListing.details.bedrooms ||
                                      "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Salles de bain:
                                  </span>
                                  <span>
                                    {selectedListing.details.bathrooms ||
                                      "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Surface:
                                  </span>
                                  <span>
                                    {selectedListing.details.area_sqft
                                      ? `${selectedListing.details.area_sqft} m²`
                                      : "Non spécifié"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Meublé:
                                  </span>
                                  <span>
                                    {selectedListing.details.furnished ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <X className="h-4 w-4 text-red-600" />
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Disponibilité:
                                  </span>
                                  <Badge variant="outline">
                                    {selectedListing.details.availability ||
                                      "Non spécifié"}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Informations utilisateur */}
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Informations du vendeur
                          </h3>
                          <div className="space-y-2 p-4 border rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Nom:
                              </span>
                              <span className="font-medium">
                                {selectedListing.user.name}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span>{selectedListing.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Téléphone:
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedListing.user.phone}
                              </span>
                            </div>
                            <div className="pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                              >
                                <MessageSquare className="h-3 w-3 mr-2" />
                                Contacter le vendeur
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {selectedListing.tags.length > 0 && (
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Tag className="h-4 w-4" />
                              Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedListing.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        <div>
                          <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Dates
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Créée le:
                              </span>
                              <span>
                                {formatDate(selectedListing.created_at)}
                              </span>
                            </div>
                            {selectedListing.details.updated_at && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Modifiée le:
                                </span>
                                <span>
                                  {formatDate(
                                    selectedListing.details.updated_at
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <div className="p-4 border rounded-lg">
                        <Textarea
                          value={selectedListing.description}
                          readOnly
                          className="min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="flex gap-2 sm:justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Fermer
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {selectedListing.status !== "active" && (
                      <Button
                        onClick={() => {
                          handleApprove(
                            selectedListing.id,
                            selectedListing.type
                          );
                          setIsDetailsOpen(false);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approuver
                      </Button>
                    )}
                    {selectedListing.status !== "suspended" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleSuspend(
                            selectedListing.id,
                            selectedListing.type
                          );
                          setIsDetailsOpen(false);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Suspendre
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminListings;
