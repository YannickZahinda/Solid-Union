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
  Image,
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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// Interface pour les détails complets
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

      const { data: interests, error: interestsError } = await supabase
        .from("user_interests")
        .select(
          `
          id,
          category_id,
          interest_level,
          categories (
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
          categories (name, type, icon),
          profiles (full_name, avatar_url, phone)
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
          categories (name, type, icon),
          profiles (full_name, avatar_url, phone)
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
          categories (name, type, icon),
          profiles (full_name, avatar_url, phone)
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
          categories (name, type, icon),
          profiles (full_name, avatar_url, phone)
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
        images: product.images || [],
        type: "product" as const,
        category: product.categories?.name || "Produit",
        category_id: product.category_id,
        postedAt: new Date(product.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        views: Math.floor(Math.random() * 100),
        isFavorite: favoriteIds.has(product.id),
        user_id: product.user_id,
        user_name: product.profiles?.full_name || "Anonyme",
        user_avatar:
          product.profiles?.avatar_url || getDefaultAvatar(product.user_id),
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
        images: property.images || [],
        type: "property" as const,
        category: property.categories?.name || "Propriété",
        category_id: property.category_id,
        postedAt: new Date(property.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        views: Math.floor(Math.random() * 100),
        isFavorite: favoriteIds.has(property.id),
        user_id: property.user_id,
        user_name: property.profiles?.full_name || "Anonyme",
        user_avatar:
          property.profiles?.avatar_url || getDefaultAvatar(property.user_id),
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

  const getDefaultAvatar = (userId: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;
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

  // Fonction pour charger les détails complets d'une annonce
  const fetchListingDetails = async (item: RecommendedItem) => {
    setLoadingDetails(true);
    try {
      const table = item.type === "product" ? "products" : "properties";

      // Récupérer les détails complets
      const { data: listing, error } = await supabase
        .from(table)
        .select(
          `
          *,
          categories (name, type, icon),
          profiles (full_name, avatar_url, email, phone, created_at)
        `
        )
        .eq("id", item.id)
        .single();

      if (error) throw error;

      // Récupérer le nombre de favoris
      const { count: favoritesCount } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", item.id);

      // Formater les détails
      const details: ListingDetails = {
        id: listing.id,
        title: listing.title,
        description: listing.description || "",
        price: listing.price,
        location: listing.location,
        images: listing.images || [],
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

      // Ajouter les détails spécifiques
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

  // Fonction pour ouvrir le modal avec les détails
  const openDetailsModal = (item: RecommendedItem) => {
    fetchListingDetails(item);
  };

  // Fonction pour fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setCurrentImageIndex(0);
  };

  // Navigation des images
  const nextImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedItem && selectedItem.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  // Toggle favori
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

      // Mettre à jour les états
      const newFavoriteIds = new Set(favoriteIds);
      if (isCurrentlyFavorite) {
        newFavoriteIds.delete(itemId);
      } else {
        newFavoriteIds.add(itemId);
      }
      setFavoriteIds(newFavoriteIds);

      // Mettre à jour dans la liste
      setRecommendedItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, isFavorite: !isCurrentlyFavorite }
            : item
        )
      );

      // Mettre à jour dans le modal si ouvert
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
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour des favoris:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les favoris",
        variant: "destructive",
      });
    }
  };

  // Contacter le vendeur
  const handleContactSeller = () => {
    if (selectedItem) {
      setIsContactModalOpen(true);
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
      "🏖️": <Building className="h-4 w-4" />,
      "📦": <Truck className="h-4 w-4" />,
      "🚜": <Truck className="h-4 w-4" />,
      "💄": <Palette className="h-4 w-4" />,
      "⚽": <Dumbbell className="h-4 w-4" />,
      "💼": <Briefcase className="h-4 w-4" />,
      "🎉": <Music className="h-4 w-4" />,
      "🌱": <Home className="h-4 w-4" />,
      "🏪": <Building className="h-4 w-4" />,
      "🎮": <Gamepad2 className="h-4 w-4" />,
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
      lowerCategory.includes("vehicule") ||
      lowerCategory.includes("voiture") ||
      lowerCategory.includes("auto")
    ) {
      return <Car className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("mode") ||
      lowerCategory.includes("vêtement") ||
      lowerCategory.includes("vetement")
    ) {
      return <Shirt className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("maison") ||
      lowerCategory.includes("appartement") ||
      lowerCategory.includes("logement")
    ) {
      return <Home className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("service") ||
      lowerCategory.includes("travail") ||
      lowerCategory.includes("emploi")
    ) {
      return <Briefcase className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("immobilier") ||
      lowerCategory.includes("propriété") ||
      lowerCategory.includes("propriete")
    ) {
      return <Building className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("sport") ||
      lowerCategory.includes("fitness")
    ) {
      return <Dumbbell className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("musique") ||
      lowerCategory.includes("divertissement")
    ) {
      return <Music className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("jeu") ||
      lowerCategory.includes("gaming")
    ) {
      return <Gamepad2 className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("livre") ||
      lowerCategory.includes("éducation") ||
      lowerCategory.includes("education")
    ) {
      return <Book className="h-4 w-4" />;
    } else if (
      lowerCategory.includes("restaurant") ||
      lowerCategory.includes("nourriture") ||
      lowerCategory.includes("food")
    ) {
      return <Utensils className="h-4 w-4" />;
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

  // Formatage du prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
              <div className="flex-1">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Retour au tableau de bord
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Suggestions personnalisées
                </h1>
                <p className="text-gray-600 mt-2">
                  Des annonces sélectionnées spécialement selon vos centres
                  d'intérêt
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

            {/* Barre de recherche et filtres */}
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

              {/* Centres d'intérêt de l'utilisateur */}
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

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Intérêt minimum:
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <Button
                            key={level}
                            size="sm"
                            variant={
                              relevanceThreshold === level
                                ? "default"
                                : "outline"
                            }
                            className="h-8 w-8 p-0"
                            onClick={() => updateRelevanceThreshold(level)}
                          >
                            {level}
                          </Button>
                        ))}
                      </div>
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
                          style={{
                            background:
                              interest.interest_level >= relevanceThreshold
                                ? `linear-gradient(135deg, rgb(59 130 246) ${
                                    interest.interest_level * 20
                                  }%, rgb(99 102 241) 100%)`
                                : undefined,
                          }}
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

          {/* Statistiques des catégories */}
          {categoryStats.length > 0 && (
            <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Statistiques par catégorie
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryStats.map((stat) => {
                    const matchingInterest = userInterests.find(
                      (interest) => interest.category_id === stat.category_id
                    );

                    return (
                      <div
                        key={stat.category_id}
                        className="bg-white p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{stat.icon}</span>
                            <span className="font-medium text-gray-900">
                              {stat.category_name}
                            </span>
                          </div>
                          {matchingInterest && (
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < matchingInterest.interest_level
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {stat.count} annonces disponibles
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          Prix moyen: {stat.avg_price.toLocaleString()} €
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenu principal */}
          {userInterests.length > 0 && (
            <>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-8"
              >
                <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
                  <TabsTrigger
                    value="all"
                    className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Toutes les suggestions ({recommendedItems.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="product"
                    className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Produits (
                    {
                      recommendedItems.filter((i) => i.type === "product")
                        .length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger
                    value="property"
                    className="rounded-lg px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Propriétés (
                    {
                      recommendedItems.filter((i) => i.type === "property")
                        .length
                    }
                    )
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                  {filteredItems.length > 0 ? (
                    <>
                      <div className="mb-4 text-sm text-gray-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Les annonces sont triées par pertinence selon vos
                        centres d'intérêt
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => {
                          const matchingInterest = userInterests.find(
                            (interest) =>
                              interest.category_id === item.category_id
                          );

                          return (
                            <Card
                              key={item.id}
                              className="group hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 cursor-pointer"
                              onClick={() => openDetailsModal(item)}
                            >
                              {/* Indicateur de pertinence */}
                              {matchingInterest && (
                                <div className="absolute top-2 left-2 z-10">
                                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">
                                    <Star className="h-3 w-3 mr-1 fill-current" />
                                    {matchingInterest.interest_level}/5
                                  </Badge>
                                </div>
                              )}

                              <div className="relative h-56 overflow-hidden rounded-t-lg">
                                {item.images && item.images.length > 0 ? (
                                  <img
                                    src={item.images[0]}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = `https://via.placeholder.com/400x300?text=${
                                        item.type === "product"
                                          ? "Produit"
                                          : "Propriété"
                                      }`;
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <Package className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                                    {formatPrice(item.price)}
                                    <span className="text-sm font-normal text-gray-500 ml-1">
                                      {item.type === "property" ? "/mois" : ""}
                                    </span>
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
                                          <Badge
                                            variant="outline"
                                            className="ml-2 text-xs border-green-200 text-green-700"
                                          >
                                            ✓ Vérifié
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center text-xs text-gray-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {item.location}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetailsModal(item);
                                    }}
                                  >
                                    Voir détails
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
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
                          ? `Aucune annonce ne correspond à "${searchTerm}" dans vos centres d'intérêt`
                          : "Aucune annonce ne correspond actuellement à vos centres d'intérêt"}
                      </p>
                      {searchTerm && (
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm("")}
                        >
                          Effacer la recherche
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Modal des détails */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
                  {loadingDetails ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    selectedItem && (
                      <>
                        <DialogHeader className="p-6 pb-0">
                          <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-bold">
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
                          <DialogDescription className="flex items-center space-x-4 mt-2">
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
                            <span className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {selectedItem.location}
                            </span>
                            <span className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-1" />
                              Publié le{" "}
                              {new Date(
                                selectedItem.created_at
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="h-[calc(90vh-200px)] p-6">
                          {/* Galerie d'images */}
                          <div className="mb-8">
                            <div className="relative h-96 w-full rounded-xl overflow-hidden mb-4">
                              {selectedItem.images.length > 0 ? (
                                <>
                                  <img
                                    src={selectedItem.images[currentImageIndex]}
                                    alt={selectedItem.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = `https://via.placeholder.com/800x600?text=${
                                        selectedItem.type === "product"
                                          ? "Produit"
                                          : "Propriété"
                                      }`;
                                    }}
                                  />
                                  {selectedItem.images.length > 1 && (
                                    <>
                                      <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                                        onClick={prevImage}
                                      >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                                        onClick={nextImage}
                                      >
                                        <ChevronRight className="h-4 w-4" />
                                      </Button>
                                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                        {selectedItem.images.map((_, index) => (
                                          <button
                                            key={index}
                                            className={`w-2 h-2 rounded-full ${
                                              index === currentImageIndex
                                                ? "bg-white"
                                                : "bg-white/50"
                                            }`}
                                            onClick={() =>
                                              setCurrentImageIndex(index)
                                            }
                                          />
                                        ))}
                                      </div>
                                    </>
                                  )}
                                  <div className="absolute top-4 right-4">
                                    <Badge className="bg-black/70 text-white">
                                      {currentImageIndex + 1} /{" "}
                                      {selectedItem.images.length}
                                    </Badge>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  <Package className="h-20 w-20 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Miniatures */}
                            {selectedItem.images.length > 1 && (
                              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                                {selectedItem.images
                                  .slice(0, 6)
                                  .map((img, index) => (
                                    <button
                                      key={index}
                                      className={`relative h-20 rounded-lg overflow-hidden ${
                                        index === currentImageIndex
                                          ? "ring-2 ring-blue-500"
                                          : "opacity-70 hover:opacity-100"
                                      }`}
                                      onClick={() =>
                                        setCurrentImageIndex(index)
                                      }
                                    >
                                      <img
                                        src={img}
                                        alt={`${selectedItem.title} ${
                                          index + 1
                                        }`}
                                        className="w-full h-full object-cover"
                                      />
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Informations principales */}
                            <div className="lg:col-span-2 space-y-8">
                              {/* Description */}
                              <div>
                                <h3 className="text-xl font-semibold mb-4">
                                  Description
                                </h3>
                                <p className="text-gray-700 whitespace-pre-line">
                                  {selectedItem.description ||
                                    "Aucune description disponible."}
                                </p>
                              </div>

                              {/* Caractéristiques détaillées */}
                              <div>
                                <h3 className="text-xl font-semibold mb-4">
                                  Caractéristiques
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      <span className="text-sm">Prix</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">
                                      {formatPrice(selectedItem.price)} €
                                      {selectedItem.type === "property" && (
                                        <span className="text-sm font-normal text-gray-600 ml-1">
                                          /mois
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {selectedItem.type === "product" ? (
                                    <>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-600 mb-1">
                                          <Package className="h-4 w-4 mr-2" />
                                          <span className="text-sm">Stock</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">
                                          {selectedItem.stock || 0}
                                        </div>
                                      </div>
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-600 mb-1">
                                          <Tag className="h-4 w-4 mr-2" />
                                          <span className="text-sm">
                                            Condition
                                          </span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900 capitalize">
                                          {selectedItem.condition ||
                                            "Non spécifiée"}
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      {selectedItem.bedrooms && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="flex items-center text-gray-600 mb-1">
                                            <Bed className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                              Chambres
                                            </span>
                                          </div>
                                          <div className="text-2xl font-bold text-gray-900">
                                            {selectedItem.bedrooms}
                                          </div>
                                        </div>
                                      )}
                                      {selectedItem.bathrooms && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="flex items-center text-gray-600 mb-1">
                                            <Bath className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                              Salles de bain
                                            </span>
                                          </div>
                                          <div className="text-2xl font-bold text-gray-900">
                                            {selectedItem.bathrooms}
                                          </div>
                                        </div>
                                      )}
                                      {selectedItem.area_sqft && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                          <div className="flex items-center text-gray-600 mb-1">
                                            <Square className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                              Surface
                                            </span>
                                          </div>
                                          <div className="text-2xl font-bold text-gray-900">
                                            {selectedItem.area_sqft} m²
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  {/* Disponibilité */}
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center text-gray-600 mb-1">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      <span className="text-sm">
                                        Disponibilité
                                      </span>
                                    </div>
                                    <div
                                      className={`text-lg font-semibold ${
                                        selectedItem.type === "property" &&
                                        selectedItem.availability ===
                                          "available"
                                          ? "text-green-600"
                                          : "text-gray-900"
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

                                  {/* Négociable */}
                                  {selectedItem.negotiable && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                      <div className="flex items-center text-gray-600 mb-1">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        <span className="text-sm">Prix</span>
                                      </div>
                                      <div className="text-lg font-semibold text-amber-600">
                                        Négociable
                                      </div>
                                    </div>
                                  )}

                                  {/* Meublé (pour propriétés) */}
                                  {selectedItem.type === "property" &&
                                    selectedItem.furnished && (
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center text-gray-600 mb-1">
                                          <Layers className="h-4 w-4 mr-2" />
                                          <span className="text-sm">
                                            Meublé
                                          </span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                          Oui
                                        </div>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* Tags */}
                              {selectedItem.tags &&
                                selectedItem.tags.length > 0 && (
                                  <div>
                                    <h3 className="text-xl font-semibold mb-4">
                                      Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedItem.tags.map((tag, index) => (
                                        <Badge key={index} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>

                            {/* Sidebar - Informations vendeur et actions */}
                            <div className="space-y-6">
                              {/* Informations vendeur */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">
                                    Vendeur
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="flex items-center space-x-3">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage
                                        src={selectedItem.user_avatar}
                                      />
                                      <AvatarFallback>
                                        {selectedItem.user_name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-semibold flex items-center">
                                        {selectedItem.user_name}
                                        {selectedItem.user_verified && (
                                          <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
                                        )}
                                      </div>
                                      {selectedItem.user_joined && (
                                        <p className="text-sm text-gray-500">
                                          Membre depuis{" "}
                                          {selectedItem.user_joined}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Eye className="h-4 w-4 mr-2" />
                                      {selectedItem.views} vues
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Heart className="h-4 w-4 mr-2" />
                                      {selectedItem.favorites_count} favoris
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Actions */}
                              <Card>
                                <CardContent className="p-6">
                                  <div className="space-y-4">
                                    <div className="text-center">
                                      <div className="text-3xl font-bold text-gray-900 mb-2">
                                        {formatPrice(selectedItem.price)} €
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
                                        size="lg"
                                        onClick={handleContactSeller}
                                      >
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Contacter le vendeur
                                      </Button>

                                      <Button
                                        variant={
                                          selectedItem.isFavorite
                                            ? "default"
                                            : "outline"
                                        }
                                        className="w-full"
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
                                          ? "Retirer des favoris"
                                          : "Ajouter aux favoris"}
                                      </Button>

                                      <Button
                                        variant="ghost"
                                        className="w-full"
                                      >
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Partager
                                      </Button>
                                    </div>

                                    {/* Indicateur de sécurité */}
                                    <div className="pt-4 border-t">
                                      <div className="flex items-center text-sm text-gray-600">
                                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                                        <span>
                                          Achetez en toute sécurité sur
                                          SolidUnion
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </ScrollArea>
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contacter le vendeur</DialogTitle>
                    <DialogDescription>
                      Envoyez un message à {selectedItem?.user_name}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedItem && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <Avatar>
                          <AvatarImage src={selectedItem.user_avatar} />
                          <AvatarFallback>
                            {selectedItem.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">
                            {selectedItem.user_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedItem.title}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedItem.user_phone && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm">Téléphone</span>
                            </div>
                            <Button variant="outline" size="sm">
                              <a href={`tel:${selectedItem.user_phone}`}>
                                {selectedItem.user_phone}
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Votre message
                          </label>
                          <textarea
                            className="w-full min-h-[100px] p-3 border rounded-lg"
                            placeholder="Bonjour, je suis intéressé par votre annonce..."
                            defaultValue={`Bonjour ${selectedItem.user_name},\n\nJe suis intéressé par votre annonce "${selectedItem.title}".\n\nPouvez-vous me donner plus d'informations ?\n\nCordialement,`}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsContactModalOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Statistiques des recommandations */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 mb-8">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {recommendedItems.length}
                      </div>
                      <div className="text-gray-300">Suggestions totales</div>
                      <div className="flex items-center justify-center mt-2">
                        <Sparkles className="h-4 w-4 text-blue-400 mr-1" />
                        <span className="text-sm text-blue-400">
                          Personnalisées
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {
                          recommendedItems.filter((i) => favoriteIds.has(i.id))
                            .length
                        }
                      </div>
                      <div className="text-gray-300">Dans vos favoris</div>
                      <div className="flex items-center justify-center mt-2">
                        <Heart className="h-4 w-4 text-rose-400 mr-1" />
                        <span className="text-sm text-rose-400">
                          Articles sauvegardés
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {userInterests.length}
                      </div>
                      <div className="text-gray-300">Centres d'intérêt</div>
                      <div className="flex items-center justify-center mt-2">
                        <Target className="h-4 w-4 text-emerald-400 mr-1" />
                        <span className="text-sm text-emerald-400">
                          Catégories suivies
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {
                          new Set(recommendedItems.map((item) => item.category))
                            .size
                        }
                      </div>
                      <div className="text-gray-300">Catégories couvertes</div>
                      <div className="flex items-center justify-center mt-2">
                        <Tag className="h-4 w-4 text-amber-400 mr-1" />
                        <span className="text-sm text-amber-400">
                          Diversité
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conseils pour améliorer les recommandations */}
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    Comment améliorer vos recommandations ?
                  </CardTitle>
                  <CardDescription>
                    Des astuces pour recevoir des suggestions encore plus
                    pertinentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Ajoutez plus de centres d'intérêt
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Plus vous ajoutez de catégories, plus nos
                            recommandations seront précises
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <ThumbsUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Notez vos intérêts précisément
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Utilisez l'échelle 1-5 étoiles pour indiquer
                            l'intensité de chaque intérêt
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Interagissez avec les annonces
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Ajoutez aux favoris, contactez les vendeurs, visitez
                            les détails
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Visitez régulièrement
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Nous mettons à jour les recommandations avec de
                            nouvelles annonces
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Link to="/complete-profile">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Mettre à jour mes centres d'intérêt
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations;
