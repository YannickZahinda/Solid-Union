import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Eye, Heart } from "lucide-react";

// Dummy data for products
const dummyProducts = [
  {
    id: 1,
    title: "iPhone 13 Pro Max",
    description: "Excellent condition, barely used. Comes with original box and charger.",
    price: 1200,
    category: "Electronics",
    location: "Kinshasa",
    seller: "Jean Mukendi",
    image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c1?w=400",
    featured: true
  },
  {
    id: 2,
    title: "Traditional Congolese Masks",
    description: "Authentic handcrafted masks from local artisans. Perfect for decoration.",
    price: 45,
    category: "Art & Crafts",
    location: "Lubumbashi",
    seller: "Marie Kabila",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    featured: false
  },
  {
    id: 3,
    title: "Coffee Beans - Premium Quality",
    description: "Fresh coffee beans from Kivu region. Organic and fair trade certified.",
    price: 25,
    category: "Food & Beverages",
    location: "Goma",
    seller: "Pierre Nzeza",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
    featured: true
  },
  {
    id: 4,
    title: "Laptop Dell Inspiron 15",
    description: "Perfect for work and studies. 8GB RAM, 256GB SSD, Windows 11.",
    price: 650,
    category: "Electronics",
    location: "Kinshasa",
    seller: "Emmanuel Tshisekedi",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    featured: false
  },
  {
    id: 5,
    title: "Handwoven Baskets",
    description: "Beautiful traditional baskets made by local craftswomen.",
    price: 30,
    category: "Art & Crafts",
    location: "Bukavu",
    seller: "Esperance Mbuyi",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    featured: false
  },
  {
    id: 6,
    title: "Solar Panel Kit",
    description: "200W solar panel kit with battery and inverter. Perfect for homes.",
    price: 450,
    category: "Electronics",
    location: "Mbuji-Mayi",
    seller: "Joseph Kasongo",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
    featured: true
  }
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const categories = ["Electronics", "Art & Crafts", "Food & Beverages", "Clothing", "Home & Garden"];
  const priceRanges = ["Under $50", "$50 - $200", "$200 - $500", "Over $500"];

  const filteredProducts = dummyProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (priceRange) {
      switch (priceRange) {
        case "Under $50":
          matchesPrice = product.price < 50;
          break;
        case "$50 - $200":
          matchesPrice = product.price >= 50 && product.price <= 200;
          break;
        case "$200 - $500":
          matchesPrice = product.price >= 200 && product.price <= 500;
          break;
        case "Over $500":
          matchesPrice = product.price > 500;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-[image:var(--gradient-primary)] text-primary-foreground py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Find quality products from trusted sellers across Congo
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Price</SelectItem>
                  {priceRanges.map(range => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredProducts.length} Products Found
            </h2>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="card-elevated group overflow-hidden">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                  <button className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    <span className="text-xl font-bold text-secondary">
                      ${product.price}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {product.location}
                    </div>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      by {product.seller}
                    </span>
                    <Button size="sm" className="btn-hero">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;