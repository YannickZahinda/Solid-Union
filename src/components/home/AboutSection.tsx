import { Users, Briefcase, Home, Calendar, Heart, TrendingUp } from "lucide-react";

const AboutSection = () => {
  const features = [
    {
      icon: Users,
      title: "Community Building",
      description: "Connect with local entrepreneurs, professionals, and community members across Congo."
    },
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Find employment opportunities and connect talented individuals with employers."
    },
    {
      icon: Home,
      title: "Real Estate",
      description: "Discover rental properties and real estate opportunities throughout the DRC."
    },
    {
      icon: Calendar,
      title: "Events & Networking",
      description: "Stay updated on local events, workshops, and networking opportunities."
    },
    {
      icon: Heart,
      title: "Social Initiatives",
      description: "Support and participate in community-driven social causes and projects."
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Help local businesses thrive through increased visibility and customer connections."
    }
  ];

  return (
    <section className="section-padding bg-muted/50">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About <span className="text-gradient">SolidUnion</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're building more than just a marketplace. SolidUnion is a comprehensive platform 
            designed to strengthen communities, support local businesses, and create opportunities 
            for economic growth throughout the Democratic Republic of Congo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>

        {/* Mission Statement */}
        <div className="mt-20 text-center">
          <div className="card-gradient p-12 rounded-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h3>
            <p className="text-xl text-primary-foreground/90 max-w-4xl mx-auto leading-relaxed">
              To empower the people of Congo by creating a unified platform that connects 
              communities, facilitates commerce, and opens doors to new opportunities. 
              Together, we're building the foundation for a more prosperous and connected DRC.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;