import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const AdminAnalytics = () => {
  const analyticsData = {
    overview: [
      { label: "Visites totales", value: "12,458", change: "+12.5%" },
      { label: "Utilisateurs actifs", value: "2,847", change: "+8.2%" },
      { label: "Taux de conversion", value: "4.8%", change: "+1.3%" },
      { label: "Revenu moyen", value: "€245.67", change: "+5.4%" },
    ],
    categories: [
      { name: "Électronique", value: 32, color: "bg-blue-500" },
      { name: "Immobilier", value: 28, color: "bg-green-500" },
      { name: "Véhicules", value: 18, color: "bg-purple-500" },
      { name: "Services", value: 12, color: "bg-amber-500" },
      { name: "Autres", value: 10, color: "bg-gray-500" },
    ],
    monthlyStats: [
      { month: "Jan", users: 1200, revenue: 45000 },
      { month: "Fév", users: 1800, revenue: 52000 },
      { month: "Mar", users: 2200, revenue: 61000 },
      { month: "Avr", users: 2500, revenue: 68000 },
      { month: "Mai", users: 2847, revenue: 75000 },
    ],
  };

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="h-8 w-8 mr-3" />
              Analytics & Rapports
            </h1>
            <p className="text-muted-foreground">
              Données détaillées et analyses de la plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter le rapport
            </Button>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.overview.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                    <div
                      className={`flex items-center ${
                        stat.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution par catégorie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Distribution par catégorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.categories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {category.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full`}
                        style={{ width: `${category.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques mensuelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Croissance mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.monthlyStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{stat.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {stat.users.toLocaleString()} utilisateurs
                          </div>
                          <div className="text-sm text-muted-foreground">
                            +{Math.round(stat.users * 0.1)} vs mois précédent
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            €{stat.revenue.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            +{Math.round(stat.revenue * 0.08)}€
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${(stat.users / 3000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métriques avancées */}
        <Card>
          <CardHeader>
            <CardTitle>Métriques de performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-500" />
                  <span className="text-2xl font-bold">94%</span>
                </div>
                <div>
                  <h4 className="font-medium">Taux de satisfaction</h4>
                  <p className="text-sm text-muted-foreground">
                    Satisfaction globale des utilisateurs
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <ShoppingBag className="h-8 w-8 text-green-500" />
                  <span className="text-2xl font-bold">2.4</span>
                </div>
                <div>
                  <h4 className="font-medium">
                    Annonces moyennes par utilisateur
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Engagement moyen des utilisateurs
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <span className="text-2xl font-bold">€89.50</span>
                </div>
                <div>
                  <h4 className="font-medium">Valeur à vie du client</h4>
                  <p className="text-sm text-muted-foreground">
                    Valeur moyenne par utilisateur
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
