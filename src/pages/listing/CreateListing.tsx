import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PlusCircle,
  Upload,
  X,
  DollarSign,
  MapPin,
  Home,
  Tag,
  Hash,
  Package,
  Building2,
  Ruler,
  Bath,
  BedDouble,
  Sofa,
  Smartphone,
  Car,
  Shirt,
  Briefcase,
  Wrench,
  Book,
  Gamepad,
  Music,
  Camera,
  Laptop,
  Watch,
  Gift,
  Heart,
  ShoppingBag,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  type: "product" | "property";
  icon: string;
  parent_id?: string;
}

interface ListingFormData {
  // Champs communs
  category_id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  images: File[];
  imagePreviews: string[];
  tags: string[];
  contact_phone?: string;

  // Champs produits
  stock?: string;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  color?: string;
  warranty?: string;
  
  // Champs propriétés
  bedrooms?: string;
  bathrooms?: string;
  area_sqft?: string;
  furnished?: boolean;
  property_type?: string;
  floor?: string;
  total_floors?: string;
  year_built?: string;
  parking?: boolean;
  garden?: boolean;
  swimming_pool?: boolean;
}

const CreerAnnonce = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isProduct, setIsProduct] = useState<boolean>(true);

  const [formData, setFormData] = useState<ListingFormData>({
    category_id: "",
    title: "",
    description: "",
    price: "",
    location: "",
    images: [],
    imagePreviews: [],
    tags: [],
    contact_phone: "",

    // Produits
    stock: "1",
    negotiable: false,
    condition: "new",
    brand: "",
    model: "",
    color: "",
    warranty: "",

    // Propriétés
    bedrooms: "1",
    bathrooms: "1",
    area_sqft: "",
    furnished: false,
    property_type: "apartment",
    floor: "",
    total_floors: "",
    year_built: "",
    parking: false,
    garden: false,
    swimming_pool: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Détecter si la catégorie sélectionnée est un produit ou une propriété
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find(c => c.id === formData.category_id);
      if (category) {
        setSelectedCategory(category);
        setIsProduct(category.type === "product");
      }
    } else {
      setSelectedCategory(null);
    }
  }, [formData.category_id, categories]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 10) {
      toast({
        title: "Trop d'images",
        description: "Maximum 10 images autorisées",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...formData.images, ...files];
    const newPreviews = [...formData.imagePreviews];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newImages.length) {
          setFormData((prev) => ({
            ...prev,
            images: newImages,
            imagePreviews: newPreviews,
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews,
    }));
  };

  const addTag = (tag: string) => {
    if (
      tag.trim() &&
      !formData.tags.includes(tag.trim()) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag.trim()] }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour créer une annonce",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // Upload images to Supabase Storage
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("listings").getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      // Préparer les données de base communes
      const baseData: any = {
        user_id: user.id,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        location: formData.location,
        images: imageUrls,
        tags: formData.tags,
        contact_phone: formData.contact_phone || null,
      };

      // Ajouter les champs spécifiques au type
      if (isProduct) {
        const productData = {
          ...baseData,
          stock: parseInt(formData.stock || "1"),
          negotiable: formData.negotiable || false,
          condition: formData.condition || "new",
          brand: formData.brand || null,
          model: formData.model || null,
          color: formData.color || null,
          warranty: formData.warranty || null,
        };

        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;

        toast({
          title: "Produit publié !",
          description: "Votre produit a été publié avec succès.",
        });
      } else {
        const propertyData = {
          ...baseData,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : null,
          furnished: formData.furnished || false,
          property_type: formData.property_type || "apartment",
          floor: formData.floor || null,
          total_floors: formData.total_floors || null,
          year_built: formData.year_built || null,
          parking: formData.parking || false,
          garden: formData.garden || false,
          swimming_pool: formData.swimming_pool || false,
          availability: "available",
        };

        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);
        if (error) throw error;

        toast({
          title: "Propriété publiée !",
          description: "Votre propriété a été publiée avec succès.",
        });
      }

      navigate("/my-listings");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur lors de la création",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Obtenir l'icône de la catégorie
  const getCategoryIcon = (icon: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      "📱": <Smartphone className="h-4 w-4" />,
      "🚗": <Car className="h-4 w-4" />,
      "👕": <Shirt className="h-4 w-4" />,
      "💼": <Briefcase className="h-4 w-4" />,
      "🛠️": <Wrench className="h-4 w-4" />,
      "📚": <Book className="h-4 w-4" />,
      "🎮": <Gamepad className="h-4 w-4" />,
      "🎵": <Music className="h-4 w-4" />,
      "📷": <Camera className="h-4 w-4" />,
      "💻": <Laptop className="h-4 w-4" />,
      "⌚": <Watch className="h-4 w-4" />,
      "🎁": <Gift className="h-4 w-4" />,
      "❤️": <Heart className="h-4 w-4" />,
      "🛒": <ShoppingBag className="h-4 w-4" />,
      "🏠": <Home className="h-4 w-4" />,
      "🏢": <Building2 className="h-4 w-4" />,
    };
    return iconMap[icon] || <Package className="h-4 w-4" />;
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Créer une annonce</h1>
          <p className="text-muted-foreground">
            Publiez ce que vous souhaitez vendre ou louer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Commencez par sélectionner une catégorie et remplir les informations essentielles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Catégorie - Premier champ important */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Catégorie *
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category_id: value }))
                  }
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      Produits
                    </div>
                    {categories
                      .filter(c => c.type === "product")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.icon)}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">
                      Propriétés
                    </div>
                    {categories
                      .filter(c => c.type === "property")
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category.icon)}
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ Vous publiez dans la catégorie : {selectedCategory.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder={
                    isProduct
                      ? "Ex: iPhone 15 Pro 256GB - Neuf sous garantie"
                      : "Ex: Appartement 3 pièces au centre-ville avec vue"
                  }
                  required
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Soyez précis et descriptif pour attirer plus d'acheteurs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder={
                    isProduct
                      ? "Décrivez votre produit : état, caractéristiques, accessoires inclus, raison de la vente..."
                      : "Décrivez votre propriété : quartier, commodités à proximité, transport, étage, exposition..."
                  }
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    Prix *
                  </Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="0.00"
                      required
                      className="pl-7"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      €
                    </span>
                  </div>
                  {!isProduct && (
                    <p className="text-xs text-muted-foreground">
                      Indiquez le prix par mois pour une location
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Localisation *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Ville, quartier"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contact_phone: e.target.value,
                    }))
                  }
                  placeholder="+243 XXX XXX XXX (optionnel mais recommandé)"
                />
                <p className="text-xs text-muted-foreground">
                  Visible uniquement par les acheteurs intéressés
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Champs spécifiques selon la catégorie */}
          {selectedCategory && (
            isProduct ? (
              // Formulaire pour les PRODUITS
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Détails du produit
                  </CardTitle>
                  <CardDescription>
                    Informations spécifiques à votre produit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="condition">État</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, condition: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neuf (jamais utilisé)</SelectItem>
                          <SelectItem value="used">Occasion (bon état)</SelectItem>
                          <SelectItem value="refurbished">Reconditionné</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantité disponible</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="1"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, stock: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marque</Label>
                      <Input
                        id="brand"
                        value={formData.brand || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, brand: e.target.value }))
                        }
                        placeholder="Ex: Apple, Samsung, Nike..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Modèle</Label>
                      <Input
                        id="model"
                        value={formData.model || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, model: e.target.value }))
                        }
                        placeholder="Ex: iPhone 15 Pro, Air Max..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Couleur</Label>
                      <Input
                        id="color"
                        value={formData.color || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, color: e.target.value }))
                        }
                        placeholder="Ex: Noir, Blanc, Bleu..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="warranty">Garantie</Label>
                      <Input
                        id="warranty"
                        value={formData.warranty || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, warranty: e.target.value }))
                        }
                        placeholder="Ex: 1 an, 6 mois..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="negotiable"
                      checked={formData.negotiable}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, negotiable: checked }))
                      }
                    />
                    <Label htmlFor="negotiable">Prix négociable</Label>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Formulaire pour les PROPRIÉTÉS
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Détails de la propriété
                  </CardTitle>
                  <CardDescription>
                    Informations spécifiques à votre bien immobilier
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="property_type" className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        Type
                      </Label>
                      <Select
                        value={formData.property_type}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, property_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">Appartement</SelectItem>
                          <SelectItem value="house">Maison</SelectItem>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="commercial">Local commercial</SelectItem>
                          <SelectItem value="land">Terrain</SelectItem>
                          <SelectItem value="townhouse">Maison de ville</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bedrooms" className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" />
                        Chambres
                      </Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        min="0"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))
                        }
                        placeholder="Nombre de chambres"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bathrooms" className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        Salles de bain
                      </Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        min="0"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))
                        }
                        placeholder="Nombre de salles de bain"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area_sqft" className="flex items-center gap-1">
                        <Ruler className="h-4 w-4" />
                        Surface (m²)
                      </Label>
                      <Input
                        id="area_sqft"
                        type="number"
                        min="0"
                        value={formData.area_sqft}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, area_sqft: e.target.value }))
                        }
                        placeholder="Surface habitable"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year_built">Année de construction</Label>
                      <Input
                        id="year_built"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={formData.year_built || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, year_built: e.target.value }))
                        }
                        placeholder="Ex: 2020"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor">Étage</Label>
                      <Input
                        id="floor"
                        value={formData.floor || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, floor: e.target.value }))
                        }
                        placeholder="Ex: 3ème étage"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="total_floors">Nombre total d'étages</Label>
                      <Input
                        id="total_floors"
                        value={formData.total_floors || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, total_floors: e.target.value }))
                        }
                        placeholder="Ex: 5 étages"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Équipements et commodités</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="furnished"
                          checked={formData.furnished}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, furnished: checked }))
                          }
                        />
                        <Label htmlFor="furnished" className="flex items-center gap-1">
                          <Sofa className="h-4 w-4" />
                          Meublé
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="parking"
                          checked={formData.parking}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, parking: checked }))
                          }
                        />
                        <Label htmlFor="parking">Parking</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="garden"
                          checked={formData.garden}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, garden: checked }))
                          }
                        />
                        <Label htmlFor="garden">Jardin</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="swimming_pool"
                          checked={formData.swimming_pool}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, swimming_pool: checked }))
                          }
                        />
                        <Label htmlFor="swimming_pool">Piscine</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Téléchargez jusqu'à 10 photos (la première photo sera l'image principale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {formData.imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < 10 && (
                    <label className="cursor-pointer">
                      <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Ajouter une photo
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {formData.images.length} / 10 photos téléchargées
                </p>
                <p className="text-xs text-muted-foreground">
                  💡 Astuce : Utilisez des photos claires et bien éclairées pour attirer plus d'acheteurs
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Mots-clés
              </CardTitle>
              <CardDescription>
                Ajoutez des mots-clés pour que les acheteurs trouvent plus facilement votre annonce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-primary/70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    id="tagInput"
                    placeholder="Ajouter un mot-clé (ex: électronique, meubles, urgent)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById(
                        "tagInput",
                      ) as HTMLInputElement;
                      addTag(input.value);
                      input.value = "";
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Appuyez sur Entrée ou cliquez sur Ajouter. Maximum 10 tags.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Boutons de soumission */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="min-w-32 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={
                loading ||
                !formData.category_id ||
                !formData.title ||
                !formData.description ||
                !formData.price ||
                !formData.location
              }
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Publication...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Publier l'annonce
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreerAnnonce;