import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  RefreshCw,
  Home,
  Briefcase,
  Wrench,
  Star,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";

interface MonthData {
  month: string;
  year: number;
  users: number;
  listings: number;
}

interface CategoryCount {
  name: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [subscriptionRevenue, setSubscriptionRevenue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        { count: users },
        { count: products },
        { count: properties },
        { count: jobs },
        { count: services },
        { count: events },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ]);

      const total =
        (products || 0) +
        (properties || 0) +
        (jobs || 0) +
        (services || 0) +
        (events || 0);
      setTotalUsers(users || 0);
      setTotalListings(total);

      // Abonnements (peut ne pas encore exister)
      try {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("amount, status")
          .eq("status", "active");

        if (subs) {
          setSubscriptionCount(subs.length);
          setSubscriptionRevenue(
            subs.reduce((acc, s) => acc + (s.amount || 0), 0),
          );
        }
      } catch {
        // Table subscriptions pas encore créée
      }

      setCategories([
        {
          name: "Produits",
          count: products || 0,
          color: "bg-blue-500",
          icon: <ShoppingBag className="h-4 w-4" />,
        },
        {
          name: "Immobilier",
          count: properties || 0,
          color: "bg-green-500",
          icon: <Home className="h-4 w-4" />,
        },
        {
          name: "Emplois",
          count: jobs || 0,
          color: "bg-purple-500",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          name: "Services",
          count: services || 0,
          color: "bg-amber-500",
          icon: <Wrench className="h-4 w-4" />,
        },
        {
          name: "Événements",
          count: events || 0,
          color: "bg-rose-500",
          icon: <Calendar className="h-4 w-4" />,
        },
      ]);

      // Données mensuelles — 5 derniers mois
      const now = new Date();
      const months = Array.from({ length: 5 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
        return d;
      });

      const monthlyResults = await Promise.all(
        months.map(async (date) => {
          const start = new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
          ).toISOString();
          const end = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
            23,
            59,
            59,
          ).toISOString();

          const [
            { count: monthUsers },
            { count: monthProducts },
            { count: monthProperties },
          ] = await Promise.all([
            supabase
              .from("profiles")
              .select("*", { count: "exact", head: true })
              .gte("created_at", start)
              .lte("created_at", end),
            supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .gte("created_at", start)
              .lte("created_at", end),
            supabase
              .from("properties")
              .select("*", { count: "exact", head: true })
              .gte("created_at", start)
              .lte("created_at", end),
          ]);

          return {
            month: date.toLocaleDateString("fr-FR", { month: "short" }),
            year: date.getFullYear(),
            users: monthUsers || 0,
            listings: (monthProducts || 0) + (monthProperties || 0),
          };
        }),
      );

      setMonthlyData(monthlyResults);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxUsers = Math.max(...monthlyData.map((m) => m.users), 1);
  const maxCategory = Math.max(...categories.map((c) => c.count), 1);
  const avgListingsPerUser =
    totalUsers > 0 ? (totalListings / totalUsers).toFixed(1) : "0";

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Analytics & Rapports
            </h1>
            <p className="text-muted-foreground mt-1">
              Données réelles de la plateforme
            </p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualiser
          </Button>
        </div>

        {/* Cartes KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Utilisateurs inscrits",
              value: loading ? "..." : totalUsers.toLocaleString("fr-FR"),
              icon: Users,
              color: "text-blue-600",
              bg: "bg-blue-50",
              note: "Comptes créés",
            },
            {
              label: "Annonces totales",
              value: loading ? "..." : totalListings.toLocaleString("fr-FR"),
              icon: ShoppingBag,
              color: "text-green-600",
              bg: "bg-green-50",
              note: "Toutes catégories",
            },
            {
              label: "Abonnés actifs",
              value: loading
                ? "..."
                : subscriptionCount.toLocaleString("fr-FR"),
              icon: Star,
              color: "text-purple-600",
              bg: "bg-purple-50",
              note: "Standard + Pro",
            },
            {
              label: "Revenus abonnements",
              value: loading ? "..." : `${subscriptionRevenue.toFixed(0)}$`,
              icon: DollarSign,
              color: "text-amber-600",
              bg: "bg-amber-50",
              note: "Via Mobile Money",
            },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.label}
                      </p>
                      <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {kpi.note}
                      </p>
                    </div>
                    <div className={`p-2 rounded-xl ${kpi.bg}`}>
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution par catégorie */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
                Distribution par catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          {cat.icon}
                          {cat.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {cat.count}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {maxCategory > 0
                              ? Math.round((cat.count / maxCategory) * 100)
                              : 0}
                            %
                          </Badge>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                          style={{
                            width: `${maxCategory > 0 ? (cat.count / maxCategory) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Inscriptions mensuelles */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-5 w-5 text-purple-600" />
                Inscriptions (5 derniers mois)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {monthlyData.map((m, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {m.month} {m.year}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 font-medium">
                            {m.users} utilisateurs
                          </span>
                          <span className="text-green-600 font-medium">
                            {m.listings} annonces
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${maxUsers > 0 ? (m.users / maxUsers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Métriques de performance */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">
              Métriques de performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-700">
                    {loading ? "..." : totalUsers.toLocaleString("fr-FR")}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Communauté</h4>
                  <p className="text-sm text-blue-700">
                    Utilisateurs inscrits sur la plateforme
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-green-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <ShoppingBag className="h-8 w-8 text-green-500" />
                  <span className="text-2xl font-bold text-green-700">
                    {loading ? "..." : avgListingsPerUser}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900">
                    Annonces / Utilisateur
                  </h4>
                  <p className="text-sm text-green-700">
                    Engagement moyen des membres
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold text-purple-700">
                    {loading ? "..." : `${subscriptionRevenue.toFixed(0)}$`}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-900">
                    Revenus abonnements
                  </h4>
                  <p className="text-sm text-purple-700">
                    Via PawaPay · Mobile Money
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
