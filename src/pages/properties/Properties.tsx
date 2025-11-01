import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Eye, Heart, Bed, Bath, Square } from "lucide-react";

// Dummy data for properties
const dummyProperties = [
  {
    id: 1,
    title: "Modern 3BR Apartment in Gombe",
    description: "Spacious apartment with stunning city views. Fully furnished with modern amenities.",
    price: 800,
    type: "Apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    location: "Gombe, Kinshasa",
    landlord: "Robert Mbuyi",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    featured: true
  },
  {
    id: 2,
    title: "Cozy Studio in Kinshasa Center",
    description: "Perfect for young professionals. Close to business district and amenities.",
    price: 350,
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    location: "Centre-ville, Kinshasa",
    landlord: "Grace Lumingu",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
    featured: false
  },
  {
    id: 3,
    title: "Family House with Garden",
    description: "Large family home with private garden. Safe neighborhood, near schools.",
    price: 1200,
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    location: "Ma Campagne, Kinshasa",
    landlord: "Paul Kabongo",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
    featured: true
  },
  {
    id: 4,
    title: "Commercial Office Space",
    description: "Prime location for businesses. Modern facilities and parking available.",
    price: 1500,
    type: "Commercial",
    bedrooms: 0,
    bathrooms: 2,
    area: 80,
    location: "Gombe, Kinshasa",
    landlord: "Marie Kitoko",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
    featured: false
  },
  {
    id: 5,
    title: "Lakeside Villa in Lubumbashi",
    description: "Luxury villa with lake access. Perfect for families or executive housing.",
    price: 2000,
    type: "Villa",
    bedrooms: 5,
    bathrooms: 4,
    area: 350,
    location: "Lubumbashi",
    landlord: "Jean-Claude Monga",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400",
    featured: true
  },
  {
    id: 6,
    title: "Student Housing Near University",
    description: "Affordable housing for students. Shared facilities, safe environment.",
    price: 200,
    type: "Shared",
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    location: "Lemba, Kinshasa",
    landlord: "Anne Nkunku",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400",
    featured: false
  }
];

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [minBedrooms, setMinBedrooms] = useState("any");

  const propertyTypes = ["Apartment", "House", "Studio", "Villa", "Commercial", "Shared"];
  const priceRanges = ["Under $400", "$400 - $800", "$800 - $1500", "Over $1500"];
  const bedroomOptions = ["1+", "2+", "3+", "4+"];

  const filteredProperties = dummyProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || property.type === selectedType;
    
    let matchesPrice = true;
    if (priceRange && priceRange !== "any") {
      switch (priceRange) {
        case "Under $400":
          matchesPrice = property.price < 400;
          break;
        case "$400 - $800":
          matchesPrice = property.price >= 400 && property.price <= 800;
          break;
        case "$800 - $1500":
          matchesPrice = property.price >= 800 && property.price <= 1500;
          break;
        case "Over $1500":
          matchesPrice = property.price > 1500;
          break;
      }
    }
    
    let matchesBedrooms = true;
    if (minBedrooms && minBedrooms !== "any") {
      const minBeds = parseInt(minBedrooms.replace("+", ""));
      matchesBedrooms = property.bedrooms >= minBeds;
    }
    
    return matchesSearch && matchesType && matchesPrice && matchesBedrooms;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-[image:var(--gradient-success)] text-success-foreground py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Perfect Home
            </h1>
            <p className="text-xl text-success-foreground/90 max-w-3xl mx-auto">
              Discover quality rental properties from trusted landlords across Congo
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-5xl mx-auto bg-background/95 backdrop-blur text-black rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search location or property..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Price</SelectItem>
                  {priceRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minBedrooms} onValueChange={setMinBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {bedroomOptions.map(option => (
                    <SelectItem key={option} value={option}>{option} Bedrooms</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredProperties.length} Properties Available
            </h2>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="card-elevated group overflow-hidden">
                <div className="md:flex">
                  <div className="relative md:w-1/2">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 md:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {property.featured && (
                      <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                        Featured
                      </Badge>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <CardContent className="p-6 md:w-1/2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {property.title}
                      </h3>
                      <div className="text-right ml-2">
                        <span className="text-2xl font-bold text-success">
                          ${property.price}
                        </span>
                        <span className="text-sm text-muted-foreground block">
                          /month
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.location}
                      </div>
                      <Badge variant="outline">{property.type}</Badge>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          {property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {property.area}m²
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        by {property.landlord}
                      </span>
                      <Button size="sm" className="btn-hero">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Properties;