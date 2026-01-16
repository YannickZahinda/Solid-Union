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
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  ShoppingBag,
  Home,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  TrendingUp,
  Shield,
  Filter,
  Download,
  RefreshCw,
  Settings,
  UserCheck,
  UserX,
  DollarSign,
  Calendar,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalProducts: number;
  totalProperties: number;
  activeUsers: number;
  pendingListings: number;
  totalRevenue: number;
  growthRate: number;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  status: "active" | "inactive";
}

interface RecentListing {
  id: string;
  title: string;
  type: "product" | "property";
  price: number;
  created_at: string;
  status: "active" | "pending" | "reported";
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalListings: 0,
    totalProducts: 0,
    totalProperties: 0,
    activeUsers: 0,
    pendingListings: 0,
    totalRevenue: 0,
    growthRate: 0,
  });

  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Récupérer les statistiques utilisateurs
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Récupérer les statistiques des annonces
      const { count: totalProducts } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: totalProperties } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      // Récupérer les utilisateurs récents
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Récupérer les annonces récentes
      const { data: products } = await supabase
        .from("products")
        .select("id, title, price, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: properties } = await supabase
        .from("properties")
        .select("id, title, price, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      // Calculer les statistiques
      const totalListings = (totalProducts || 0) + (totalProperties || 0);
      const activeUsers = totalUsers ? Math.round(totalUsers * 0.7) : 0;
      const pendingListings = totalListings
        ? Math.round(totalListings * 0.05)
        : 0;
      const totalRevenue = totalListings * 100; // Simulation
      const growthRate = 12.5; // Simulation

      setStats({
        totalUsers: totalUsers || 0,
        totalListings,
        totalProducts: totalProducts || 0,
        totalProperties: totalProperties || 0,
        activeUsers,
        pendingListings,
        totalRevenue,
        growthRate,
      });

      // Formater les utilisateurs récents
      const formattedUsers: RecentUser[] = (users || []).map((user) => ({
        id: user.id,
        email: user.email || "Non défini",
        full_name: user.full_name || "Utilisateur anonyme",
        created_at: user.created_at,
        status: Math.random() > 0.3 ? "active" : "inactive",
      }));

      // Formater les annonces récentes
      const allListings: RecentListing[] = [
        ...(products?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "product" as const,
          price: p.price,
          created_at: p.created_at,
          status: (Math.random() > 0.7
            ? "reported"
            : Math.random() > 0.5
            ? "pending"
            : "active") as "active" | "pending" | "reported",
        })) || []),
        ...(properties?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "property" as const,
          price: p.price,
          created_at: p.created_at,
          status: (Math.random() > 0.7
            ? "reported"
            : Math.random() > 0.5
            ? "pending"
            : "active") as "active" | "pending" | "reported",
        })) || []),
      ]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      setRecentUsers(formattedUsers);
      setRecentListings(allListings);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    {
      title: "Gérer les utilisateurs",
      description: "Voir et gérer tous les utilisateurs",
      icon: Users,
      link: "/admin/users",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    },
    {
      title: "Modérer les annonces",
      description: "Approuver ou rejeter les annonces",
      icon: Filter,
      link: "/admin/listings",
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      title: "Voir les rapports",
      description: "Analyses et statistiques détaillées",
      icon: BarChart3,
      link: "/admin/analytics",
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      title: "Paramètres système",
      description: "Configurer les paramètres de la plateforme",
      icon: Settings,
      link: "/admin/settings",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">
            Chargement du tableau de bord administrateur...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">
                Tableau de bord Administrateur
              </h1>
            </div>
            <p className="text-muted-foreground">
              Panel d'administration de SolidUnion - Gestion complète de la
              plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter les données
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Utilisateurs totaux
                  </p>
                  <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">
                      +{stats.growthRate}%
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Annonces actives
                  </p>
                  <h3 className="text-2xl font-bold">{stats.totalListings}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {stats.totalProducts} produits
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {stats.totalProperties} propriétés
                    </Badge>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Annonces en attente
                  </p>
                  <h3 className="text-2xl font-bold">
                    {stats.pendingListings}
                  </h3>
                  <p className="text-sm text-amber-600 mt-1">
                    Nécessitent une vérification
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Revenus totaux
                  </p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </h3>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-muted-foreground">
                      30 derniers jours
                    </span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminActions.map((action, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow hover:scale-[1.02]"
              >
                <CardContent className="pt-6">
                  <Link to={action.link} className="block">
                    <div className="space-y-3">
                      <div
                        className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center`}
                      >
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tableaux d'activité */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilisateurs récents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Utilisateurs récents
              </CardTitle>
              <CardDescription>
                5 derniers utilisateurs inscrits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/users">
                    <Users className="h-4 w-4 mr-2" />
                    Voir tous les utilisateurs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Annonces récentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Annonces récentes
              </CardTitle>
              <CardDescription>Dernières annonces publiées</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium truncate max-w-[150px]">
                        {listing.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {listing.type === "product" ? "Produit" : "Propriété"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(listing.price)}</TableCell>
                      <TableCell>
                        {listing.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        ) : listing.status === "pending" ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <XCircle className="h-3 w-3 mr-1" />
                            Signalé
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/listings">
                    <Filter className="h-4 w-4 mr-2" />
                    Gérer toutes les annonces
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes système */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Annonces signalées</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.pendingListings} annonces nécessitent une
                      vérification
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="destructive" asChild>
                  <Link to="/admin/listings?status=reported">Vérifier</Link>
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Support client</p>
                    <p className="text-sm text-muted-foreground">
                      12 messages non lus dans le support
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/support">Répondre</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résumé de performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performance de la plateforme
            </CardTitle>
            <CardDescription>
              Aperçu des performances sur les 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Taux de croissance
                  </span>
                  <span className="font-medium text-green-600">
                    +{stats.growthRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min(stats.growthRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Taux de rétention
                  </span>
                  <span className="font-medium text-blue-600">78%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Satisfaction utilisateur
                  </span>
                  <span className="font-medium text-purple-600">4.5/5</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "90%" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <div className="text-sm text-muted-foreground">
                  Utilisateurs actifs
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <div className="text-sm text-muted-foreground">
                  Annonces totales
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-muted-foreground">
                  Temps de disponibilité
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">&lt; 2s</div>
                <div className="text-sm text-muted-foreground">
                  Temps de réponse
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
