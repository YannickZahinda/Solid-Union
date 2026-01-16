import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
    fetchRecommendedItems();
  }, []);

  const fetchDashboardData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get profile completion
      const { data: profile } = await supabase
        .from("profiles")
        .select("completion_percentage, avatar_url, full_name")
        .eq("id", user.id)
        .single();

      // Count user's listings
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

      // Get views count (simplified)
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
      // Get user interests
      const { data: interests } = await supabase
        .from("user_interests")
        .select("category_id")
        .eq("user_id", user.id);

      if (!interests || interests.length === 0) return;

      // Get category IDs from interests
      const categoryIds = interests.map((interest) => interest.category_id);

      // Fetch recommended products
      const { data: products } = await supabase
        .from("products")
        .select(
          "id, title, description, price, location, images, category_id, created_at, categories(name)"
        )
        .in("category_id", categoryIds)
        .limit(6)
        .order("created_at", { ascending: false });

      // Fetch recommended properties
      const { data: properties } = await supabase
        .from("properties")
        .select(
          "id, title, description, price, location, images, category_id, created_at, categories(name)"
        )
        .in("category_id", categoryIds)
        .limit(6)
        .order("created_at", { ascending: false });

      const recommended: RecommendedItem[] = [];

      // Process products
      products?.forEach((product) => {
        recommended.push({
          id: product.id,
          title: product.title,
          description: product.description || "",
          price: product.price,
          location: product.location,
          image: product.images?.[0] || "https://via.placeholder.com/300",
          type: "product",
          category: (product.categories as any)?.name || "Produit",
          postedAt: new Date(product.created_at).toLocaleDateString("fr-FR"),
          isFavorite: false,
        });
      });

      // Process properties
      properties?.forEach((property) => {
        recommended.push({
          id: property.id,
          title: property.title,
          description: property.description || "",
          price: property.price,
          location: property.location,
          image: property.images?.[0] || "https://via.placeholder.com/300",
          type: "property",
          category: (property.categories as any)?.name || "Propriété",
          postedAt: new Date(property.created_at).toLocaleDateString("fr-FR"),
          isFavorite: false,
        });
      });

      // Shuffle and limit to 8 items
      setRecommendedItems(
        recommended.sort(() => Math.random() - 0.5).slice(0, 8)
      );
    } catch (error) {
      console.error("Erreur lors du chargement des recommandations:", error);
    }
  };

  const quickActions = [
    {
      title: "Créer une nouvelle annonce",
      description: "Vendez un produit ou une propriété",
      icon: PlusCircle,
      link: "/create-listing",
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Mes annonces",
      description: "Gérez vos annonces actives",
      icon: ShoppingBag,
      link: "/my-listings",
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Parcourir les propriétés",
      description: "Trouvez des propriétés à acheter ou louer",
      icon: Home,
      link: "/properties",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Parcourir les produits",
      description: "Découvrez des produits en vente",
      icon: Package,
      link: "/products",
      color: "bg-gradient-to-br from-violet-500 to-fuchsia-600",
      gradient: "from-violet-500 to-fuchsia-600",
    },
    {
      title: "Suggestions personnalisées",
      description: "Basé sur vos centres d'intérêt",
      icon: Sparkles,
      link: "/recommendations",
      color: "bg-gradient-to-br from-rose-500 to-pink-600",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      title: "Messages",
      description: "Consultez vos conversations",
      icon: MessageSquare,
      link: "/messages",
      color: "bg-gradient-to-br from-cyan-500 to-sky-600",
      gradient: "from-cyan-500 to-sky-600",
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
            <p className="text-lg text-gray-600">
              Chargement de votre tableau de bord...
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
          {/* Header avec bienvenue */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Tableau de bord
                </h1>
                <p className="text-gray-600 mt-2">
                  Bienvenue ! Voici un aperçu de votre activité
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Link to="/create-listing">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Nouvelle annonce
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link to="/profile">
                    <UserCheck className="h-5 w-5 mr-2" />
                    Profil
                  </Link>
                </Button>
              </div>
            </div>

            {/* Barre de progression du profil */}
            {stats.profileCompletion < 100 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-amber-100 p-3 rounded-xl">
                      <Target className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        Complétez votre profil
                      </h3>
                      <p className="text-amber-700 text-sm mt-1">
                        Augmentez votre crédibilité et obtenez de meilleures
                        recommandations
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Progression
                          </span>
                          <span className="text-sm font-bold text-amber-600">
                            {stats.profileCompletion}%
                          </span>
                        </div>
                        <Progress
                          value={stats.profileCompletion}
                          className="h-2 bg-amber-100"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <Link to="/complete-profile">
                      <Zap className="h-4 w-4 mr-2" />
                      Compléter
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Annonces actives
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats.totalListings}
                    </h3>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                      <span className="text-xs text-emerald-600 font-medium">
                        +2 cette semaine
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-3 rounded-xl">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Vues du profil
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats.totalViews}
                    </h3>
                    <div className="flex items-center mt-2">
                      <Eye className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-xs text-blue-600 font-medium">
                        +12 aujourd'hui
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-xl">
                    <Eye className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Messages
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats.totalMessages}
                    </h3>
                    <div className="flex items-center mt-2">
                      <Bell className="h-4 w-4 text-purple-500 mr-1" />
                      <span className="text-xs text-purple-600 font-medium">
                        {stats.totalMessages > 0
                          ? "Nouveaux messages"
                          : "Aucun nouveau"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-3 rounded-xl">
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Favoris
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stats.totalFavorites}
                    </h3>
                    <div className="flex items-center mt-2">
                      <Heart className="h-4 w-4 text-rose-500 mr-1" />
                      <span className="text-xs text-rose-600 font-medium">
                        Articles sauvegardés
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-rose-100 to-rose-50 p-3 rounded-xl">
                    <Heart className="h-8 w-8 text-rose-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Actions rapides
              </h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link to={action.link} key={index}>
                  <Card className="group bg-white border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}
                        >
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-gray-800 mb-2">
                            {action.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {action.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700">
                            <span>Accéder</span>
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Section principale avec onglets */}
          <Tabs defaultValue="recommendations" className="mb-8">
            <TabsList className="bg-white border border-gray-200 p-1 rounded-xl mb-6">
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg px-4"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Suggestions personnalisées
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg px-4"
              >
                <Bell className="h-4 w-4 mr-2" />
                Activité récente
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg px-4"
              >
                <Zap className="h-4 w-4 mr-2" />
                Conseils & Astuces
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Basé sur vos centres d'intérêt
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Des annonces qui correspondent à vos préférences
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 text-blue-700 bg-blue-50"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Intelligence artificielle
                    </Badge>
                  </div>
                </div>

                {recommendedItems.length > 0 ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {recommendedItems.map((item) => (
                        <Card
                          key={item.id}
                          className="group border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge className="absolute top-3 left-3">
                              {item.type === "product"
                                ? "Produit"
                                : "Propriété"}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm hover:bg-white"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>

                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                  {getCategoryIcon(item.category)}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                              </div>
                            </div>

                            <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between mt-4">
                              <div>
                                <div className="flex items-center text-lg font-bold text-gray-900">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {new Intl.NumberFormat("fr-FR").format(
                                    item.price
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {item.location}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {item.postedAt}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-2"
                                >
                                  Voir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="mt-8 text-center">
                      <Button
                        asChild
                        variant="outline"
                        className="border-gray-300"
                      >
                        <Link to="/recommendations">
                          Voir toutes les suggestions
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-10 w-10 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      Ajoutez des centres d'intérêt
                    </h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Pour voir des suggestions personnalisées, veuillez ajouter
                      vos centres d'intérêt dans votre profil
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Link to="/complete-profile">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Compléter mon profil
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Activité récente
                </h3>

                {stats.totalListings === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-10 w-10 text-blue-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      Aucune activité pour le moment
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Créez votre première annonce pour commencer
                    </p>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <Link to="/create-listing">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Créer une annonce
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                      <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                        <CheckCircle className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Profil mis à jour
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Votre profil est complété à {stats.profileCompletion}%
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">Aujourd'hui</span>
                    </div>

                    <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Nouvelle vue
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Votre annonce a été vue 12 fois aujourd'hui
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">Il y a 2h</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tips">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Améliorez votre crédibilité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Ajoutez une photo de profil professionnelle
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Vérifiez votre numéro de téléphone
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Rédigez une biographie complète
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <BarChart3 className="h-5 w-5 mr-2 text-emerald-600" />
                      Boostez vos ventes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <Zap className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Utilisez des photos de haute qualité
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Répondez rapidement aux messages
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Zap className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Mettez régulièrement à jour vos annonces
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Section statistiques avancées */}
          <Card className="bg-white border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Statistiques avancées
              </CardTitle>
              <CardDescription>
                Suivez vos performances et votre croissance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.profileCompletion}%
                  </div>
                  <div className="text-gray-600 mb-4">Score de profil</div>
                  <Progress value={stats.profileCompletion} className="h-2" />
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.totalViews}
                  </div>
                  <div className="text-gray-600 mb-4">Engagement total</div>
                  <div className="text-sm text-emerald-600 font-medium">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    +15% ce mois-ci
                  </div>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-xl">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stats.totalMessages}
                  </div>
                  <div className="text-gray-600 mb-4">Interactions</div>
                  <div className="text-sm text-blue-600 font-medium">
                    <MessageSquare className="h-4 w-4 inline mr-1" />
                    Taux de réponse: 85%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
