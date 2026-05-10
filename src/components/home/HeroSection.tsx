import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  ShoppingBag,
  Home,
  Briefcase,
  Wrench,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import { supabase } from "@/services/supabase";

interface Stats {
  products: number;
  properties: number;
  jobs: number;
  services: number;
  users: number;
}

const categories = [
  { label: "Produits", icon: ShoppingBag, href: "/products" },
  { label: "Immobilier", icon: Home, href: "/properties" },
  { label: "Emplois", icon: Briefcase, href: "/jobs" },
  { label: "Services", icon: Wrench, href: "/services" },
  { label: "Événements", icon: Calendar, href: "/events" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<Stats>({
    products: 0,
    properties: 0,
    jobs: 0,
    services: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: products },
        { count: properties },
        { count: jobs },
        { count: services },
        { count: users },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
        supabase.from("services").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      setStats({
        products: products || 0,
        properties: properties || 0,
        jobs: jobs || 0,
        services: services || 0,
        users: users || 0,
      });
    };
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalListings =
    stats.products + stats.properties + stats.jobs + stats.services;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
      {/* Décorations de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container max-w-6xl mx-auto px-4 py-16 md:py-24 pb-20 md:pb-28">
        {/* Badge localisation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-sm">
            <MapPin className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-blue-100">Plateforme #1 en RDC · Congo</span>
          </div>
        </div>

        {/* Titre principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            Le marché du{" "}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Congo
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Achetez, vendez, louez et trouvez des opportunités près de chez
            vous. Des milliers d'annonces partout en RDC.
          </p>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Téléphone, appartement, emploi..."
                className="border-0 bg-transparent text-white placeholder:text-white/50 pl-10 h-12 focus-visible:ring-0 text-base"
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-6 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold shrink-0"
            >
              Rechercher
            </Button>
          </div>
        </form>

        {/* Catégories rapides */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.href} to={cat.href}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm cursor-pointer">
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Statistiques réelles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {[
            {
              label: "Annonces actives",
              value: totalListings,
              icon: TrendingUp,
            },
            { label: "Utilisateurs", value: stats.users, icon: Users },
            {
              label: "Biens immobiliers",
              value: stats.properties,
              icon: Home,
            },
            {
              label: "Offres d'emploi",
              value: stats.jobs,
              icon: Briefcase,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10"
              >
                <Icon className="h-5 w-5 mx-auto mb-1 text-blue-300" />
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value > 0
                    ? stat.value.toLocaleString("fr-FR")
                    : "–"}
                </div>
                <div className="text-xs text-blue-200/80 mt-0.5">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
