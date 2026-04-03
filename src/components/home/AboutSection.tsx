import {
  Users,
  Briefcase,
  Home,
  Calendar,
  Heart,
  TrendingUp,
} from "lucide-react";
import FeaturesSection from "./FeaturesSection";

const AboutSection = () => {
  const features = [
    {
      icon: Users,
      title: "Construction Communautaire",
      description:
        "Connectez-vous avec des entrepreneurs, professionnels et membres de la communauté locale à travers le Congo.",
    },
    {
      icon: Briefcase,
      title: "Opportunités d'Emploi",
      description:
        "Trouvez des offres d'emploi et mettez en relation des talents avec des employeurs.",
    },
    {
      icon: Home,
      title: "Immobilier",
      description:
        "Découvrez des biens locatifs et des opportunités immobilières dans toute la RDC.",
    },
    {
      icon: Calendar,
      title: "Événements & Réseautage",
      description:
        "Restez informé des événements locaux, ateliers et opportunités de réseautage.",
    },
    {
      icon: Heart,
      title: "Initiatives Sociales",
      description:
        "Soutenez et participez à des projets et causes sociales portés par la communauté.",
    },
    {
      icon: TrendingUp,
      title: "Croissance des Entreprises",
      description:
        "Aidez les entreprises locales à prospérer grâce à une meilleure visibilité et à des connexions clients.",
    },
  ];

  return (
    <section className="section-padding bg-muted/50">
      <div className="container-max">
        {/* <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            À propos de <span className="text-gradient">SolidUnion</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Nous construisons bien plus qu'une place de marché. SolidUnion est
            une plateforme complète conçue pour renforcer les communautés,
            soutenir les entreprises locales et créer des opportunités de
            croissance économique à travers la République Démocratique du Congo.
          </p>
        </div> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card-elevated p-8 text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div> */}
        <FeaturesSection />

        {/* Déclaration de Mission */}
        <div className="mt-20 text-center">
          <div className="card-gradient p-12 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              Notre Mission
            </h3>
            <p className="text-xl text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed">
              Autonomiser la population congolaise en créant une plateforme
              unifiée qui connecte les communautés, facilite le commerce et
              ouvre des portes vers de nouvelles opportunités. Ensemble, nous
              posons les fondations d'une RDC plus prospère et connectée.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
