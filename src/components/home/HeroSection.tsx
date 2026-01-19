import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, MapPin } from "lucide-react";
import heroFun from "@/assets/hero-fun.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground">
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative container-max">
        <div className="section-padding text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary mb-8">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                Service au Congo • RDC
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="block">SolidUnion</span>
              <span className="block text-secondary text-2xl md:text-3xl lg:text-4xl font-medium mt-2">
                Connecter acheteurs, vendeurs, propriétaires et opportunités à
                travers le Congo
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Une plateforme gratuite qui aide les personnes en RDC à trouver
              des services, emplois, biens immobiliers, événements, et
              opportunités tout en soutenant l'entrepreneuriat et les causes
              sociales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10">
              <Link to="/signup">
                <Button className="btn-secondary px-8 py-4 text-lg">
                  S'inscrire Gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button
                  variant="outline"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 text-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Explorer les Annonces
                </Button>
              </Link>
            </div>

            <div className="mb-16">
              <img
                src={heroFun}
                alt="Illustration de la communauté et du commerce SolidUnion"
                className="mx-auto w-full max-w-3xl rounded-2xl shadow-[var(--shadow-elegant)]"
                loading="lazy"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  500+
                </div>
                <div className="text-primary-foreground/80">
                  Annonces Actives
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  200+
                </div>
                <div className="text-primary-foreground/80">
                  Utilisateurs Inscrits
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  50+
                </div>
                <div className="text-primary-foreground/80">
                  Biens Immobiliers
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">
                  25+
                </div>
                <div className="text-primary-foreground/80">
                  Offres d'Emploi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-20 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl"></div>
    </section>
  );
};

export default HeroSection;
