import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  ArrowRight,
  Package,
  Home,
  MessageSquare,
  Handshake,
  Shield,
} from "lucide-react";
import { supabase } from "@/services/supabase";

interface RecentItem {
  id: string;
  title: string;
  price: number;
  is_offered?: boolean;
  location: string;
  images: string[];
  created_at: string;
  type: "product" | "property";
  condition?: string;
  property_type?: string;
}

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Package,
    title: "Publiez votre annonce",
    desc: "Créez votre annonce en quelques minutes. Ajoutez photos, description et prix.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Contactez les vendeurs",
    desc: "Envoyez un message directement au vendeur via notre messagerie intégrée.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    step: "03",
    icon: Handshake,
    title: "Concluez votre accord",
    desc: "Rencontrez-vous et finalisez la transaction. Simple, rapide et sécurisé.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

const Index = () => {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      const [{ data: products }, { data: properties }] = await Promise.all([
        supabase
          .from("products")
          .select(
            "id, title, price, is_offered, location, images, created_at, condition",
          )
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("properties")
          .select(
            "id, title, price, is_offered, location, images, created_at, property_type",
          )
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      const items: RecentItem[] = [
        ...(products || []).map((p) => ({ ...p, type: "product" as const })),
        ...(properties || []).map((p) => ({
          ...p,
          type: "property" as const,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 6);

      setRecentItems(items);
    };
    fetchRecent();
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <Layout>
      <HeroSection />

      {/* Comment ça marche */}
      <section className="py-16 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge
              variant="outline"
              className="mb-3 text-blue-600 border-blue-200"
            >
              Simple & rapide
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm">
              En 3 étapes simples, trouvez ce que vous cherchez ou vendez ce
              dont vous n'avez plus besoin.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative text-center group">
                  <div
                    className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-7 w-7 ${step.color}`} />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-500">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bandeau commission */}
      <section className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-100">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-start gap-3">
            <Shield className="h-8 w-8 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900">
                Transparent sur les commissions
              </h3>
              <p className="text-blue-700 text-sm">
                SolidUnion perçoit une commission de 5% sur les transactions
                réussies. Aucun frais caché. Le paiement se fait directement
                entre acheteur et vendeur.
              </p>
            </div>
          </div>
          <Link to="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
              Publier gratuitement
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Annonces récentes */}
      {recentItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Annonces récentes
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Les dernières annonces publiées sur la plateforme
                </p>
              </div>
              <Link to="/products" className="hidden md:block">
                <Button variant="outline" size="sm">
                  Voir tout <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentItems.map((item) => (
                <Card
                  key={`${item.type}-${item.id}`}
                  className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm bg-white"
                >
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        {item.type === "product" ? (
                          <Package className="h-12 w-12 text-gray-300" />
                        ) : (
                          <Home className="h-12 w-12 text-gray-300" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                      <Badge className="text-xs bg-white/90 text-gray-700 backdrop-blur-sm border-0 shadow-sm">
                        {item.type === "product" ? "Produit" : "Immobilier"}
                      </Badge>
                      {item.is_offered && (
                        <Badge className="text-xs bg-green-500 text-white border-0">
                          🎁 Offert
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {item.is_offered ? (
                        <span className="font-bold text-green-600">
                          Gratuit
                        </span>
                      ) : (
                        <span className="font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                      )}
                      <Link
                        to={
                          item.type === "product" ? "/products" : "/properties"
                        }
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto text-xs"
                        >
                          Voir →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8 md:hidden">
              <Link to="/products">
                <Button variant="outline">Voir toutes les annonces</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <FeaturesSection />
    </Layout>
  );
};

export default Index;
