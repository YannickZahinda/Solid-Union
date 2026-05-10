import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Eye,
  Heart,
  MessageSquare,
  Package,
  DollarSign,
  User,
  Calendar,
  Phone,
  Send,
  X,
  Check,
  Lock,
} from "lucide-react";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionModal from "@/components/subscription/SubscriptionModal";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  is_offered: boolean;
  location: string;
  images: string[];
  stock: number;
  negotiable: boolean;
  condition: string;
  tags: string[];
  created_at: string;
  category_id: string;
  user_id: string;
  seller?: {
    full_name: string;
    avatar_url: string;
    city: string;
    phone: string;
  };
  category?: {
    name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("any");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOfferedOnly, setShowOfferedOnly] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const { isSubscribed, refetch: refetchSub } = useSubscription();

  const priceRanges = [
    { label: "Tous les prix", value: "any" },
    { label: "Moins de 50$", value: "under-50" },
    { label: "50$ - 200$", value: "50-200" },
    { label: "200$ - 500$", value: "200-500" },
    { label: "500$ - 1000$", value: "500-1000" },
    { label: "Plus de 1000$", value: "over-1000" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFavorites();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          seller:profiles!user_id(full_name, avatar_url, city, phone),
          category:categories(name, icon)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "product")
      .order("name");

    if (data) setCategories(data);
  };

  const fetchFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .eq("listing_type", "product");

    if (data) {
      setFavorites(new Set(data.map((item) => item.listing_id)));
    }
  };

  const toggleFavorite = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      if (favorites.has(productId)) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", productId)
          .eq("listing_type", "product");

        if (error) throw error;
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast({
          title: "Retiré des favoris",
          description: "Produit retiré de vos favoris",
        });
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: productId,
          listing_type: "product",
        });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(productId));
        toast({
          title: "Ajouté aux favoris",
          description: "Produit ajouté à vos favoris",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || product.category_id === selectedCategory;

    let matchesPrice = true;
    if (priceRange !== "any") {
      switch (priceRange) {
        case "under-50":
          matchesPrice = product.price < 50;
          break;
        case "50-200":
          matchesPrice = product.price >= 50 && product.price <= 200;
          break;
        case "200-500":
          matchesPrice = product.price >= 200 && product.price <= 500;
          break;
        case "500-1000":
          matchesPrice = product.price >= 500 && product.price <= 1000;
          break;
        case "over-1000":
          matchesPrice = product.price > 1000;
          break;
      }
    }

    const matchesOffered = !showOfferedOnly || product.is_offered === true;

    return matchesSearch && matchesCategory && matchesPrice && matchesOffered;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedProduct || !messageContent.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour envoyer un message",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase.rpc("send_message", {
        p_receiver_id: selectedProduct.user_id,
        p_content: messageContent,
        p_listing_id: selectedProduct.id,
        p_listing_type: "product",
      });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

      setMessageContent("");
      setIsMessageDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement des produits...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Découvrez des Produits Incroyables
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
              Trouvez des produits de qualité auprès de vendeurs de confiance à
              travers le Congo
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des produits..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{category.icon}</span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Fourchette de prix" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowOfferedOnly((v) => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                  showOfferedOnly
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-muted bg-background text-muted-foreground hover:border-green-400"
                }`}
              >
                🎁{" "}
                {showOfferedOnly ? "Dons uniquement ✓" : "Voir les dons gratuits"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "Produit Trouvé"
                : "Produits Trouvés"}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setPriceRange("any");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-muted-foreground">
                Aucun produit ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="card-elevated group overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={
                        product.images?.[0] ||
                        `https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop`
                      }
                      alt={product.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.has(product.id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-500"
                        }`}
                      />
                    </button>
                    {product.is_offered ? (
                      <Badge className="absolute top-2 left-2 bg-green-500 text-white">
                        🎁 Offert
                      </Badge>
                    ) : product.negotiable ? (
                      <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                        Prix Négociable
                      </Badge>
                    ) : null}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      <div className="flex flex-col items-end">
                        {product.is_offered ? (
                          <span className="text-xl font-bold text-green-600">
                            GRATUIT
                          </span>
                        ) : (
                          <span className="text-xl font-bold text-secondary">
                            {formatPrice(product.price)}
                          </span>
                        )}
                        {product.stock > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {product.stock} en stock
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {product.location}
                      </div>
                      {product.category && (
                        <Badge variant="outline" className="flex items-center">
                          <span className="mr-1">{product.category.icon}</span>
                          {product.category.name}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {product.seller?.avatar_url ? (
                          <img
                            src={product.seller.avatar_url}
                            alt={product.seller.full_name}
                            className="h-6 w-6 rounded-full mr-2"
                          />
                        ) : (
                          <User className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {product.seller?.full_name || "Vendeur"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(product)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedProduct.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedProduct.category?.name} •{" "}
                  {formatDate(selectedProduct.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-4">
                  <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                    <img
                      src={
                        selectedProduct.images?.[0] ||
                        `https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&fit=crop`
                      }
                      alt={selectedProduct.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {selectedProduct.images &&
                    selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.images
                          .slice(0, 4)
                          .map((image, index) => (
                            <div
                              key={index}
                              className="h-20 rounded-md overflow-hidden"
                            >
                              <img
                                src={image}
                                alt={`${selectedProduct.title} ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Prix:</span>
                        <span className="ml-2 text-xl font-bold text-secondary">
                          {formatPrice(selectedProduct.price)}
                        </span>
                      </div>
                      {selectedProduct.negotiable && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Check className="h-3 w-3 mr-1" />
                          Prix négociable
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Stock:</span>
                        <span className="ml-2">
                          {selectedProduct.stock > 0 ? (
                            <span className="text-green-600 font-semibold">
                              {selectedProduct.stock} disponible(s)
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              Rupture de stock
                            </span>
                          )}
                        </span>
                      </div>
                      {selectedProduct.condition && (
                        <div className="text-sm text-muted-foreground">
                          État:{" "}
                          {selectedProduct.condition === "new"
                            ? "Neuf"
                            : selectedProduct.condition === "used"
                            ? "Occasion"
                            : "Reconditionné"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Localisation:</span>
                      <span className="ml-2">{selectedProduct.location}</span>
                    </div>
                    {selectedProduct.seller?.city && (
                      <div className="text-sm text-muted-foreground pl-6">
                        Ville: {selectedProduct.seller.city}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seller Info */}
                  {selectedProduct.seller && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        Informations du vendeur
                      </h4>
                      <div className="flex items-center gap-3 mb-3">
                        {selectedProduct.seller.avatar_url ? (
                          <img
                            src={selectedProduct.seller.avatar_url}
                            alt={selectedProduct.seller.full_name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {selectedProduct.seller.full_name}
                          </div>
                          {selectedProduct.seller.city && (
                            <div className="text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {selectedProduct.seller.city}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedProduct.seller.phone && (
                        <div className="mt-2">
                          {isSubscribed ? (
                            <a
                              href={`tel:${selectedProduct.seller.phone}`}
                              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              <Phone className="h-4 w-4" />
                              {selectedProduct.seller.phone}
                            </a>
                          ) : (
                            <button
                              onClick={() => setShowSubModal(true)}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 hover:bg-amber-100 transition-colors w-full"
                            >
                              <Lock className="h-3.5 w-3.5 shrink-0" />
                              <span className="flex-1 text-left">
                                Voir le numéro — Abonnement requis
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsMessageDialogOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le vendeur
                </Button>
                <Button
                  onClick={() => navigate(`/create-listing`)}
                  className="btn-hero"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Vendre un produit similaire
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer un message</DialogTitle>
            <DialogDescription>
              Contactez {selectedProduct?.seller?.full_name || "le vendeur"} au
              sujet de "{selectedProduct?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                placeholder="Bonjour, je suis intéressé par votre produit..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Soyez clair et précis dans votre demande
              </p>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={
                      selectedProduct.images?.[0] ||
                      `https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&fit=crop`
                    }
                    alt={selectedProduct.title}
                    className="h-12 w-12 rounded object-cover"
                  />
                  <div>
                    <div className="font-medium line-clamp-1">
                      {selectedProduct.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(selectedProduct.price)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMessageDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendingMessage || !messageContent.trim()}
              className="btn-hero"
            >
              {sendingMessage ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        onSuccess={() => {
          setShowSubModal(false);
          refetchSub();
        }}
      />
    </Layout>
  );
};

export default Products;
