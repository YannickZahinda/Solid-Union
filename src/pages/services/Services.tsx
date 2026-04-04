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
  Search,
  Filter,
  MapPin,
  Eye,
  Heart,
  MessageSquare,
  Wrench,
  DollarSign,
  User,
  Calendar,
  Phone,
  Send,
  X,
  Check,
  Clock,
  Award,
  Globe,
  Mail,
  Star,
  Users,
} from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  price_type: string;
  location: string;
  delivery_type: string;
  duration: string;
  experience_years: number;
  certifications: string[];
  languages: string[];
  availability_start: string;
  availability_end: string;
  images: string[];
  rating: number;
  reviews_count: number;
  created_at: string;
  category_id: string;
  user_id: string;
  provider?: {
    full_name: string;
    avatar_url: string;
    city: string;
    phone: string;
    email: string;
  };
  category?: {
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState("all");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const priceTypes = [
    { label: "Tous", value: "all" },
    { label: "Prix fixe", value: "fixed" },
    { label: "À l'heure", value: "hourly" },
    { label: "À la journée", value: "daily" },
    { label: "À la semaine", value: "weekly" },
    { label: "Au mois", value: "monthly" },
    { label: "Négociable", value: "negotiable" },
  ];

  const deliveryTypes = [
    { label: "Tous", value: "all" },
    { label: "En ligne", value: "online" },
    { label: "Sur place", value: "onsite" },
    { label: "Les deux", value: "both" },
    { label: "À distance", value: "remote" },
  ];

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchFavorites();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("services")
        .select(
          `
          *,
          provider:profiles!user_id(full_name, avatar_url, city, phone, email),
          category:categories(name, icon)
        `
        )
        .eq("status", "active")
        .order("rating", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "service")
      .order("name");

    if (data) setCategories(data);
  };

  const fetchFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_type", "service");

    if (data) {
      setFavorites(new Set(data.map((item) => item.listing_id)));
    }
  };

  const toggleFavorite = async (serviceId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      if (favorites.has(serviceId)) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", serviceId)
          .eq("listing_type", "service");

        if (error) throw error;
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(serviceId);
          return newSet;
        });
        toast({
          title: "Retiré des favoris",
          description: "Service retiré de vos favoris",
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: serviceId,
          listing_type: "service",
        });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(serviceId));
        toast({
          title: "Ajouté aux favoris",
          description: "Service ajouté à vos favoris",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchTerm === "" ||
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.certifications?.some((cert) =>
        cert.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      service.languages?.some((lang) =>
        lang.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || service.category_id === selectedCategory;

    const matchesPriceType =
      selectedPriceType === "all" || service.price_type === selectedPriceType;

    const matchesDelivery =
      selectedDelivery === "all" || service.delivery_type === selectedDelivery;

    return matchesSearch && matchesCategory && matchesPriceType && matchesDelivery;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number, priceType: string) => {
    const formattedPrice = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

    const typeLabels: Record<string, string> = {
      fixed: "",
      hourly: "/heure",
      daily: "/jour",
      weekly: "/semaine",
      monthly: "/mois",
      negotiable: " (négociable)",
    };

    return `${formattedPrice}${typeLabels[priceType] || ""}`;
  };

  const getPriceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fixed: "Prix fixe",
      hourly: "À l'heure",
      daily: "À la journée",
      weekly: "À la semaine",
      monthly: "Au mois",
      negotiable: "Négociable",
    };
    return types[type] || type;
  };

  const getDeliveryTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      online: "En ligne",
      onsite: "Sur place",
      both: "Les deux",
      remote: "À distance",
    };
    return types[type] || type;
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setIsDetailDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedService || !messageContent.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour envoyer un message",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase.rpc("send_message", {
        p_receiver_id: selectedService.user_id,
        p_content: messageContent,
        p_listing_id: selectedService.id,
        p_listing_type: "service",
      });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

      setMessageContent("");
      setIsMessageDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement des services...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Des Services de Qualité
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Trouvez des professionnels pour tous vos besoins
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un service..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedPriceType} onValueChange={setSelectedPriceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de tarif" />
                </SelectTrigger>
                <SelectContent>
                  {priceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDelivery} onValueChange={setSelectedDelivery}>
                <SelectTrigger>
                  <SelectValue placeholder="Mode de prestation" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedPriceType("all");
                  setSelectedDelivery("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "Service disponible" : "Services disponibles"}
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-16">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucun service trouvé
              </h3>
              <p className="text-muted-foreground">
                Aucun service ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="group overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {service.category && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{service.category.icon}</span>
                              {service.category.name}
                            </Badge>
                          )}
                          {service.rating > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              {service.rating} ({service.reviews_count})
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(service.id);
                        }}
                        className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(service.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {getPriceTypeLabel(service.price_type)}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {getDeliveryTypeLabel(service.delivery_type)}
                      </Badge>
                      {service.duration && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {service.location}
                    </div>

                    <div className="flex items-center text-xl font-bold text-primary mb-3">
                      {formatPrice(service.price, service.price_type)}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {service.experience_years > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Award className="h-3 w-3 mr-1" />
                        {service.experience_years} ans d'expérience
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(service.created_at)}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedService.title}</DialogTitle>
                <DialogDescription>
                  {selectedService.category?.name} • {getPriceTypeLabel(selectedService.price_type)} •{" "}
                  {formatDate(selectedService.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Rating and Price */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      {selectedService.rating > 0 && (
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(selectedService.rating)
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({selectedService.reviews_count} avis)
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedService.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(selectedService.price, selectedService.price_type)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Informations sur la prestation</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Type de tarif:</span>
                        <span className="ml-2">{getPriceTypeLabel(selectedService.price_type)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Mode de prestation:</span>
                        <span className="ml-2">{getDeliveryTypeLabel(selectedService.delivery_type)}</span>
                      </div>
                      {selectedService.duration && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Durée estimée:</span>
                          <span className="ml-2">{selectedService.duration}</span>
                        </div>
                      )}
                      {selectedService.experience_years > 0 && (
                        <div className="flex items-center text-sm">
                          <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Expérience:</span>
                          <span className="ml-2">{selectedService.experience_years} ans</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Disponibilités</h4>
                    <div className="space-y-2">
                      {selectedService.availability_start && selectedService.availability_end && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Horaires:</span>
                          <span className="ml-2">
                            {selectedService.availability_start} - {selectedService.availability_end}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description du service</h4>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedService.description}
                  </p>
                </div>

                {/* Certifications */}
                {selectedService.certifications && selectedService.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-600" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedService.languages && selectedService.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Langues parlées</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedService.languages.map((lang, index) => (
                        <Badge key={index} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider Info */}
                {selectedService.provider && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Informations du prestataire</h4>
                    <div className="flex items-center gap-3">
                      {selectedService.provider.avatar_url ? (
                        <img
                          src={selectedService.provider.avatar_url}
                          alt={selectedService.provider.full_name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{selectedService.provider.full_name}</div>
                        {selectedService.provider.city && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {selectedService.provider.city}
                          </div>
                        )}
                        {selectedService.provider.phone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {selectedService.provider.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le prestataire
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>
              Contactez {selectedService?.provider?.full_name || "le prestataire"} au sujet de "{selectedService?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                placeholder="Bonjour, je suis intéressé par votre service..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Décrivez votre besoin et les détails de votre demande
              </p>
            </div>

            {selectedService && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedService.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(selectedService.price, selectedService.price_type)}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="btn-hero"
            >
              {sendingMessage ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Services;