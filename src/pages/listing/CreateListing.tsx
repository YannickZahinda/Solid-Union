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
  Calendar,
  Clock,
  Award,
  Globe,
  Mail,
  Phone,
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  FileText,
  Building,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  type: "product" | "property" | "job" | "service";
  icon: string;
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
  contact_email?: string;

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

  // Champs emplois
  company_name?: string;
  job_type?: string;
  salary_min?: string;
  salary_max?: string;
  salary_negotiable?: boolean;
  experience_level?: string;
  education_level?: string;
  skills?: string[];
  benefits?: string[];
  application_deadline?: string;
  is_remote?: boolean;
  application_url?: string;

  // Champs services
  price_type?: string;
  delivery_type?: string;
  duration?: string;
  experience_years?: string;
  certifications?: string[];
  languages?: string[];
  availability_start?: string;
  availability_end?: string;
}

const CreerAnnonce = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [listingType, setListingType] = useState<"product" | "property" | "job" | "service">("product");
  
  // États pour les inputs dynamiques
  const [skillsInput, setSkillsInput] = useState("");
  const [benefitsInput, setBenefitsInput] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [tagInput, setTagInput] = useState("");

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
    contact_email: "",

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

    // Emplois
    company_name: "",
    job_type: "full-time",
    salary_min: "",
    salary_max: "",
    salary_negotiable: false,
    experience_level: "entry",
    education_level: "bachelor",
    skills: [],
    benefits: [],
    application_deadline: "",
    is_remote: false,
    application_url: "",

    // Services
    price_type: "fixed",
    delivery_type: "both",
    duration: "",
    experience_years: "",
    certifications: [],
    languages: [],
    availability_start: "",
    availability_end: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Détecter le type de la catégorie sélectionnée
  useEffect(() => {
    if (formData.category_id) {
      const category = categories.find((c) => c.id === formData.category_id);
      if (category) {
        setSelectedCategory(category);
        setListingType(category.type);
      }
    } else {
      setSelectedCategory(null);
      setListingType("product");
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
    } else if (error) {
      console.error("Error fetching categories:", error);
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

  const addArrayItem = (
    field: "skills" | "benefits" | "certifications" | "languages",
    value: string,
  ) => {
    const currentArray = formData[field] || [];
    if (
      value.trim() &&
      !currentArray.includes(value.trim()) &&
      currentArray.length < 20
    ) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentArray, value.trim()],
      }));
    }
  };

  const removeArrayItem = (
    field: "skills" | "benefits" | "certifications" | "languages",
    item: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((i) => i !== item),
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
      // Upload images
      const imageUrls: string[] = [];
      for (const image of formData.images) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(filePath, image);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("listings").getPublicUrl(filePath);

        imageUrls.push(publicUrl);
      }

      const baseData: any = {
        user_id: user.id,
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        images: imageUrls,
        tags: formData.tags,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
      };

      // Insertion selon le type
      if (listingType === "product") {
        const productData = {
          ...baseData,
          price: parseFloat(formData.price),
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
        toast({ title: "✅ Produit publié !", description: "Votre produit a été publié avec succès." });
      } 
      else if (listingType === "property") {
        const propertyData = {
          ...baseData,
          price: parseFloat(formData.price),
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area_sqft: formData.area_sqft ? parseFloat(formData.area_sqft) : null,
          furnished: formData.furnished || false,
          property_type: formData.property_type || "apartment",
          floor: formData.floor || null,
          total_floors: formData.total_floors || null,
          year_built: formData.year_built ? parseInt(formData.year_built) : null,
          parking: formData.parking || false,
          garden: formData.garden || false,
          swimming_pool: formData.swimming_pool || false,
          availability: "available",
        };
        const { error } = await supabase.from("properties").insert([propertyData]);
        if (error) throw error;
        toast({ title: "🏠 Propriété publiée !", description: "Votre propriété a été publiée avec succès." });
      } 
      else if (listingType === "job") {
        const jobData = {
          ...baseData,
          company_name: formData.company_name || null,
          job_type: formData.job_type || "full-time",
          salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
          salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
          salary_negotiable: formData.salary_negotiable || false,
          experience_level: formData.experience_level || "entry",
          education_level: formData.education_level || "bachelor",
          skills: formData.skills || [],
          benefits: formData.benefits || [],
          application_deadline: formData.application_deadline || null,
          is_remote: formData.is_remote || false,
          application_url: formData.application_url || null,
          status: "active",
        };
        const { error } = await supabase.from("jobs").insert([jobData]);
        if (error) throw error;
        toast({ title: "💼 Offre d'emploi publiée !", description: "Votre offre d'emploi a été publiée avec succès." });
      } 
      else if (listingType === "service") {
        const serviceData = {
          ...baseData,
          price: parseFloat(formData.price),
          price_type: formData.price_type || "fixed",
          delivery_type: formData.delivery_type || "both",
          duration: formData.duration || null,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          certifications: formData.certifications || [],
          languages: formData.languages || [],
          availability_start: formData.availability_start || null,
          availability_end: formData.availability_end || null,
          status: "active",
        };
        const { error } = await supabase.from("services").insert([serviceData]);
        if (error) throw error;
        toast({ title: "🔧 Service publié !", description: "Votre service a été publié avec succès." });
      }

      navigate("/my-listings");
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "❌ Erreur lors de la création",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  // Helper to check if form is valid
  const isFormValid = () => {
    if (!formData.category_id) return false;
    if (!formData.title.trim()) return false;
    if (!formData.description.trim()) return false;
    if (!formData.price || parseFloat(formData.price) <= 0) return false;
    if (!formData.location.trim()) return false;
    return true;
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Créer une annonce</h1>
          <p className="text-muted-foreground">
            Publiez ce que vous souhaitez vendre, louer, ou proposer comme service ou offre d'emploi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Sélectionnez une catégorie et remplissez les informations essentielles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold">
                  Catégorie *
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, category_id: value }));
                  }}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">📦 Produits</div>
                    {categories.filter((c) => c.type === "product").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(category.icon)}
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">🏠 Immobilier</div>
                    {categories.filter((c) => c.type === "property").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">💼 Emplois</div>
                    {categories.filter((c) => c.type === "job").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground mt-2">🔧 Services</div>
                    {categories.filter((c) => c.type === "service").map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Vous publiez dans : {selectedCategory.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de votre annonce"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre annonce en détail..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                      required
                      className="pl-7"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                  </div>
                  {listingType === "property" && (
                    <p className="text-xs text-muted-foreground">Prix de vente ou loyer mensuel</p>
                  )}
                  {listingType === "service" && (
                    <p className="text-xs text-muted-foreground">Tarif de base pour votre service</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Ville, quartier"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Téléphone de contact
                  </Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={formData.contact_phone || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="Optionnel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email de contact
                  </Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ============================================ */}
          {/* SECTION PRODUITS - AFFICHÉE UNIQUEMENT POUR LES PRODUITS */}
          {/* ============================================ */}
          {selectedCategory && listingType === "product" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Détails du produit
                </CardTitle>
                <CardDescription>Informations spécifiques à votre produit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">État</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, condition: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">🆕 Neuf (jamais utilisé)</SelectItem>
                        <SelectItem value="used">🔄 Occasion (bon état)</SelectItem>
                        <SelectItem value="refurbished">🔧 Reconditionné</SelectItem>
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Marque</Label>
                    <Input
                      id="brand"
                      value={formData.brand || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      placeholder="Ex: Apple, Samsung, Nike..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Modèle</Label>
                    <Input
                      id="model"
                      value={formData.model || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      placeholder="Ex: Noir, Blanc, Bleu..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Garantie</Label>
                    <Input
                      id="warranty"
                      value={formData.warranty || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, warranty: e.target.value }))}
                      placeholder="Ex: 1 an, 6 mois..."
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, negotiable: checked }))}
                  />
                  <Label htmlFor="negotiable">💰 Prix négociable</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* SECTION PROPRIÉTÉS - AFFICHÉE UNIQUEMENT POUR L'IMMOBILIER */}
          {/* ============================================ */}
          {selectedCategory && listingType === "property" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Détails de la propriété
                </CardTitle>
                <CardDescription>Informations spécifiques à votre bien immobilier</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Type de bien</Label>
                    <Select
                      value={formData.property_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, property_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">🏢 Appartement</SelectItem>
                        <SelectItem value="house">🏠 Maison</SelectItem>
                        <SelectItem value="villa">🏛️ Villa</SelectItem>
                        <SelectItem value="commercial">🏪 Local commercial</SelectItem>
                        <SelectItem value="land">🌱 Terrain</SelectItem>
                        <SelectItem value="townhouse">🏘️ Maison de ville</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">🛏️ Chambres</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="0"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: e.target.value }))}
                      placeholder="Nombre de chambres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">🛁 Salles de bain</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="0"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: e.target.value }))}
                      placeholder="Nombre de salles de bain"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area_sqft">📐 Surface (m²)</Label>
                    <Input
                      id="area_sqft"
                      type="number"
                      min="0"
                      value={formData.area_sqft}
                      onChange={(e) => setFormData((prev) => ({ ...prev, area_sqft: e.target.value }))}
                      placeholder="Surface habitable"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year_built">📅 Année de construction</Label>
                    <Input
                      id="year_built"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.year_built || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, year_built: e.target.value }))}
                      placeholder="Ex: 2020"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floor">📍 Étage</Label>
                    <Input
                      id="floor"
                      value={formData.floor || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, floor: e.target.value }))}
                      placeholder="Ex: 3ème étage"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_floors">🏗️ Nombre total d'étages</Label>
                    <Input
                      id="total_floors"
                      value={formData.total_floors || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, total_floors: e.target.value }))}
                      placeholder="Ex: 5 étages"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>✨ Équipements et commodités</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="furnished"
                        checked={formData.furnished}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, furnished: checked }))}
                      />
                      <Label htmlFor="furnished">🛋️ Meublé</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="parking"
                        checked={formData.parking}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, parking: checked }))}
                      />
                      <Label htmlFor="parking">🅿️ Parking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="garden"
                        checked={formData.garden}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, garden: checked }))}
                      />
                      <Label htmlFor="garden">🌳 Jardin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="swimming_pool"
                        checked={formData.swimming_pool}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, swimming_pool: checked }))}
                      />
                      <Label htmlFor="swimming_pool">🏊 Piscine</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* SECTION EMPLOIS - AFFICHÉE UNIQUEMENT POUR LES OFFRES D'EMPLOI */}
          {/* ============================================ */}
          {selectedCategory && listingType === "job" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Détails de l'offre d'emploi
                </CardTitle>
                <CardDescription>Informations spécifiques au poste à pourvoir</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">🏢 Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job_type">📋 Type de contrat</Label>
                    <Select
                      value={formData.job_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, job_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">💼 CDI - Temps plein</SelectItem>
                        <SelectItem value="part-time">⏰ CDD - Temps partiel</SelectItem>
                        <SelectItem value="freelance">🎯 Freelance / Indépendant</SelectItem>
                        <SelectItem value="internship">📚 Stage</SelectItem>
                        <SelectItem value="apprenticeship">🤝 Alternance</SelectItem>
                        <SelectItem value="remote">🏠 Télétravail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">⭐ Niveau d'expérience requis</Label>
                    <Select
                      value={formData.experience_level}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, experience_level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">🌱 Débutant (0-2 ans)</SelectItem>
                        <SelectItem value="junior">📈 Junior (2-4 ans)</SelectItem>
                        <SelectItem value="senior">🏆 Senior (5-8 ans)</SelectItem>
                        <SelectItem value="expert">👑 Expert (8+ ans)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary_min">💰 Salaire minimum (€/mois)</Label>
                    <Input
                      id="salary_min"
                      type="number"
                      min="0"
                      value={formData.salary_min}
                      onChange={(e) => setFormData((prev) => ({ ...prev, salary_min: e.target.value }))}
                      placeholder="Ex: 2500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary_max">💰 Salaire maximum (€/mois)</Label>
                    <Input
                      id="salary_max"
                      type="number"
                      min="0"
                      value={formData.salary_max}
                      onChange={(e) => setFormData((prev) => ({ ...prev, salary_max: e.target.value }))}
                      placeholder="Ex: 3500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="salary_negotiable"
                      checked={formData.salary_negotiable}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, salary_negotiable: checked }))}
                    />
                    <Label htmlFor="salary_negotiable">💬 Salaire négociable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_remote"
                      checked={formData.is_remote}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_remote: checked }))}
                    />
                    <Label htmlFor="is_remote">🏠 Télétravail possible</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education_level">🎓 Niveau d'études requis</Label>
                  <Select
                    value={formData.education_level}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, education_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun diplôme requis</SelectItem>
                      <SelectItem value="high-school">📜 Baccalauréat</SelectItem>
                      <SelectItem value="bachelor">🎓 Licence / Bachelor</SelectItem>
                      <SelectItem value="master">📖 Master / Bac+5</SelectItem>
                      <SelectItem value="phd">🏅 Doctorat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    🔧 Compétences requises
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills?.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        <span>{skill}</span>
                        <button type="button" onClick={() => removeArrayItem("skills", skill)} className="ml-1 hover:text-blue-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une compétence (ex: React, Python, Marketing...)"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("skills", skillsInput);
                          setSkillsInput("");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      addArrayItem("skills", skillsInput);
                      setSkillsInput("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    🎁 Avantages
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.benefits?.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <span>{benefit}</span>
                        <button type="button" onClick={() => removeArrayItem("benefits", benefit)} className="ml-1 hover:text-green-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter un avantage (ex: Tickets resto, Mutuelle, RTT...)"
                      value={benefitsInput}
                      onChange={(e) => setBenefitsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("benefits", benefitsInput);
                          setBenefitsInput("");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      addArrayItem("benefits", benefitsInput);
                      setBenefitsInput("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_deadline" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      📅 Date limite de candidature
                    </Label>
                    <Input
                      id="application_deadline"
                      type="date"
                      value={formData.application_deadline || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, application_deadline: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="application_url" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      🔗 Lien de candidature
                    </Label>
                    <Input
                      id="application_url"
                      type="url"
                      value={formData.application_url || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, application_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================ */}
          {/* SECTION SERVICES - AFFICHÉE UNIQUEMENT POUR LES SERVICES */}
          {/* ============================================ */}
          {selectedCategory && listingType === "service" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Détails du service
                </CardTitle>
                <CardDescription>Informations spécifiques à votre prestation de service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_type">💰 Type de tarification</Label>
                    <Select
                      value={formData.price_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, price_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Prix fixe</SelectItem>
                        <SelectItem value="hourly">À l'heure</SelectItem>
                        <SelectItem value="daily">À la journée</SelectItem>
                        <SelectItem value="weekly">À la semaine</SelectItem>
                        <SelectItem value="monthly">Au mois</SelectItem>
                        <SelectItem value="negotiable">Négociable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery_type">📦 Mode de prestation</Label>
                    <Select
                      value={formData.delivery_type}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, delivery_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">💻 En ligne uniquement</SelectItem>
                        <SelectItem value="onsite">📍 Sur place uniquement</SelectItem>
                        <SelectItem value="both">🔄 Les deux</SelectItem>
                        <SelectItem value="remote">🏠 À distance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">⏱️ Durée estimée</Label>
                    <Input
                      id="duration"
                      value={formData.duration || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="Ex: 2 heures, 1 journée..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">⭐ Années d'expérience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={formData.experience_years || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, experience_years: e.target.value }))}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="availability_start" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      🕐 Disponibilité début
                    </Label>
                    <Input
                      id="availability_start"
                      type="time"
                      value={formData.availability_start || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, availability_start: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability_end" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      🕘 Disponibilité fin
                    </Label>
                    <Input
                      id="availability_end"
                      type="time"
                      value={formData.availability_end || ""}
                      onChange={(e) => setFormData((prev) => ({ ...prev, availability_end: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    🏅 Certifications
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.certifications?.map((cert, index) => (
                      <div key={index} className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        <span>{cert}</span>
                        <button type="button" onClick={() => removeArrayItem("certifications", cert)} className="ml-1 hover:text-purple-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une certification (ex: Google Certified, AWS...)"
                      value={certificationsInput}
                      onChange={(e) => setCertificationsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("certifications", certificationsInput);
                          setCertificationsInput("");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      addArrayItem("certifications", certificationsInput);
                      setCertificationsInput("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    🌍 Langues parlées
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.languages?.map((lang, index) => (
                      <div key={index} className="flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
                        <span>{lang}</span>
                        <button type="button" onClick={() => removeArrayItem("languages", lang)} className="ml-1 hover:text-cyan-600">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une langue (ex: Français, Anglais, Espagnol...)"
                      value={languagesInput}
                      onChange={(e) => setLanguagesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("languages", languagesInput);
                          setLanguagesInput("");
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      addArrayItem("languages", languagesInput);
                      setLanguagesInput("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle>📸 Photos</CardTitle>
              <CardDescription>Téléchargez jusqu'à 10 photos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {formData.imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Aperçu ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
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
                    <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Ajouter</span>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">{formData.images.length} / 10 photos</p>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                🏷️ Mots-clés
              </CardTitle>
              <CardDescription>Ajoutez des mots-clés pour faciliter la recherche</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    <Hash className="h-3 w-3" />
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tagInput"
                  placeholder="Ajouter un mot-clé"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag(tagInput);
                      setTagInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    addTag(tagInput);
                    setTagInput("");
                  }}
                >
                  Ajouter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} disabled={loading}>
              Annuler
            </Button>
            <Button
              type="submit"
              className="min-w-32 bg-gradient-to-r from-blue-600 to-indigo-600"
              disabled={loading || !isFormValid()}
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