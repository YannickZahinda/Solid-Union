import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  ShoppingBag,
  Home,
  Bell,
  MessageSquare,
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Eye,
  Heart,
  MapPin,
  DollarSign,
  Calendar,
  Target,
  Star,
  Zap,
  Clock,
  Filter,
  Search,
  ChevronRight,
  UserCheck,
  Shield,
  ThumbsUp,
  TrendingDown,
  BarChart3,
  Briefcase,
  Building,
  Car,
  Smartphone,
  Shirt,
  Sofa,
  Wrench,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  Grid,
  List,
  Phone,
  Mail,
  Share2,
  Bookmark,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface DashboardStats {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  profileCompletion: number;
  totalFavorites: number;
}

interface RecommendedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image: string;
  type: "product" | "property";
  category: string;
  postedAt: string;
  isFavorite: boolean;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    profileCompletion: 0,
    totalFavorites: 0,
  });
  const [recommendedItems, setRecommendedItems] = useState<RecommendedItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchRecommendedItems();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    }
  };

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("completion_percentage")
        .eq("id", user.id)
        .single();

      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      const { count: favoritesCount } = await supabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: viewsCount } = await supabase
        .from("views")
        .select("*", { count: "exact", head: true })
        .eq("viewer_id", user.id);

      setStats({
        totalListings: (productsCount || 0) + (propertiesCount || 0),
        totalViews: viewsCount || 0,
        totalMessages: messagesCount || 0,
        profileCompletion: profile?.completion_percentage || 0,
        totalFavorites: favoritesCount || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedItems = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: interests } = await supabase
        .from("user_interests")
        .select("category_id")
        .eq("user_id", user.id);

      if (!interests || interests.length === 0) return;

      const categoryIds = interests.map((interest) => interest.category_id);

      const { data: products } = await supabase
        .from("products")
        .select(
          "id, title, description, price, location, images, category_id, created_at, categories(name)"
        )
        .in("category_id", categoryIds)
        .limit(4)
        .order("created_at", { ascending: false });

      const { data: properties } = await supabase
        .from("properties")
        .select(
          "id, title, description, price, location, images, category_id, created_at, categories(name)"
        )
        .in("category_id", categoryIds)
        .limit(4)
        .order("created_at", { ascending: false });

      const recommended: RecommendedItem[] = [];

      products?.forEach((product) => {
        recommended.push({
          id: product.id,
          title: product.title,
          description: product.description || "",
          price: product.price,
          location: product.location,
          image:
            product.images?.[0] ||
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
          type: "product",
          category: (product.categories as any)?.name || "Produit",
          postedAt: new Date(product.created_at).toLocaleDateString("fr-FR"),
          isFavorite: false,
        });
      });

      properties?.forEach((property) => {
        recommended.push({
          id: property.id,
          title: property.title,
          description: property.description || "",
          price: property.price,
          location: property.location,
          image:
            property.images?.[0] ||
            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&h=300&fit=crop",
          type: "property",
          category: (property.categories as any)?.name || "Propriété",
          postedAt: new Date(property.created_at).toLocaleDateString("fr-FR"),
          isFavorite: false,
        });
      });

      setRecommendedItems(
        recommended.sort(() => Math.random() - 0.5).slice(0, 4)
      );
    } catch (error) {
      console.error("Erreur lors du chargement des recommandations:", error);
    }
  };

  const quickActions = [
    {
      title: "Nouvelle annonce",
      description: "Vendez rapidement",
      icon: PlusCircle,
      link: "/create-listing",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Mes annonces",
      description: "Gérer mes biens",
      icon: ShoppingBag,
      link: "/my-listings",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "Propriétés",
      description: "Rechercher",
      icon: Home,
      link: "/properties",
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Produits",
      description: "Parcourir",
      icon: Package,
      link: "/products",
      color: "from-violet-500 to-fuchsia-600",
    },
    {
      title: "Suggestions",
      description: "Pour vous",
      icon: Sparkles,
      link: "/recommendations",
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Messages",
      description: "Conversations",
      icon: MessageSquare,
      link: "/messages",
      color: "from-cyan-500 to-sky-600",
    },
  ];

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: React.ReactNode } = {
      Electronics: <Smartphone className="h-4 w-4" />,
      "Fashion & Clothing": <Shirt className="h-4 w-4" />,
      "Home & Garden": <Sofa className="h-4 w-4" />,
      Vehicles: <Car className="h-4 w-4" />,
      Services: <Wrench className="h-4 w-4" />,
      "Real Estate Services": <Briefcase className="h-4 w-4" />,
      Jobs: <Briefcase className="h-4 w-4" />,
      Properties: <Building className="h-4 w-4" />,
      default: <Package className="h-4 w-4" />,
    };

    for (const key in categoryIcons) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return categoryIcons[key];
      }
    }
    return categoryIcons.default;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header mobile fixe */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-blue-100">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        {userName ? userName.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {userName || "Utilisateur"}
                      </p>
                      <p className="text-sm text-gray-600">Membre vérifié</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <nav className="space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <UserCheck className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Mon Profil</span>
                    </Link>
                    <Link
                      to="/my-listings"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <ShoppingBag className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Mes Annonces</span>
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <MessageSquare className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Messages</span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <Heart className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Favoris</span>
                    </Link>
                    <Separator className="my-2" />
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <Settings className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Paramètres</span>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center px-3 py-2.5 rounded-lg hover:bg-gray-100"
                    >
                      <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Aide</span>
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Tableau de bord
              </h1>
              <p className="text-xs text-gray-600">
                Bienvenue {userName ? userName.split(" ")[0] : ""}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
        <div className="px-4 py-6 lg:max-w-7xl lg:mx-auto lg:px-6 lg:py-8">
          {/* Header desktop (caché sur mobile) */}
          <div className="hidden lg:block mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de bord
                </h1>
                <p className="text-gray-600 mt-1">
                  Bienvenue {userName} ! Voici un aperçu de votre activité
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/create-listing">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nouvelle annonce
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* CTA flottant pour mobile */}
          <div className="fixed bottom-20 right-4 z-40 lg:hidden">
            <Button
              asChild
              className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-blue-600 to-indigo-600"
            >
              <Link to="/create-listing">
                <PlusCircle className="h-6 w-6" />
              </Link>
            </Button>
          </div>

          {/* Barre de progression du profil */}
          {stats.profileCompletion < 100 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6 lg:p-6">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0 lg:p-3">
                  <Target className="h-5 w-5 text-amber-600 lg:h-6 lg:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-lg">
                    Complétez votre profil
                  </h3>
                  <p className="text-amber-700 text-xs lg:text-sm mt-0.5 line-clamp-2">
                    Augmentez votre crédibilité et obtenez de meilleures
                    recommandations
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-gray-700">
                        Progression
                      </span>
                      <span className="text-xs lg:text-sm font-bold text-amber-600">
                        {stats.profileCompletion}%
                      </span>
                    </div>
                    <Progress
                      value={stats.profileCompletion}
                      className="h-1.5 lg:h-2 bg-amber-100"
                    />
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 text-xs lg:text-sm flex-shrink-0"
                >
                  <Link to="/complete-profile">
                    <Zap className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                    Compléter
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Statistiques principales - Design mobile optimisé */}
          <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-4 lg:gap-6">
            <Card className="col-span-1 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-1 truncate">
                      Annonces
                    </p>
                    <h3 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
                      {stats.totalListings}
                    </h3>
                    <div className="flex items-center mt-1 lg:mt-2">
                      <TrendingUp className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-emerald-500 mr-0.5 lg:mr-1" />
                      <span className="text-[9px] lg:text-xs text-emerald-600 font-medium truncate">
                        +2 cette semaine
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-2 lg:p-3 rounded-lg">
                    <Package className="h-5 w-5 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-1 truncate">
                      Vues
                    </p>
                    <h3 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
                      {stats.totalViews}
                    </h3>
                    <div className="flex items-center mt-1 lg:mt-2">
                      <Eye className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-blue-500 mr-0.5 lg:mr-1" />
                      <span className="text-[9px] lg:text-xs text-blue-600 font-medium truncate">
                        +12 aujourd'hui
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-50 p-2 lg:p-3 rounded-lg">
                    <Eye className="h-5 w-5 lg:h-8 lg:w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-1 truncate">
                      Messages
                    </p>
                    <h3 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
                      {stats.totalMessages}
                    </h3>
                    <div className="flex items-center mt-1 lg:mt-2">
                      <Bell className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-purple-500 mr-0.5 lg:mr-1" />
                      <span className="text-[9px] lg:text-xs text-purple-600 font-medium truncate">
                        {stats.totalMessages > 0 ? "Nouveaux" : "Aucun"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-2 lg:p-3 rounded-lg">
                    <MessageSquare className="h-5 w-5 lg:h-8 lg:w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-1 truncate">
                      Favoris
                    </p>
                    <h3 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
                      {stats.totalFavorites}
                    </h3>
                    <div className="flex items-center mt-1 lg:mt-2">
                      <Heart className="h-2.5 w-2.5 lg:h-4 lg:w-4 text-rose-500 mr-0.5 lg:mr-1" />
                      <span className="text-[9px] lg:text-xs text-rose-600 font-medium truncate">
                        Sauvegardés
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-100 to-rose-50 p-2 lg:p-3 rounded-lg">
                    <Heart className="h-5 w-5 lg:h-8 lg:w-8 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides - Grille mobile optimisée */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-2xl font-bold text-gray-900">
                Actions rapides
              </h2>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:grid-cols-3 lg:gap-6">
              {quickActions.slice(0, 6).map((action, index) => (
                <Link to={action.link} key={index} className="block">
                  <Card className="group h-full border border-gray-200 hover:border-transparent hover:shadow-lg transition-all active:scale-95">
                    <CardContent className="p-3 lg:p-6">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`p-2.5 lg:p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-sm mb-2 lg:mb-4`}
                        >
                          <action.icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-xs lg:text-base line-clamp-1 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-[10px] lg:text-sm text-gray-600 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Section principale avec onglets - Mobile optimisé */}
          <Tabs defaultValue="recommendations" className="mb-8">
            <TabsList className="w-full bg-white border border-gray-200 p-1 rounded-xl mb-4 overflow-x-auto flex-nowrap lg:overflow-visible">
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg px-3 py-2 text-xs lg:text-sm lg:px-4 flex-shrink-0"
              >
                <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="truncate">Suggestions</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg px-3 py-2 text-xs lg:text-sm lg:px-4 flex-shrink-0"
              >
                <Bell className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="truncate">Activité</span>
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg px-3 py-2 text-xs lg:text-sm lg:px-4 flex-shrink-0"
              >
                <Zap className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="truncate">Conseils</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="recommendations"
              className="space-y-4 lg:space-y-6"
            >
              <Card className="border-0 shadow-sm lg:shadow-lg overflow-hidden">
                <CardHeader className="p-4 lg:p-6 border-b">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base lg:text-xl font-bold">
                        Basé sur vos centres d'intérêt
                      </CardTitle>
                      <CardDescription className="text-xs lg:text-sm">
                        Des annonces qui correspondent à vos préférences
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 bg-blue-50 text-xs w-fit"
                    >
                      <Sparkles className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                      IA
                    </Badge>
                  </div>
                </CardHeader>

                {recommendedItems.length > 0 ? (
                  <CardContent className="p-4 lg:p-6">
                    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6">
                      {recommendedItems.map((item) => (
                        <div key={item.id} className="group">
                          <div className="flex items-start space-x-3 lg:flex-col lg:space-x-0 lg:border lg:border-gray-200 lg:rounded-xl lg:p-4 lg:hover:border-blue-300 lg:hover:shadow-md">
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 lg:w-full lg:h-48 rounded-lg overflow-hidden">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <Badge className="absolute top-1 left-1 text-[8px] lg:text-xs">
                                {item.type === "product"
                                  ? "Produit"
                                  : "Propriété"}
                              </Badge>
                            </div>

                            <div className="flex-1 min-w-0 lg:mt-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-1.5 mb-1">
                                    <div className="p-1 bg-gray-100 rounded">
                                      {getCategoryIcon(item.category)}
                                    </div>
                                    <span className="text-xs text-gray-600 truncate">
                                      {item.category}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-gray-900 text-sm lg:text-base line-clamp-1">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                    {item.description}
                                  </p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 flex-shrink-0"
                                >
                                  <Heart className="h-3.5 w-3.5" />
                                </Button>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                <div>
                                  <div className="flex items-center font-bold text-gray-900 text-sm lg:text-lg">
                                    <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 mr-0.5" />
                                    {new Intl.NumberFormat("fr-FR").format(
                                      item.price
                                    )}
                                  </div>
                                  <div className="flex items-center text-[10px] lg:text-sm text-gray-500 mt-0.5">
                                    <MapPin className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-1" />
                                    <span className="truncate">
                                      {item.location}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center text-[10px] text-gray-500 lg:text-xs">
                                    <Clock className="h-2.5 w-2.5 lg:h-3 lg:w-3 mr-0.5" />
                                    {item.postedAt}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1 text-xs h-7"
                                  >
                                    Voir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Button
                        asChild
                        variant="outline"
                        className="text-sm w-full lg:w-auto"
                      >
                        <Link to="/recommendations">
                          Voir toutes les suggestions
                          <ChevronRight className="h-3.5 w-3.5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-8 text-center">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Ajoutez des centres d'intérêt
                    </h4>
                    <p className="text-gray-600 text-sm mb-6">
                      Pour voir des suggestions personnalisées
                    </p>
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      <Link to="/complete-profile">
                        <Sparkles className="h-3.5 w-3.5 mr-2" />
                        Compléter mon profil
                      </Link>
                    </Button>
                  </CardContent>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card className="border-0 shadow-sm lg:shadow-lg">
                <CardHeader className="p-4 lg:p-6">
                  <CardTitle className="text-base lg:text-xl">
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 lg:p-6">
                  {stats.totalListings === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="h-8 w-8 text-blue-500" />
                      </div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Aucune activité
                      </h4>
                      <p className="text-gray-600 text-sm mb-6">
                        Créez votre première annonce
                      </p>
                      <Button
                        asChild
                        className="bg-blue-600 hover:bg-blue-700 text-sm"
                      >
                        <Link to="/create-listing">
                          <PlusCircle className="h-3.5 w-3.5 mr-2" />
                          Créer une annonce
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                          <CheckCircle className="h-4 w-4 lg:h-6 lg:w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm lg:text-base">
                            Profil mis à jour
                          </p>
                          <p className="text-gray-600 text-xs lg:text-sm mt-0.5">
                            Votre profil est complété à{" "}
                            {stats.profileCompletion}%
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          Auj.
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="flex items-center text-gray-900 text-sm lg:text-base">
                      <Shield className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-blue-600" />
                      Améliorez votre crédibilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Ajoutez une photo de profil
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Vérifiez votre téléphone
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Rédigez une biographie
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
                  <CardHeader className="p-4 lg:p-6">
                    <CardTitle className="flex items-center text-gray-900 text-sm lg:text-base">
                      <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-emerald-600" />
                      Boostez vos ventes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 lg:p-6 lg:pt-0">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Zap className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Photos de haute qualité
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Répondez rapidement
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-3.5 w-3.5 lg:h-5 lg:w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-xs lg:text-sm">
                          Mettez à jour régulièrement
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Barre de navigation mobile */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
            <div className="flex justify-around items-center py-2">
              <Link to="/dashboard" className="flex flex-col items-center p-2">
                <Grid className="h-5 w-5 text-blue-600" />
                <span className="text-xs text-gray-700 mt-1">Accueil</span>
              </Link>
              <Link
                to="/my-listings"
                className="flex flex-col items-center p-2"
              >
                <ShoppingBag className="h-5 w-5 text-gray-500" />
                <span className="text-xs text-gray-700 mt-1">Annonces</span>
              </Link>
              <div className="relative -top-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full p-3 shadow-lg">
                  <PlusCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <Link to="/messages" className="flex flex-col items-center p-2">
                <MessageSquare className="h-5 w-5 text-gray-500" />
                <span className="text-xs text-gray-700 mt-1">Messages</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center p-2">
                <UserCheck className="h-5 w-5 text-gray-500" />
                <span className="text-xs text-gray-700 mt-1">Profil</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
