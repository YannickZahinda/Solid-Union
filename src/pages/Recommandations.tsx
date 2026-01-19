import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Filter,
  Search,
  Heart,
  MapPin,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  Smartphone,
  Home,
  Car,
  Shirt,
  Briefcase,
  Building,
  ChevronLeft,
  Zap,
  Target,
  Users,
  Package,
  Calendar,
  Tag,
  ThumbsUp,
  MessageSquare,
  Truck,
  Gamepad2,
  Music,
  Book,
  Utensils,
  Palette,
  Dumbbell,
  RefreshCw,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  CheckCircle,
  Phone,
  Mail,
  Share2,
  Bed,
  Bath,
  Square,
  Layers,
  Check,
  AlertTriangle,
  Eye,
  Users as UsersIcon,
  CalendarDays,
  Shield,
  Clock3,
  ExternalLink,
  Maximize2,
  Minus,
  Plus,
  Menu,
  ChevronDown,
  SlidersHorizontal,
  Grid,
  List,
  Menu as MenuIcon,
  X as XIcon,
  MessageCircle,
  Send,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Map,
  Navigation,
  Award,
  TrendingDown,
  Download,
  Upload,
  User,
  ArrowRight,
  Crown,
  ShieldAlert,
  Globe,
  Home as HomeIcon,
  Store,
  BriefcaseBusiness,
  Camera,
  Image as ImageIcon,
  Video,
  Mic,
  Paperclip,
  Smile,
  MoreVertical,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  CheckSquare,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  type: "product" | "property";
  category: string;
  category_id: string;
  postedAt: string;
  views: number;
  isFavorite: boolean;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_verified: boolean;
  created_at: string;
  relevance_score?: number;
  interest_level?: number;

  // Propriétés spécifiques aux produits
  stock?: number;
  negotiable?: boolean;
  condition?: string;
  tags?: string[];

  // Propriétés spécifiques aux propriétés
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  furnished?: boolean;
  property_type?: string;
  availability?: string;
  contact_phone?: string;
}

interface UserInterest {
  id: string;
  category_id: string;
  interest_level: number;
  category_name: string;
  category_type: string;
  category_icon: string;
}

interface CategoryStats {
  category_id: string;
  category_name: string;
  count: number;
  avg_price: number;
  icon: string;
}

interface ListingDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  type: "product" | "property";
  category: string;
  category_id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_verified: boolean;
  user_email?: string;
  user_phone?: string;
  user_joined?: string;

  // Détails produits
  stock?: number;
  negotiable?: boolean;
  condition?: string;
  tags?: string[];

  // Détails propriétés
  bedrooms?: number;
  bathrooms?: number;
  area_sqft?: number;
  furnished?: boolean;
  property_type?: string;
  availability?: string;
  contact_phone?: string;

  // Statistiques
  views: number;
  favorites_count: number;
  isFavorite: boolean;
}

