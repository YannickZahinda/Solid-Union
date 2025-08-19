import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import heroFun from "@/assets/hero-fun.png";

const About = () => {
  useEffect(() => {
    document.title = "About SolidUnion | Community & Opportunities in Congo";
    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = "Learn about SolidUnion — connecting buyers, sellers, landlords, and communities across the DRC.";

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/about`;
  }, []);

  return (
    <Layout>
      <header className="bg-[image:var(--gradient-subtle)] text-foreground">
        <div className="container-max section-padding text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About SolidUnion</h1>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
            SolidUnion is a community-powered platform connecting buyers, sellers, landlords, job seekers, and event organizers across the Democratic Republic of Congo.
            We celebrate entrepreneurship, enable access to opportunities, and support social causes that uplift our communities.
          </p>
          <div className="mt-8">
            <img
              src={heroFun}
              alt="Illustration of community and commerce in the DRC"
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
              <h2 className="text-xl font-semibold mb-2">Community & Inclusion</h2>
              <p className="text-muted-foreground">
                We bring people together — residents, artisans, and businesses — to share services, products, and opportunities in a safe and friendly marketplace.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Jobs & Opportunities</h2>
              <p className="text-muted-foreground">
                Discover jobs and freelance missions while building your professional network across the DRC.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Properties & Housing</h2>
              <p className="text-muted-foreground">
                From studios to family homes, SolidUnion helps you find trusted rentals and connect with landlords.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">Businesses & Events</h2>
              <p className="text-muted-foreground">
                Promote your products, showcase cultural events, and grow your business with a supportive community.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="container-max text-center mt-12">
          <Badge className="bg-secondary text-secondary-foreground">Our Motto</Badge>
          <h3 className="text-2xl font-semibold mt-4">Together, we build a stronger Congo.</h3>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Join us in empowering local talent, celebrating culture, and creating sustainable growth across the DRC.
          </p>
        </section>
      </main>
    </Layout>
  );
};

export default About;
