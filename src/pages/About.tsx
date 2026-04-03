import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import heroFun from "@/assets/hero-fun.png";

const About = () => {
  useEffect(() => {
    document.title = "À propos de SolidUnion | Communauté & Opportunités au Congo";
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Découvrez SolidUnion — la plateforme qui connecte acheteurs, vendeurs, propriétaires et communautés à travers la RDC.";

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/a-propos`;
  }, []);

  return (
    <Layout>
      <header className="bg-[image:var(--gradient-subtle)] text-foreground">
        <div className="container-max section-padding text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">À propos de SolidUnion</h1>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            SolidUnion est une plateforme communautaire qui connecte acheteurs, vendeurs, propriétaires, chercheurs d'emploi et organisateurs d'événements à travers la République Démocratique du Congo.
            Nous célébrons l'entrepreneuriat, facilitons l'accès aux opportunités et soutenons les causes sociales qui renforcent nos communautés.
          </p>
          <div className="mt-8">
            <img
              src={heroFun}
              alt="Illustration de la communauté et du commerce en RDC"
              className="mx-auto w-full max-w-3xl rounded-2xl shadow-[var(--shadow-elegant)]"
              loading="lazy"
            />
          </div>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-max grid gap-6 md:grid-cols-2">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Communauté & Inclusion</h2>
              <p className="text-muted-foreground">
                Nous rassemblons les habitants, artisans et entreprises pour partager services, produits et opportunités dans un marché sécurisé et convivial.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Emplois & Opportunités</h2>
              <p className="text-muted-foreground">
                Découvrez des emplois et des missions freelance tout en développant votre réseau professionnel à travers la RDC.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Propriétés & Logements</h2>
              <p className="text-muted-foreground">
                Des studios aux maisons familiales, SolidUnion vous aide à trouver des locations de confiance et à entrer en contact avec les propriétaires.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Entreprises & Événements</h2>
              <p className="text-muted-foreground">
                Promouvez vos produits, mettez en valeur les événements culturels et développez votre entreprise grâce à une communauté solidaire.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="container-max text-center mt-12">
          <Badge className="bg-secondary text-secondary-foreground">Notre devise</Badge>
          <h3 className="text-2xl font-semibold mt-4">Ensemble, construisons un Congo plus fort.</h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Rejoignez-nous pour soutenir les talents locaux, célébrer notre culture et créer une croissance durable à travers la RDC.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default About;