const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>(
    []
  );
  const [filteredItems, setFilteredItems] = useState<RecommendedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingInterests, setLoadingInterests] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [relevanceThreshold, setRelevanceThreshold] = useState(3);

  // État pour le modal
  const [selectedItem, setSelectedItem] = useState<ListingDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchUserInterestsAndRecommendations();
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, activeTab, recommendedItems]);

  const fetchUserInterestsAndRecommendations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setLoadingInterests(false);
      return;
    }

    try {
      setLoadingInterests(true);

      // Fetch user interests with proper join
      const { data: interests, error: interestsError } = await supabase
        .from("user_interests")
        .select(
          `
          id,
          category_id,
          interest_level,
          categories!inner (
            id,
            name,
            type,
            icon
          )
        `
        )
        .eq("user_id", user.id)
        .order("interest_level", { ascending: false });

      if (interestsError) throw interestsError;

      if (interests && interests.length > 0) {
        const formattedInterests: UserInterest[] = interests.map(
          (interest) => ({
            id: interest.id,
            category_id: interest.category_id,
            interest_level: interest.interest_level,
            category_name: interest.categories?.name || "Catégorie inconnue",
            category_type: interest.categories?.type || "product",
            category_icon: interest.categories?.icon || "📦",
          })
        );

        setUserInterests(formattedInterests);
        calculateCategoryStats(formattedInterests);
        await fetchRecommendedItems(formattedInterests);
      } else {
        await fetchGeneralRecommendations();
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement des intérêts:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos centres d'intérêt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingInterests(false);
    }
  };

  const calculateCategoryStats = (interests: UserInterest[]) => {
    const stats: CategoryStats[] = interests.map((interest) => ({
      category_id: interest.category_id,
      category_name: interest.category_name,
      count: Math.floor(Math.random() * 50) + 10,
      avg_price: Math.floor(Math.random() * 5000) + 100,
      icon: interest.category_icon,
    }));

    setCategoryStats(stats);
  };

  const fetchRecommendedItems = async (interests: UserInterest[]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const highInterestCategories = interests
        .filter((interest) => interest.interest_level >= relevanceThreshold)
        .map((interest) => interest.category_id);

      if (highInterestCategories.length === 0) {
        await fetchGeneralRecommendations();
        return;
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          categories!inner (name, type, icon),
          profiles!inner (full_name, avatar_url, phone)
        `
        )
        .in("category_id", highInterestCategories)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (productsError) throw productsError;

      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
          *,
          categories!inner (name, type, icon),
          profiles!inner (full_name, avatar_url, phone)
        `
        )
        .in("category_id", highInterestCategories)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (propertiesError) throw propertiesError;

      const allItems = await combineAndScoreItems(
        products || [],
        properties || [],
        interests
      );

      setRecommendedItems(allItems);
      setFilteredItems(allItems);
    } catch (error: any) {
      console.error("Erreur lors du chargement des recommandations:", error);
      await fetchGeneralRecommendations();
    }
  };

  const fetchGeneralRecommendations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: recentProducts } = await supabase
        .from("products")
        .select(
          `
          *,
          categories!inner (name, type, icon),
          profiles!inner (full_name, avatar_url, phone)
        `
        )
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);

      const { data: recentProperties } = await supabase
        .from("properties")
        .select(
          `
          *,
          categories!inner (name, type, icon),
          profiles!inner (full_name, avatar_url, phone)
        `
        )
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);

      const allItems = await formatItems(
        recentProducts || [],
        recentProperties || []
      );

      setRecommendedItems(allItems);
      setFilteredItems(allItems);

      toast({
        title: "Recommandations générales",
        description: "Voici les annonces les plus récentes",
        variant: "default",
      });
    } catch (error: any) {
      console.error(
        "Erreur lors du chargement des recommandations générales:",
        error
      );
    }
  };

  const combineAndScoreItems = async (
    products: any[],
    properties: any[],
    interests: UserInterest[]
  ): Promise<RecommendedItem[]> => {
    const formattedProducts = await formatItems(products, []);
    const formattedProperties = await formatItems([], properties);
    const allItems = [...formattedProducts, ...formattedProperties];

    return allItems
      .map((item) => {
        const matchingInterest = interests.find(
          (interest) => interest.category_id === item.category_id
        );

        if (!matchingInterest) return item;

        const interestScore = matchingInterest.interest_level * 10;
        const recencyScore = new Date(item.created_at).getTime();
        const popularityScore = Math.min(item.views * 0.1, 20);
        const totalScore =
          interestScore + recencyScore / 10000000000 + popularityScore;

        return {
          ...item,
          relevance_score: totalScore,
          interest_level: matchingInterest.interest_level,
        };
      })
      .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
      .slice(0, 24);
  };

  const formatItems = async (
    products: any[],
    properties: any[]
  ): Promise<RecommendedItem[]> => {
    const formattedProducts: RecommendedItem[] = (products || []).map(
      (product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description || "",
        price: product.price,
        location: product.location,
        images: product.images || [
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
        ],
        type: "product" as const,
        category: product.categories?.name || "Produit",
        category_id: product.category_id,
        postedAt: new Date(product.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        views: Math.floor(Math.random() * 100),
        isFavorite: favoriteIds.has(product.id),
        user_id: product.user_id,
        user_name: product.profiles?.full_name || "Anonyme",
        user_avatar:
          product.profiles?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.user_id}`,
        user_verified: !!product.profiles?.full_name,
        created_at: product.created_at,
        stock: product.stock,
        negotiable: product.negotiable,
        condition: product.condition,
        tags: product.tags || [],
      })
    );

    const formattedProperties: RecommendedItem[] = (properties || []).map(
      (property: any) => ({
        id: property.id,
        title: property.title,
        description: property.description || "",
        price: property.price,
        location: property.location,
        images: property.images || [
          "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop",
        ],
        type: "property" as const,
        category: property.categories?.name || "Propriété",
        category_id: property.category_id,
        postedAt: new Date(property.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        views: Math.floor(Math.random() * 100),
        isFavorite: favoriteIds.has(property.id),
        user_id: property.user_id,
        user_name: property.profiles?.full_name || "Anonyme",
        user_avatar:
          property.profiles?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.user_id}`,
        user_verified: !!property.profiles?.full_name,
        created_at: property.created_at,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqft: property.area_sqft,
        furnished: property.furnished,
        property_type: property.property_type,
        availability: property.availability,
        contact_phone: property.contact_phone || property.profiles?.phone,
      })
    );

    return [...formattedProducts, ...formattedProperties];
  };

  const fetchFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: favorites, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (error) throw error;

      if (favorites) {
        const favoriteSet = new Set(favorites.map((fav) => fav.listing_id));
        setFavoriteIds(favoriteSet);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des favoris:", error);
    }
  };

  const fetchListingDetails = async (item: RecommendedItem) => {
    setLoadingDetails(true);
    try {
      const table = item.type === "product" ? "products" : "properties";

      const { data: listing, error } = await supabase
        .from(table)
        .select(
          `
          *,
          categories!inner (name, type, icon),
          profiles!inner (full_name, avatar_url, email, phone, created_at)
        `
        )
        .eq("id", item.id)
        .single();

      if (error) throw error;

      const { count: favoritesCount } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", item.id);

      const details: ListingDetails = {
        id: listing.id,
        title: listing.title,
        description: listing.description || "",
        price: listing.price,
        location: listing.location,
        images: listing.images || item.images,
        type: item.type,
        category: listing.categories?.name || item.category,
        category_id: listing.category_id || item.category_id,
        created_at: listing.created_at,
        user_id: listing.user_id,
        user_name: listing.profiles?.full_name || item.user_name,
        user_avatar: listing.profiles?.avatar_url || item.user_avatar,
        user_verified: !!listing.profiles?.full_name,
        user_email: listing.profiles?.email,
        user_phone: listing.profiles?.phone || listing.contact_phone,
        user_joined: listing.profiles?.created_at
          ? new Date(listing.profiles.created_at).toLocaleDateString("fr-FR")
          : undefined,
        views: item.views,
        favorites_count: favoritesCount || 0,
        isFavorite: favoriteIds.has(item.id),
      };

      if (item.type === "product") {
        details.stock = listing.stock;
        details.negotiable = listing.negotiable;
        details.condition = listing.condition;
        details.tags = listing.tags || [];
      } else {
        details.bedrooms = listing.bedrooms;
        details.bathrooms = listing.bathrooms;
        details.area_sqft = listing.area_sqft;
        details.furnished = listing.furnished;
        details.property_type = listing.property_type;
        details.availability = listing.availability;
        details.contact_phone =
          listing.contact_phone || listing.profiles?.phone;
      }

      setSelectedItem(details);
      setIsModalOpen(true);
      setCurrentImageIndex(0);
    } catch (error: any) {
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

  const openDetailsModal = (item: RecommendedItem) => {
    fetchListingDetails(item);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  const toggleFavorite = async (
    itemId: string,
    isCurrentlyFavorite: boolean
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const item = recommendedItems.find((i) => i.id === itemId);
      if (!item) return;

      if (isCurrentlyFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", itemId)
          .eq("listing_type", item.type);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: itemId,
          listing_type: item.type,
        });

        if (error) throw error;
      }

      const newFavoriteIds = new Set(favoriteIds);
      if (isCurrentlyFavorite) {
        newFavoriteIds.delete(itemId);
      } else {
        newFavoriteIds.add(itemId);
      }
      setFavoriteIds(newFavoriteIds);

      setRecommendedItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isFavorite: !isCurrentlyFavorite }
            : item
        )
      );

      if (selectedItem && selectedItem.id === itemId) {
        setSelectedItem((prev) =>
          prev
            ? {
                ...prev,
                isFavorite: !isCurrentlyFavorite,
                favorites_count: isCurrentlyFavorite
                  ? Math.max(0, prev.favorites_count - 1)
                  : prev.favorites_count + 1,
              }
            : null
        );
      }

      toast({
        title: isCurrentlyFavorite
          ? "Retiré des favoris"
          : "Ajouté aux favoris",
        description: isCurrentlyFavorite
          ? "L'annonce a été retirée de vos favoris"
          : "L'annonce a été ajoutée à vos favoris",
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris",
        variant: "destructive",
      });
    }
  };

  const handleContactSeller = () => {
    if (selectedItem) {
      setContactMessage(
        `Bonjour ${selectedItem.user_name},\n\nJe suis intéressé par votre annonce "${selectedItem.title}".\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement,`
      );
      setIsContactModalOpen(true);
    }
  };

  // FIXED: Updated to use our send_message function
  const handleSendMessage = async () => {
    if (!selectedItem || !contactMessage.trim()) return;

    setSendingMessage(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Veuillez vous connecter pour envoyer un message",
          variant: "destructive",
        });
        return;
      }

      // Use the send_message function from our database
      const { data, error } = await supabase.rpc("send_message", {
        p_receiver_id: selectedItem.user_id,
        p_content: contactMessage.trim(),
        p_listing_id: selectedItem.id,
        p_listing_type: selectedItem.type,
      });

      if (error) throw error;

      toast({
        title: "Message envoyé !",
        description: "Votre message a été envoyé au vendeur.",
      });

      setContactMessage("");
      setIsContactModalOpen(false);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description:
          error.message ||
          "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const filterItems = () => {
    let filtered = recommendedItems;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower)
      );
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.type === activeTab);
    }

    setFilteredItems(filtered);
  };

  const getCategoryIcon = (categoryName: string, icon: string = "") => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "📱": <Smartphone className="h-4 w-4" />,
      "🚗": <Car className="h-4 w-4" />,
      "👕": <Shirt className="h-4 w-4" />,
      "🏠": <Home className="h-4 w-4" />,
      "🛠️": <Briefcase className="h-4 w-4" />,
      "🏢": <Building className="h-4 w-4" />,
      "📦": <Truck className="h-4 w-4" />,
      "🎮": <Gamepad2 className="h-4 w-4" />,
      "🎵": <Music className="h-4 w-4" />,
      "📚": <Book className="h-4 w-4" />,
      "🍽️": <Utensils className="h-4 w-4" />,
    };

    if (icon && iconMap[icon]) {
      return iconMap[icon];
    }

    const lowerCategory = categoryName.toLowerCase();
    if (
      lowerCategory.includes("électronique") ||
      lowerCategory.includes("electronique")
    ) {
      return <Smartphone className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("véhicule") ||
      lowerCategory.includes("vehicule")
    ) {
      return <Car className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("mode") ||
      lowerCategory.includes("vêtement")
    ) {
      return <Shirt className="h-4 w-4" />;
    } else if (lowerCategory.includes("maison")) {
      return <Home className="h-4 w-4" />;
    } else if (lowerCategory.includes("immobilier")) {
      return <Building className="h-4 w-4" />;
    }

    return <Package className="h-4 w-4" />;
  };

  const refreshRecommendations = async () => {
    setLoading(true);
    await fetchUserInterestsAndRecommendations();
    await fetchFavorites();
    toast({
      title: "Recommandations mises à jour",
      description: "Vos suggestions ont été actualisées",
    });
  };

  const updateRelevanceThreshold = (value: number) => {
    setRelevanceThreshold(value);
    toast({
      title: "Filtre mis à jour",
      description: `Affichage des annonces avec intérêt ≥ ${value}/5`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
  };

  const getPriceWithCurrency = (price: number) => {
    return `${formatPrice(price)} €`;
  };

  // FIXED: Simplified back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              Analyse de vos centres d'intérêt...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Préparation de vos recommandations personnalisées
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header mobile fixe - FIXED: Consistent back navigation */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Recommandations
              </h1>
              <p className="text-xs text-gray-600">
                {recommendedItems.length} suggestions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={refreshRecommendations}
              disabled={loading}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewMode("grid")}>
                  <Grid className="h-4 w-4 mr-2" />
                  Vue grille
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4 mr-2" />
                  Vue liste
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowMobileFilters(true)}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Barre de recherche mobile */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 lg:bg-gradient-to-br lg:from-gray-50 lg:to-gray-100">
        <div className="px-4 py-6 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
          {/* Header desktop - FIXED: Back navigation */}
          <div className="hidden lg:block mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="flex-1">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mb-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour
                </Button>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Suggestions personnalisées
                </h1>
                <p className="text-gray-600 mt-2">
                  Des annonces sélectionnées selon vos centres d'intérêt
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={refreshRecommendations}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Barre de recherche desktop */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Rechercher parmi vos recommandations..."
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    className="h-12"
                    onClick={() => {
                      if (activeTab === "all") setActiveTab("product");
                      else if (activeTab === "product")
                        setActiveTab("property");
                      else setActiveTab("all");
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {activeTab === "all"
                      ? "Tout"
                      : activeTab === "product"
                      ? "Produits"
                      : "Propriétés"}
                  </Button>
                </div>
              </div>

              {userInterests.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">
                        Vos centres d'intérêt
                      </span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {userInterests.length} catégorie
                        {userInterests.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {userInterests
                      .sort((a, b) => b.interest_level - a.interest_level)
                      .map((interest) => (
                        <Badge
                          key={interest.id}
                          className="cursor-pointer transition-all hover:scale-105"
                          variant={
                            interest.interest_level >= relevanceThreshold
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSearchTerm(interest.category_name)}
                        >
                          <span className="mr-1">{interest.category_icon}</span>
                          {interest.category_name}
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-white/20"
                          >
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {interest.interest_level}
                          </Badge>
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message si pas d'intérêts */}
          {userInterests.length === 0 && !loadingInterests && (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <Target className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun centre d'intérêt configuré
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Pour recevoir des recommandations personnalisées, veuillez
                    ajouter vos centres d'intérêt dans votre profil.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Link to="/complete-profile">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Ajouter des centres d'intérêt
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/products">
                        <Package className="h-4 w-4 mr-2" />
                        Voir toutes les annonces
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistiques des catégories (mobile réduit) */}
          {categoryStats.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600" />
                  Statistiques
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {categoryStats.slice(0, 4).map((stat) => (
                    <div
                      key={stat.category_id}
                      className="bg-white p-3 lg:p-4 rounded-lg border text-center"
                    >
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-lg mr-2">{stat.icon}</span>
                        <span className="font-medium text-gray-900 text-sm lg:text-base line-clamp-1">
                          {stat.category_name}
                        </span>
                      </div>
                      <div className="text-xs lg:text-sm text-gray-600 mb-1">
                        {stat.count} annonces
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        Moy: {formatPrice(stat.avg_price)}€
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Onglets mobile */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-1 overflow-x-auto pb-2 flex-nowrap">
                <Button
                  size="sm"
                  variant={activeTab === "all" ? "default" : "outline"}
                  onClick={() => setActiveTab("all")}
                  className="whitespace-nowrap"
                >
                  Tous ({recommendedItems.length})
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "product" ? "default" : "outline"}
                  onClick={() => setActiveTab("product")}
                  className="whitespace-nowrap"
                >
                  Produits (
                  {recommendedItems.filter((i) => i.type === "product").length})
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "property" ? "default" : "outline"}
                  onClick={() => setActiveTab("property")}
                  className="whitespace-nowrap"
                >
                  Biens (
                  {recommendedItems.filter((i) => i.type === "property").length}
                  )
                </Button>
              </div>
            </div>
          </div>

          {/* Onglets desktop */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-8 hidden lg:block"
          >
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
              <TabsTrigger value="all" className="rounded-lg px-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Toutes les suggestions ({recommendedItems.length})
              </TabsTrigger>
              <TabsTrigger value="product" className="rounded-lg px-6">
                <Package className="h-4 w-4 mr-2" />
                Produits (
                {recommendedItems.filter((i) => i.type === "product").length})
              </TabsTrigger>
              <TabsTrigger value="property" className="rounded-lg px-6">
                <Home className="h-4 w-4 mr-2" />
                Propriétés (
                {recommendedItems.filter((i) => i.type === "property").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Contenu principal */}
          {userInterests.length > 0 && (
            <>
              {filteredItems.length > 0 ? (
                <>
                  <div className="hidden lg:flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Trier par pertinence selon vos centres d'intérêt
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-gray-100" : ""}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-gray-100" : ""}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Vue mobile */}
                  <div className="lg:hidden">
                    <div className="space-y-3">
                      {filteredItems.map((item) => {
                        const matchingInterest = userInterests.find(
                          (interest) =>
                            interest.category_id === item.category_id
                        );

                        return (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden active:scale-[0.99] transition-transform"
                            onClick={() => openDetailsModal(item)}
                          >
                            {/* Image principale */}
                            <div className="relative h-48 overflow-hidden">
                              {item.images && item.images.length > 0 ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <Package className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <Badge
                                  className={
                                    item.type === "product"
                                      ? "bg-blue-500"
                                      : "bg-emerald-500"
                                  }
                                >
                                  {item.type === "product"
                                    ? "Produit"
                                    : "Propriété"}
                                </Badge>
                              </div>
                              {matchingInterest && (
                                <div className="absolute top-2 right-2">
                                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-xs">
                                    <Star className="h-2 w-2 mr-1 fill-current" />
                                    {matchingInterest.interest_level}/5
                                  </Badge>
                                </div>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="absolute bottom-2 right-2 bg-white/90 hover:bg-white h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id, item.isFavorite);
                                }}
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    item.isFavorite
                                      ? "fill-red-500 text-red-500"
                                      : "text-gray-500"
                                  }`}
                                />
                              </Button>
                            </div>

                            {/* Contenu */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="flex items-center mb-2">
                                <div className="flex items-center text-sm font-bold text-gray-900">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {getPriceWithCurrency(item.price)}
                                </div>
                                <div className="ml-auto flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.postedAt}
                                </div>
                              </div>

                              <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                                {item.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-gray-200">
                                    <img
                                      src={item.user_avatar}
                                      alt={item.user_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium text-gray-900">
                                      {item.user_name}
                                    </div>
                                    <div className="flex items-center text-[10px] text-gray-500">
                                      <MapPin className="h-2.5 w-2.5 mr-1" />
                                      {item.location}
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vue desktop */}
                  <div className="hidden lg:block">
                    <div
                      className={`gap-6 ${
                        viewMode === "grid"
                          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                          : "space-y-4"
                      }`}
                    >
                      {filteredItems.map((item) => {
                        const matchingInterest = userInterests.find(
                          (interest) =>
                            interest.category_id === item.category_id
                        );

                        return (
                          <Card
                            key={item.id}
                            className={`group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 cursor-pointer ${
                              viewMode === "list"
                                ? "flex items-start space-x-4"
                                : ""
                            }`}
                            onClick={() => openDetailsModal(item)}
                          >
                            {viewMode === "list" ? (
                              <>
                                <div className="relative w-40 h-40 flex-shrink-0">
                                  {item.images && item.images.length > 0 ? (
                                    <img
                                      src={item.images[0]}
                                      alt={item.title}
                                      className="w-full h-full object-cover rounded-l-lg"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-l-lg">
                                      <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <h3 className="font-bold text-xl text-gray-900 mb-2">
                                        {item.title}
                                      </h3>
                                      <p className="text-gray-600 line-clamp-2 mb-4">
                                        {item.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <div className="text-2xl font-bold text-gray-900">
                                        {getPriceWithCurrency(item.price)}
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(
                                            item.id,
                                            item.isFavorite
                                          );
                                        }}
                                      >
                                        <Heart
                                          className={`h-5 w-5 ${
                                            item.isFavorite
                                              ? "fill-red-500 text-red-500"
                                              : "text-gray-500"
                                          }`}
                                        />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                          <img
                                            src={item.user_avatar}
                                            alt={item.user_name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div>
                                          <div className="font-medium text-gray-900">
                                            {item.user_name}
                                          </div>
                                          <div className="flex items-center text-sm text-gray-500">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {item.location}
                                          </div>
                                        </div>
                                      </div>
                                      <Badge variant="outline">
                                        {item.category}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {item.postedAt}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="relative h-56 overflow-hidden rounded-t-lg">
                                  {item.images && item.images.length > 0 ? (
                                    <img
                                      src={item.images[0]}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <Package className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="absolute top-4 right-4">
                                    <Badge
                                      className={
                                        item.type === "product"
                                          ? "bg-blue-500"
                                          : "bg-emerald-500"
                                      }
                                    >
                                      {item.type === "product"
                                        ? "Produit"
                                        : "Propriété"}
                                    </Badge>
                                  </div>
                                  {matchingInterest && (
                                    <div className="absolute top-4 left-4">
                                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
                                        <Star className="h-3 w-3 mr-1 fill-current" />
                                        {matchingInterest.interest_level}/5
                                      </Badge>
                                    </div>
                                  )}
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute bottom-4 right-4 bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(item.id, item.isFavorite);
                                    }}
                                  >
                                    <Heart
                                      className={`h-5 w-5 ${
                                        item.isFavorite
                                          ? "fill-red-500 text-red-500"
                                          : "text-gray-500"
                                      }`}
                                    />
                                  </Button>
                                </div>

                                <CardContent className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-gray-100 rounded-lg">
                                        {getCategoryIcon(
                                          item.category,
                                          matchingInterest?.category_icon
                                        )}
                                      </div>
                                      <div>
                                        <h3 className="font-bold text-gray-900 line-clamp-1">
                                          {item.title}
                                        </h3>
                                        <div className="flex items-center mt-1">
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {item.category}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-gray-600 line-clamp-2 mb-4">
                                    {item.description}
                                  </p>

                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center text-lg font-bold text-gray-900">
                                      <DollarSign className="h-5 w-5 mr-1" />
                                      {getPriceWithCurrency(item.price)}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {item.postedAt}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-gray-200">
                                        <img
                                          src={item.user_avatar}
                                          alt={item.user_name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                          {item.user_name}
                                          {item.user_verified && (
                                            <CheckCircle className="h-3 w-3 ml-2 text-green-500" />
                                          )}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          {item.location}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucune recommandation trouvée
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? `Aucune annonce ne correspond à "${searchTerm}"`
                      : "Aucune annonce ne correspond actuellement"}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </div>
              )}

              {/* Modal des détails (mobile friendly) */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:p-6">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    selectedItem && (
                      <>
                        {/* Header mobile - FIXED: Consistent back */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:hidden">
                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={closeModal}
                              className="h-8 w-8"
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-center flex-1">
                              <h2 className="font-semibold text-gray-900 text-sm truncate">
                                {selectedItem.title}
                              </h2>
                              <p className="text-xs text-gray-600 truncate">
                                {selectedItem.location}
                              </p>
                            </div>
                            <div className="w-8" />
                          </div>
                        </div>

                        <div className="p-4 sm:p-0">
                          <div className="hidden sm:block">
                            <DialogHeader className="p-6 pb-0">
                              <div className="flex items-center justify-between">
                                <DialogTitle className="text-xl sm:text-2xl font-bold">
                                  {selectedItem.title}
                                </DialogTitle>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={closeModal}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <DialogDescription className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge
                                  className={
                                    selectedItem.type === "product"
                                      ? "bg-blue-500"
                                      : "bg-emerald-500"
                                  }
                                >
                                  {selectedItem.type === "product"
                                    ? "Produit"
                                    : "Propriété"}
                                </Badge>
                                <span className="flex items-center text-gray-600 text-sm">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {selectedItem.location}
                                </span>
                                <span className="flex items-center text-gray-600 text-sm">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(
                                    selectedItem.created_at
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </DialogDescription>
                            </DialogHeader>
                          </div>

                          <ScrollArea className="h-[calc(90vh-140px)] sm:h-[calc(90vh-200px)] px-4 sm:px-6 py-4">
                            {/* Galerie d'images mobile */}
                            <div className="mb-6">
                              {selectedItem.images.length > 0 ? (
                                <Carousel className="w-full">
                                  <CarouselContent>
                                    {selectedItem.images.map((img, index) => (
                                      <CarouselItem key={index}>
                                        <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden">
                                          <img
                                            src={img}
                                            alt={`${selectedItem.title} - ${
                                              index + 1
                                            }`}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                            {index + 1}/
                                            {selectedItem.images.length}
                                          </div>
                                        </div>
                                      </CarouselItem>
                                    ))}
                                  </CarouselContent>
                                  {selectedItem.images.length > 1 && (
                                    <>
                                      <CarouselPrevious className="left-2 h-8 w-8" />
                                      <CarouselNext className="right-2 h-8 w-8" />
                                    </>
                                  )}
                                </Carousel>
                              ) : (
                                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                  <Package className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Informations principales */}
                              <div className="lg:col-span-2 space-y-6">
                                {/* Description */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Description
                                  </h3>
                                  <p className="text-gray-700 whitespace-pre-line">
                                    {selectedItem.description ||
                                      "Aucune description disponible."}
                                  </p>
                                </div>

                                {/* Caractéristiques */}
                                <div>
                                  <h3 className="text-lg font-semibold mb-3">
                                    Caractéristiques
                                  </h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Prix</span>
                                      </div>
                                      <div className="text-xl font-bold text-gray-900">
                                        {getPriceWithCurrency(
                                          selectedItem.price
                                        )}
                                      </div>
                                    </div>

                                    {selectedItem.type === "product" ? (
                                      <>
                                        {selectedItem.stock !== undefined && (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-gray-600 mb-1">
                                              <Package className="h-4 w-4 mr-2" />
                                              <span className="text-sm">
                                                Stock
                                              </span>
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">
                                              {selectedItem.stock}
                                            </div>
                                          </div>
                                        )}
                                        {selectedItem.condition && (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-gray-600 mb-1">
                                              <Tag className="h-4 w-4 mr-2" />
                                              <span className="text-sm">
                                                État
                                              </span>
                                            </div>
                                            <div className="text-lg font-semibold text-gray-900 capitalize">
                                              {selectedItem.condition}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        {selectedItem.bedrooms && (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-gray-600 mb-1">
                                              <Bed className="h-4 w-4 mr-2" />
                                              <span className="text-sm">
                                                Chambres
                                              </span>
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">
                                              {selectedItem.bedrooms}
                                            </div>
                                          </div>
                                        )}
                                        {selectedItem.bathrooms && (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-gray-600 mb-1">
                                              <Bath className="h-4 w-4 mr-2" />
                                              <span className="text-sm">
                                                Salles de bain
                                              </span>
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">
                                              {selectedItem.bathrooms}
                                            </div>
                                          </div>
                                        )}
                                        {selectedItem.area_sqft && (
                                          <div className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center text-gray-600 mb-1">
                                              <Square className="h-4 w-4 mr-2" />
                                              <span className="text-sm">
                                                Surface
                                              </span>
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">
                                              {selectedItem.area_sqft} m²
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}

                                    {/* Localisation */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Lieu</span>
                                      </div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {selectedItem.location}
                                      </div>
                                    </div>

                                    {/* Disponibilité */}
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        <span className="text-sm">
                                          Disponibilité
                                        </span>
                                      </div>
                                      <div
                                        className={`text-sm font-semibold ${
                                          selectedItem.type === "product"
                                            ? (selectedItem.stock || 0) > 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                            : selectedItem.availability ===
                                              "available"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {selectedItem.type === "product"
                                          ? (selectedItem.stock || 0) > 0
                                            ? "En stock"
                                            : "Rupture"
                                          : selectedItem.availability ===
                                            "available"
                                          ? "Disponible"
                                          : "Indisponible"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Sidebar - Vendeur et actions */}
                              <div className="space-y-6">
                                {/* Vendeur */}
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="flex items-center space-x-3 mb-4">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage
                                          src={selectedItem.user_avatar}
                                        />
                                        <AvatarFallback>
                                          {selectedItem.user_name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-semibold text-sm flex items-center">
                                          {selectedItem.user_name}
                                          {selectedItem.user_verified && (
                                            <CheckCircle className="h-3 w-3 ml-2 text-green-500" />
                                          )}
                                        </div>
                                        {selectedItem.user_joined && (
                                          <p className="text-xs text-gray-500">
                                            Membre depuis{" "}
                                            {selectedItem.user_joined}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2 pt-4">
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Eye className="h-3 w-3 mr-2" />
                                        {selectedItem.views} vues
                                      </div>
                                      <div className="flex items-center text-xs text-gray-600">
                                        <Heart className="h-3 w-3 mr-2" />
                                        {selectedItem.favorites_count} favoris
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                {/* Actions */}
                                <Card>
                                  <CardContent className="p-4">
                                    <div className="space-y-4">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                          {getPriceWithCurrency(
                                            selectedItem.price
                                          )}
                                        </div>
                                        {selectedItem.type === "property" && (
                                          <p className="text-sm text-gray-600">
                                            par mois
                                          </p>
                                        )}
                                      </div>

                                      <div className="space-y-3">
                                        <Button
                                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                          size="sm"
                                          onClick={handleContactSeller}
                                        >
                                          <MessageSquare className="h-4 w-4 mr-2" />
                                          Contacter
                                        </Button>

                                        <Button
                                          variant={
                                            selectedItem.isFavorite
                                              ? "default"
                                              : "outline"
                                          }
                                          className="w-full"
                                          size="sm"
                                          onClick={() =>
                                            toggleFavorite(
                                              selectedItem.id,
                                              selectedItem.isFavorite
                                            )
                                          }
                                        >
                                          <Heart
                                            className={`h-4 w-4 mr-2 ${
                                              selectedItem.isFavorite
                                                ? "fill-current"
                                                : ""
                                            }`}
                                          />
                                          {selectedItem.isFavorite
                                            ? "Retirer"
                                            : "Favoris"}
                                        </Button>

                                        {selectedItem.user_phone && (
                                          <Button
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                            asChild
                                          >
                                            <a
                                              href={`tel:${selectedItem.user_phone}`}
                                            >
                                              <Phone className="h-4 w-4 mr-2" />
                                              Appeler
                                            </a>
                                          </Button>
                                        )}
                                      </div>

                                      <div className="pt-3 border-t">
                                        <div className="flex items-center text-xs text-gray-600">
                                          <Shield className="h-3 w-3 mr-2 text-green-500" />
                                          <span>
                                            Sécurité garantie sur SolidUnion
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    )
                  )}
                </DialogContent>
              </Dialog>

              {/* Modal de contact */}
              <Dialog
                open={isContactModalOpen}
                onOpenChange={setIsContactModalOpen}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contacter {selectedItem?.user_name}
                    </DialogTitle>
                    <DialogDescription>
                      Envoyez un message à propos de "{selectedItem?.title}"
                    </DialogDescription>
                  </DialogHeader>

                  {selectedItem && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedItem.user_avatar} />
                          <AvatarFallback>
                            {selectedItem.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {selectedItem.user_name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {selectedItem.title}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {selectedItem.user_phone && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm">Téléphone</span>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`tel:${selectedItem.user_phone}`}>
                                {selectedItem.user_phone}
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="contact-message" className="text-sm">
                            Votre message
                          </Label>
                          <Textarea
                            id="contact-message"
                            placeholder="Bonjour, je suis intéressé par votre annonce..."
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            rows={4}
                            className="resize-none text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            Évitez de partager vos informations personnelles
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsContactModalOpen(false)}
                      disabled={sendingMessage}
                      className="w-full sm:w-auto"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !contactMessage.trim()}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      {sendingMessage ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations;
