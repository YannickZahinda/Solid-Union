import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Home, Briefcase, Calendar, ArrowRight } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Search,
      title: "Rechercher des Professionnels",
      description: "Trouvez des professionnels qualifiés et des prestataires de services près de chez vous.",
      action: "Trouver des Services",
      href: "/services",
      gradient: "from-primary to-primary-glow"
    },
    {
      icon: ShoppingBag,
      title: "Acheter & Vendre des Produits",
      description: "Découvrez des produits de qualité auprès de vendeurs et entrepreneurs locaux.",
      action: "Parcourir les Produits",
      href: "/products",
      gradient: "from-secondary to-accent"
    },
    {
      icon: Home,
      title: "Louer des Biens",
      description: "Trouvez votre logement idéal ou listez votre propriété à louer.",
      action: "Voir les Biens",
      href: "/properties",
      gradient: "from-success to-primary"
    },
    {
      icon: Briefcase,
      title: "Trouver un Emploi",
      description: "Connectez-vous avec des opportunités d'emploi correspondant à vos compétences.",
      action: "Rechercher des Emplois",
      href: "/jobs",
      gradient: "from-accent to-secondary"
    },
    {
      icon: Calendar,
      title: "Participer à des Événements",
      description: "Restez connecté avec les événements communautaires et opportunités de réseautage.",
      action: "Voir les Événements",
      href: "/events",
      gradient: "from-primary to-success"
    }
  ];

  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tout ce dont vous avez besoin sur <span className="text-gradient">une seule plateforme</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Que vous souhaitiez acheter, vendre, louer, travailler ou vous connecter, SolidUnion fournit
            tous les outils dont vous avez besoin pour prospérer dans l'économie numérique en croissance du Congo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card-elevated p-8 group hover:shadow-xl transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-8 w-8" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <Link to={feature.href}>
                  <Button variant="ghost" className="w-full justify-between group-hover:bg-muted transition-colors">
                    {feature.action}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Section CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center p-12 rounded-2xl bg-[image:var(--gradient-warm)] text-accent-foreground">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à Commencer ?
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl">
              Rejoignez les milliers de personnes qui utilisent déjà SolidUnion pour développer leurs entreprises
              et se connecter à des opportunités à travers le Congo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3">
                  Créer un Compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 px-8 py-3">
                  En Savoir Plus
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
