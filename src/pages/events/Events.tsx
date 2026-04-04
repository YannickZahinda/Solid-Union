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
  CalendarDays,
  DollarSign,
  User,
  Calendar,
  Phone,
  Send,
  X,
  Check,
  Clock,
  Users,
  Video,
  MapPinHouse,
  Mic2,
  Ticket,
  Globe,
  Mail,
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

interface Event {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  start_date: string;
  end_date: string;
  max_attendees: number;
  speakers: string[];
  organizer_name: string;
  website_url: string;
  registration_url: string;
  is_online: boolean;
  online_link: string;
  is_free: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  images: string[];
  created_at: string;
  category_id: string;
  user_id: string;
  organizer?: {
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

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const eventTypes = [
    { label: "Tous", value: "all" },
    { label: "En présentiel", value: "onsite" },
    { label: "En ligne", value: "online" },
  ];

  const priceOptions = [
    { label: "Tous", value: "all" },
    { label: "Gratuit", value: "free" },
    { label: "Payant", value: "paid" },
  ];

  useEffect(() => {
    fetchEvents();
    fetchCategories();
    fetchFavorites();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizer:profiles!user_id(full_name, avatar_url, city, phone, email),
          category:categories(name, icon)
        `
        )
        .eq("status", "published")
        .gte("start_date", new Date().toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
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
      .eq("type", "event")
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
      .eq("listing_type", "event");

    if (data) {
      setFavorites(new Set(data.map((item) => item.listing_id)));
    }
  };

  const toggleFavorite = async (eventId: string) => {
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
      if (favorites.has(eventId)) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", eventId)
          .eq("listing_type", "event");

        if (error) throw error;
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast({
          title: "Retiré des favoris",
          description: "Événement retiré de vos favoris",
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: eventId,
          listing_type: "event",
        });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(eventId));
        toast({
          title: "Ajouté aux favoris",
          description: "Événement ajouté à vos favoris",
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === "" ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.speakers?.some((speaker) =>
        speaker.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || event.category_id === selectedCategory;

    const matchesEventType =
      selectedEventType === "all" ||
      (selectedEventType === "online" && event.is_online) ||
      (selectedEventType === "onsite" && !event.is_online);

    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "free" && event.is_free) ||
      (selectedPrice === "paid" && !event.is_free && event.price > 0);

    return matchesSearch && matchesCategory && matchesEventType && matchesPrice;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number, isFree: boolean) => {
    if (isFree) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getRecurrenceLabel = (pattern: string) => {
    const patterns: Record<string, string> = {
      daily: "Tous les jours",
      weekly: "Toutes les semaines",
      monthly: "Tous les mois",
      yearly: "Tous les ans",
      none: "Unique",
    };
    return patterns[pattern] || pattern;
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedEvent || !messageContent.trim()) return;

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
        p_receiver_id: selectedEvent.user_id,
        p_content: messageContent,
        p_listing_id: selectedEvent.id,
        p_listing_type: "event",
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
          <div className="text-lg">Chargement des événements...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 text-white py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez des Événements Exceptionnels
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Conférences, ateliers, concerts et plus encore
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un événement..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type d'événement" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger>
                  <SelectValue placeholder="Tarif" />
                </SelectTrigger>
                <SelectContent>
                  {priceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
                  setSelectedEventType("all");
                  setSelectedPrice("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "Événement à venir" : "Événements à venir"}
            </h2>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-muted-foreground">
                Aucun événement ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="group overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(event)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {event.category && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <span>{event.category.icon}</span>
                              {event.category.name}
                            </Badge>
                          )}
                          {event.is_online && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              En ligne
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {event.title}
                        </h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(event.id);
                        }}
                        className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(event.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDateTime(event.start_date)}
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.is_online ? "En ligne" : event.location}
                    </div>

                    <div className="flex items-center text-xl font-bold text-primary mb-3">
                      <DollarSign className="h-4 w-4" />
                      {formatPrice(event.price, event.is_free)}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {event.speakers && event.speakers.length > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Mic2 className="h-3 w-3 mr-1" />
                        {event.speakers.length} intervenant(s)
                      </div>
                    )}

                    {event.max_attendees > 0 && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {event.max_attendees} places disponibles
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t mt-3">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Publié le {formatDate(event.created_at)}
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

      {/* Event Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {selectedEvent.category?.name} • Organisé par {selectedEvent.organizer_name || selectedEvent.organizer?.full_name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Event Header */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Date et heure:</span>
                      </div>
                      <p className="text-sm ml-6">{formatDateTime(selectedEvent.start_date)}</p>
                      {selectedEvent.end_date && (
                        <p className="text-sm ml-6 text-muted-foreground">
                          Jusqu'au {formatDateTime(selectedEvent.end_date)}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Lieu:</span>
                      </div>
                      {selectedEvent.is_online ? (
                        <p className="text-sm ml-6 flex items-center">
                          <Video className="h-3 w-3 mr-1" />
                          Événement en ligne
                        </p>
                      ) : (
                        <>
                          <p className="text-sm ml-6">{selectedEvent.location}</p>
                          {selectedEvent.address && (
                            <p className="text-sm ml-6 text-muted-foreground">
                              {selectedEvent.address}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Informations</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Tarif:</span>
                        <span className="ml-2 font-bold text-primary">
                          {formatPrice(selectedEvent.price, selectedEvent.is_free)}
                        </span>
                      </div>
                      {selectedEvent.max_attendees > 0 && (
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Capacité:</span>
                          <span className="ml-2">{selectedEvent.max_attendees} personnes</span>
                        </div>
                      )}
                      {selectedEvent.is_recurring && (
                        <div className="flex items-center text-sm">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Récurrence:</span>
                          <span className="ml-2">{getRecurrenceLabel(selectedEvent.recurrence_pattern)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Liens</h4>
                    <div className="space-y-2">
                      {selectedEvent.website_url && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={selectedEvent.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Site web
                          </a>
                        </div>
                      )}
                      {selectedEvent.registration_url && (
                        <div className="flex items-center text-sm">
                          <Ticket className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={selectedEvent.registration_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Lien d'inscription
                          </a>
                        </div>
                      )}
                      {selectedEvent.is_online && selectedEvent.online_link && (
                        <div className="flex items-center text-sm">
                          <Video className="h-4 w-4 mr-2 text-muted-foreground" />
                          <a href={selectedEvent.online_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Rejoindre l'événement
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Speakers */}
                {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Intervenants</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.speakers.map((speaker, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          <Mic2 className="h-3 w-3" />
                          {speaker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizer Info */}
                {selectedEvent.organizer && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Organisateur</h4>
                    <div className="flex items-center gap-3">
                      {selectedEvent.organizer.avatar_url ? (
                        <img
                          src={selectedEvent.organizer.avatar_url}
                          alt={selectedEvent.organizer.full_name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{selectedEvent.organizer.full_name}</div>
                        {selectedEvent.organizer.email && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {selectedEvent.organizer.email}
                          </div>
                        )}
                        {selectedEvent.organizer.phone && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {selectedEvent.organizer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter l'organisateur
                </Button>
                {selectedEvent.registration_url && (
                  <Button asChild className="btn-hero">
                    <a href={selectedEvent.registration_url} target="_blank" rel="noopener noreferrer">
                      <Ticket className="h-4 w-4 mr-2" />
                      S'inscrire
                    </a>
                  </Button>
                )}
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
              Contactez {selectedEvent?.organizer?.full_name || selectedEvent?.organizer_name || "l'organisateur"} au sujet de "{selectedEvent?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                placeholder="Bonjour, je suis intéressé par cet événement..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Posez vos questions sur l'événement
              </p>
            </div>

            {selectedEvent && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedEvent.title}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(selectedEvent.start_date)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatPrice(selectedEvent.price, selectedEvent.is_free)}
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

export default Events;