import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  MapPin,
  Eye,
  Heart,
  Bed,
  Bath,
  Square,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  Home,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Star,
  Check,
  X,
  ChevronRightIcon,
  Maximize2,
  Download,
  Share2,
  Camera,
  Car,
  Wifi,
  Tv,
  Snowflake,
  Dumbbell,
  Coffee,
  Waves,
} from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  is_offered: boolean;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  furnished: boolean;
  property_type: string;
  availability: string;
  images: string[];
  tags: string[];
  created_at: string;
  user_id: string;
  category_id: string | null;
  contact_phone: string | null;

  // Joined user data
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
  };

  // Joined category data
  categories?: {
    name: string;
    icon: string;
  };
}

const Properties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [minBedrooms, setMinBedrooms] = useState("any");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const { isSubscribed, refetch: refetchSub } = useSubscription();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const itemsPerPage = 6;

  // Types de propriétés en français
  const propertyTypes = [
    { value: "apartment", label: "Appartement" },
    { value: "house", label: "Maison" },
    { value: "commercial", label: "Commercial" },
    { value: "land", label: "Terrain" },
    { value: "villa", label: "Villa" },
    { value: "townhouse", label: "Maison de ville" },
  ];

  // Fourchettes de prix en français
  const priceRanges = [
    { label: "Moins de 500$", min: 0, max: 500 },
    { label: "500$ - 1 000$", min: 500, max: 1000 },
    { label: "1 000$ - 2 500$", min: 1000, max: 2500 },
    { label: "2 500$ - 5 000$", min: 2500, max: 5000 },
    { label: "Plus de 5 000$", min: 5000, max: Infinity },
  ];

  // Options de chambres
  const bedroomOptions = ["1+", "2+", "3+", "4+"];

  // Équipements typiques
  const amenities = [
    { icon: <Wifi className="h-4 w-4" />, label: "Wi-Fi" },
    { icon: <Tv className="h-4 w-4" />, label: "Télévision" },
    { icon: <Snowflake className="h-4 w-4" />, label: "Climatisation" },
    { icon: <Car className="h-4 w-4" />, label: "Parking" },
    { icon: <Dumbbell className="h-4 w-4" />, label: "Salle de sport" },
    { icon: <Coffee className="h-4 w-4" />, label: "Café" },
    { icon: <Waves className="h-4 w-4" />, label: "Piscine" },
  ];

  useEffect(() => {
    fetchProperties();
  }, [page, searchTerm, selectedType, priceRange, minBedrooms]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let query = supabase.from("properties").select(
        `
          *,
          profiles!inner(id, full_name, avatar_url, city, phone, email),
          categories(name, icon)
        `,
        { count: "exact" }
      );

      if (searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`
        );
      }

      if (selectedType !== "all") {
        query = query.eq("property_type", selectedType);
      }

      if (priceRange !== "any") {
        const range = priceRanges.find((r) => r.label === priceRange);
        if (range) {
          query = query.gte("price", range.min);
          if (range.max !== Infinity) {
            query = query.lte("price", range.max);
          }
        }
      }

      if (minBedrooms !== "any") {
        const minBeds = parseInt(minBedrooms.replace("+", ""));
        query = query.gte("bedrooms", minBeds);
      }

      query = query.eq("availability", "available");

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedProperty || !messageContent.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour envoyer un message",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (user.id === selectedProperty.user_id) {
      toast({
        title: "Impossible de s'envoyer un message",
        description: "Vous ne pouvez pas vous envoyer un message à vous-même",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      const { data: messageId, error } = await supabase.rpc("send_message", {
        p_receiver_id: selectedProperty.user_id,
        p_content: messageContent,
        p_listing_id: selectedProperty.id,
        p_listing_type: "property",
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Votre message a été envoyé au propriétaire.",
      });

      setMessageContent("");
      setMessageDialogOpen(false);
      navigate("/messages");
    } catch (error: any) {
      toast({
        title: "Erreur d'envoi",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return date.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setDetailsDialogOpen(true);
  };

  const nextImage = () => {
    if (selectedProperty?.images) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.images.length - 1 : prev - 1
      );
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    const found = propertyTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Layout>
      {/* Section Hero */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Trouvez Votre Maison Idéale
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Découvrez des propriétés de qualité de propriétaires de confiance
            </p>
          </div>

          {/* Recherche et Filtres */}
          <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par lieu, titre ou mots-clés..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de propriété" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Fourchette de prix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Tous les prix</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Chambres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Toutes</SelectItem>
                  {bedroomOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Grille de Propriétés */}
      <div className="py-12">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading
                ? "Chargement..."
                : `${totalCount} Propriétés Disponibles`}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Page {page} sur {totalPages}
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="md:flex">
                    <div className="md:w-1/2 h-48 md:h-auto bg-gray-200 dark:bg-gray-700" />
                    <CardContent className="p-6 md:w-1/2 space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Aucune propriété trouvée
              </h3>
              <p className="text-gray-500">
                {searchTerm ||
                selectedType !== "all" ||
                priceRange !== "any" ||
                minBedrooms !== "any"
                  ? "Essayez d'ajuster vos filtres"
                  : "Soyez le premier à lister une propriété !"}
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/create-listing")}
              >
                Lister une propriété
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {properties.map((property) => (
                <Card
                  key={property.id}
                  className="group overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="md:flex">
                    <div className="relative md:w-1/2">
                      <img
                        src={
                          property.images?.[0] ||
                          `https://via.placeholder.com/400x300?text=${getPropertyTypeLabel(
                            property.property_type
                          )}`
                        }
                        alt={property.title}
                        className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        onClick={() => handleViewDetails(property)}
                      />
                      {property.is_offered ? (
                        <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                          🎁 Offert
                        </Badge>
                      ) : property.availability === "available" ? (
                        <Badge className="absolute top-2 left-2 bg-green-500">
                          Disponible
                        </Badge>
                      ) : (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          {property.availability}
                        </Badge>
                      )}
                      {property.furnished && (
                        <Badge
                          variant="secondary"
                          className="absolute top-2 right-2"
                        >
                          Meublé
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-6 md:w-1/2 flex flex-col">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
                            {property.title}
                          </h3>
                          <div className="text-right ml-2">
                            {property.is_offered ? (
                              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                GRATUIT
                              </span>
                            ) : (
                              <>
                                <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                                  {formatPrice(property.price)}
                                </span>
                                <span className="text-sm text-gray-500 block">
                                  /mois
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {property.description}
                        </p>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.location}
                          </div>
                          <Badge variant="outline">
                            {getPropertyTypeLabel(property.property_type)}
                          </Badge>
                        </div>

                        {/* Détails de la Propriété */}
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                          {property.bedrooms && property.bedrooms > 0 && (
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              {property.bedrooms} chambre
                              {property.bedrooms > 1 ? "s" : ""}
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              {property.bathrooms} salle
                              {property.bathrooms > 1 ? "s" : ""} de bain
                            </div>
                          )}
                          {property.area_sqft && (
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              {property.area_sqft.toLocaleString()} pi²
                            </div>
                          )}
                        </div>

                        {/* Info Propriétaire */}
                        <div className="flex items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarImage
                              src={property.profiles?.avatar_url || ""}
                            />
                            <AvatarFallback>
                              {property.profiles?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {property.profiles?.full_name ||
                                "Propriétaire inconnu"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {property.profiles?.city || "Lieu non spécifié"}
                            </p>
                          </div>
                        </div>

                        {/* Mots-clés */}
                        {property.tags && property.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {property.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {property.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{property.tags.length - 3} plus
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(property.created_at)}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(property)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </Button>

                          <Dialog
                            open={messageDialogOpen}
                            onOpenChange={setMessageDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setMessageDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Contacter
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Contacter {property.profiles?.full_name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <h4 className="font-medium mb-2">
                                    {property.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {property.location}
                                  </p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-500">
                                    {formatPrice(property.price)}/mois
                                  </p>
                                </div>
                                <Textarea
                                  placeholder="Écrivez votre message ici... Vous pouvez demander la disponibilité, planifier une visite ou poser des questions sur la propriété."
                                  value={messageContent}
                                  onChange={(e) =>
                                    setMessageContent(e.target.value)
                                  }
                                  rows={4}
                                />
                                <Button
                                  onClick={handleSendMessage}
                                  disabled={
                                    sendingMessage || !messageContent.trim()
                                  }
                                  className="w-full"
                                >
                                  {sendingMessage
                                    ? "Envoi en cours..."
                                    : "Envoyer le message"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Détails */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProperty && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedProperty.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Galerie d'Images */}
                <div className="relative">
                  <div className="relative h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {selectedProperty.images &&
                    selectedProperty.images.length > 0 ? (
                      <>
                        <img
                          src={selectedProperty.images[currentImageIndex]}
                          alt={`${selectedProperty.title} - Image ${
                            currentImageIndex + 1
                          }`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                        {/* Contrôles de navigation d'image */}
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 transition-all"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Indicateurs d'image */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                          {selectedProperty.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? "bg-white w-4"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Compteur d'images */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          <Camera className="h-3 w-3 inline mr-1" />
                          {currentImageIndex + 1} /{" "}
                          {selectedProperty.images.length}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Miniatures */}
                  {selectedProperty.images &&
                    selectedProperty.images.length > 1 && (
                      <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
                        {selectedProperty.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              index === currentImageIndex
                                ? "border-green-500"
                                : "border-transparent"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Miniature ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Prix et Statut */}
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {formatPrice(selectedProperty.price)}
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-300">
                        /mois
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className="bg-green-500">
                        {selectedProperty.availability === "available"
                          ? "Disponible"
                          : "Non disponible"}
                      </Badge>
                      {selectedProperty.furnished && (
                        <Badge variant="secondary">Meublé</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      setSelectedProperty(selectedProperty);
                      setMessageDialogOpen(true);
                    }}
                    size="lg"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contacter le propriétaire
                  </Button>
                </div>

                {/* Informations Principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Bed className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                    <div className="text-2xl font-bold">
                      {selectedProperty.bedrooms || 0}
                    </div>
                    <div className="text-sm text-gray-500">Chambres</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Bath className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                    <div className="text-2xl font-bold">
                      {selectedProperty.bathrooms || 0}
                    </div>
                    <div className="text-sm text-gray-500">Salles de bain</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Square className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                    <div className="text-2xl font-bold">
                      {selectedProperty.area_sqft?.toLocaleString() || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">Pieds carrés</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                    <Home className="h-8 w-8 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                    <div className="text-lg font-bold capitalize">
                      {getPropertyTypeLabel(selectedProperty.property_type)}
                    </div>
                    <div className="text-sm text-gray-500">Type</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                    {selectedProperty.description}
                  </p>
                </div>

                {/* Localisation */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Localisation</h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="h-5 w-5" />
                    <span>{selectedProperty.location}</span>
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">
                    Équipements inclus
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="text-gray-600 dark:text-gray-300">
                          {amenity.icon}
                        </div>
                        <span className="text-sm">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mots-clés */}
                {selectedProperty.tags && selectedProperty.tags.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">
                      Caractéristiques
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Information du Propriétaire */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">
                    Informations du propriétaire
                  </h3>
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={selectedProperty.profiles?.avatar_url || ""}
                      />
                      <AvatarFallback>
                        {selectedProperty.profiles?.full_name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {selectedProperty.profiles?.full_name || "Propriétaire"}
                      </h4>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {selectedProperty.profiles?.city ||
                              "Lieu non spécifié"}
                          </span>
                        </div>
                        {selectedProperty.profiles?.phone && (
                          <div className="mt-1">
                            {isSubscribed ? (
                              <a
                                href={`tel:${selectedProperty.profiles.phone}`}
                                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                              >
                                <Phone className="h-4 w-4" />
                                {selectedProperty.profiles.phone}
                              </a>
                            ) : (
                              <button
                                onClick={() => setShowSubModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 hover:bg-amber-100 transition-colors w-full"
                              >
                                <Lock className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-left">Voir le numéro — Abonnement requis</span>
                              </button>
                            )}
                          </div>
                        )}
                        {selectedProperty.profiles?.email && (
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Mail className="h-4 w-4" />
                            <span>{selectedProperty.profiles.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDetailsDialogOpen(false);
                        setSelectedProperty(selectedProperty);
                        setMessageDialogOpen(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <Button variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      setSelectedProperty(selectedProperty);
                      setMessageDialogOpen(true);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter maintenant
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={() => {
          setShowSubModal(false);
          refetchSub();
        }}
      />
    </Layout>
  );
};

export default Properties;
