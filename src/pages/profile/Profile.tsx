import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  CheckCircle,
  Edit,
  Save,
  X,
  Shield,
  Bell,
  Globe,
  Building,
  MessageSquare,
  Star,
  Calendar,
  Eye,
  ShoppingBag,
  Package,
  Home,
  Heart,
  TrendingUp,
  Tag,
  Lock,
  AlertTriangle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  company_name: string;
  website: string;
  avatar_url: string;
  completion_percentage: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface UserInterest {
  id: string;
  category_id: string;
  category: Category;
  interest_level: number;
}

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  created_at: string;
  type: "product" | "property";
}

interface Activity {
  id: string;
  type:
    | "listing_created"
    | "message_received"
    | "profile_view"
    | "interest_added";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [interestsEditing, setInterestsEditing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [stats, setStats] = useState<Stat[]>([
    {
      label: "Annonces",
      value: 0,
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600",
      description: "Total des annonces publiées",
    },
    {
      label: "Vues Profil",
      value: 0,
      icon: <Eye className="h-4 w-4" />,
      color: "bg-green-100 text-green-600",
      description: "Nombre de vues de votre profil",
    },
    {
      label: "Messages",
      value: 0,
      icon: <MessageSquare className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-600",
      description: "Messages reçus",
    },
    {
      label: "Évaluation",
      value: 0,
      icon: <Star className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-600",
      description: "Note moyenne reçue",
    },
  ]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState({
    messages: true,
    listings: true,
    promotions: false,
    security: true,
  });

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(profileData);

      await fetchUserInterests(user.id);
      await fetchRealStats(user.id);
      await fetchRecentListings(user.id);
      await fetchRecentActivities(user.id);
    } catch (error: any) {
      toast({
        title: "Erreur de chargement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des catégories:", error);
    }
  };

  const fetchUserInterests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_interests")
        .select(
          `
        id,
        category_id,
        interest_level,
        category:categories (
          id,
          name,
          type,
          icon
        )
      `
        )
        .eq("user_id", userId);

      if (error) throw error;

      setUserInterests(data || []);
      setSelectedInterests(data?.map((interest) => interest.category_id) || []);
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des centres d'intérêt:",
        error
      );
    }
  };

  const fetchRealStats = async (userId: string) => {
    try {
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const totalListings = (productsCount || 0) + (propertiesCount || 0);

      const { count: profileViews } = await supabase
        .from("views")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", userId)
        .eq("listing_type", "profile");

      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", userId);

      const averageRating = 4.5;

      setStats([
        {
          label: "Annonces",
          value: totalListings,
          icon: <ShoppingBag className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-600",
          description: "Total des annonces publiées",
        },
        {
          label: "Vues Profil",
          value: profileViews || 0,
          icon: <Eye className="h-4 w-4" />,
          color: "bg-green-100 text-green-600",
          description: "Nombre de vues de votre profil",
        },
        {
          label: "Messages",
          value: messagesCount || 0,
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-600",
          description: "Messages reçus",
        },
        {
          label: "Évaluation",
          value: averageRating,
          icon: <Star className="h-4 w-4" />,
          color: "bg-amber-100 text-amber-600",
          description: "Note moyenne reçue",
        },
      ]);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const fetchRecentListings = async (userId: string) => {
    try {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, title, price, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (productsError) throw productsError;

      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select("id, title, price, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (propertiesError) throw propertiesError;

      const productListings: Listing[] = (products || []).map((p) => ({
        ...p,
        type: "product" as const,
      }));

      const propertyListings: Listing[] = (properties || []).map((p) => ({
        ...p,
        type: "property" as const,
      }));

      const allListings = [...productListings, ...propertyListings]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      setRecentListings(allListings);
    } catch (error: any) {
      console.error(
        "Erreur lors de la récupération des annonces récentes:",
        error
      );
    }
  };

  const fetchRecentActivities = async (userId: string) => {
    try {
      const activitiesList: Activity[] = [];

      const { data: recentListings } = await supabase
        .from("products")
        .select("title, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      recentListings?.forEach((listing) => {
        activitiesList.push({
          id: `listing-${listing.created_at}`,
          type: "listing_created",
          title: "Nouvelle annonce créée",
          description: `Vous avez publié "${listing.title}"`,
          timestamp: listing.created_at,
          icon: <Package className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-600",
        });
      });

      const { data: recentMessages } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false })
        .limit(2);

      recentMessages?.forEach((message) => {
        activitiesList.push({
          id: `message-${message.created_at}`,
          type: "message_received",
          title: "Nouveau message reçu",
          description: message.content.substring(0, 50) + "...",
          timestamp: message.created_at,
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-600",
        });
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: recentViews } = await supabase
        .from("views")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", userId)
        .gte("viewed_at", yesterday.toISOString());

      if (recentViews && recentViews > 0) {
        activitiesList.push({
          id: `views-${Date.now()}`,
          type: "profile_view",
          title: "Vues du profil",
          description: `${recentViews} nouvelles vues sur votre profil`,
          timestamp: new Date().toISOString(),
          icon: <Eye className="h-4 w-4" />,
          color: "bg-green-100 text-green-600",
        });
      }

      activitiesList.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activitiesList.slice(0, 5));
    } catch (error: any) {
      console.error("Erreur lors de la récupération des activités:", error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          city: profile.city,
          bio: profile.bio,
          company_name: profile.company_name,
          website: profile.website,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été sauvegardé avec succès.",
      });

      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Erreur de mise à jour",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInterestsSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from("user_interests")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      if (selectedInterests.length > 0) {
        const interestsData = selectedInterests.map((categoryId) => ({
          user_id: user.id,
          category_id: categoryId,
          interest_level: 3,
        }));

        const { error: insertError } = await supabase
          .from("user_interests")
          .insert(interestsData);

        if (insertError) throw insertError;
      }

      await fetchUserInterests(user.id);

      toast({
        title: "Centres d'intérêt mis à jour",
        description: "Vos centres d'intérêt ont été sauvegardés.",
      });

      setInterestsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erreur de mise à jour",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInterestToggle = (categoryId: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      toast({
        title: "Avatar mis à jour",
        description: "Votre photo de profil a été mise à jour.",
      });
    } catch (error: any) {
      console.error("Erreur de téléchargement d'avatar:", error);
      toast({
        title: "Erreur de téléchargement",
        description: error.message || "Impossible de télécharger l'avatar",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement du profil...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl py-8 px-4">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-background shadow-lg">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Membre Vérifié
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Membre depuis {formatDate(profile.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editing ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setEditing(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Annuler
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier le Profil
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Complétion du Profil
                    </span>
                    <span className="text-sm font-bold">
                      {profile.completion_percentage}%
                    </span>
                  </div>
                  <Progress
                    value={profile.completion_percentage}
                    className="h-2"
                  />
                  {profile.completion_percentage < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Complétez votre profil pour augmenter la confiance et la
                      visibilité
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-5">
            <TabsTrigger value="info">Informations Personnelles</TabsTrigger>
            <TabsTrigger value="interests">Centres d'Intérêt</TabsTrigger>
            <TabsTrigger value="listings">Mes Annonces</TabsTrigger>
            <TabsTrigger value="activity">Activité Récente</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et coordonnées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Nom Complet
                    </Label>
                    {editing ? (
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-lg">{profile.full_name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Adresse Email
                    </Label>
                    <p className="text-lg">{profile.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Téléphone
                    </Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={profile.phone || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        placeholder="+33 1 23 45 67 89"
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.phone || "Non renseigné"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ville
                    </Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={profile.city || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, city: e.target.value })
                        }
                        placeholder="Paris"
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.city || "Non renseigné"}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Bio
                    </Label>
                    {editing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        rows={3}
                        placeholder="Parlez-nous de vous..."
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.bio || "Aucune bio renseignée"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Entreprise
                      </Label>
                      {editing ? (
                        <Input
                          id="company"
                          value={profile.company_name || ""}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              company_name: e.target.value,
                            })
                          }
                          placeholder="Nom de votre entreprise"
                        />
                      ) : (
                        <p className="text-lg">
                          {profile.company_name || "Non renseigné"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Site Web
                      </Label>
                      {editing ? (
                        <Input
                          id="website"
                          value={profile.website || ""}
                          onChange={(e) =>
                            setProfile({ ...profile, website: e.target.value })
                          }
                          type="url"
                          placeholder="https://votresite.com"
                        />
                      ) : (
                        <p className="text-lg">
                          {profile.website || "Non renseigné"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Centres d'Intérêt</CardTitle>
                    <CardDescription>
                      Gérez vos centres d'intérêt pour des recommandations
                      personnalisées
                    </CardDescription>
                  </div>
                  {interestsEditing ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setInterestsEditing(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annuler
                      </Button>
                      <Button onClick={handleInterestsSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setInterestsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {interestsEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedInterests.includes(category.id)}
                            onCheckedChange={() =>
                              handleInterestToggle(category.id)
                            }
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="flex items-center cursor-pointer flex-1"
                          >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {category.type === "product"
                                ? "Produit"
                                : "Immobilier"}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedInterests.length} centres d'intérêt sélectionnés
                    </p>
                  </div>
                ) : (
                  <div>
                    {userInterests.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {userInterests.map((interest) => (
                            <Badge
                              key={interest.id}
                              variant="secondary"
                              className="text-sm py-2 px-3"
                            >
                              <span className="mr-2">
                                {interest.category.icon}
                              </span>
                              {interest.category.name}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ces centres d'intérêt nous aident à vous recommander
                          des annonces pertinentes.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <h3 className="font-medium">Aucun centre d'intérêt</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Ajoutez des centres d'intérêt pour des recommandations
                          personnalisées
                        </p>
                        <Button onClick={() => setInterestsEditing(true)}>
                          <Tag className="h-4 w-4 mr-2" />
                          Ajouter des Centres d'Intérêt
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Mes Annonces Récentes</CardTitle>
                <CardDescription>
                  Vos annonces publiées récemment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentListings.length > 0 ? (
                  <div className="space-y-4">
                    {recentListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              listing.type === "product"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {listing.type === "product" ? (
                              <Package className="h-5 w-5" />
                            ) : (
                              <Home className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {listing.type === "product"
                                ? "Produit"
                                : "Immobilier"}{" "}
                              • {formatDate(listing.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {formatPrice(listing.price)}
                          </p>
                          <Badge
                            variant={
                              listing.type === "product"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {listing.type === "product"
                              ? "Produit"
                              : "Immobilier"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Voir Toutes Mes Annonces
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium">Aucune annonce publiée</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Commencez à vendre en créant votre première annonce
                    </p>
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Créer une Annonce
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Activité Récente
                </CardTitle>
                <CardDescription>
                  Vos actions et interactions récentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.color}`}
                          >
                            {activity.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium">Aucune activité récente</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre activité apparaîtra ici
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Paramètres de Notification
                  </CardTitle>
                  <CardDescription>
                    Choisissez les notifications que vous souhaitez recevoir
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Messages</h4>
                      <p className="text-sm text-muted-foreground">
                        Notifications pour nouveaux messages
                      </p>
                    </div>
                    <Switch
                      checked={notifications.messages}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          messages: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Annonces</h4>
                      <p className="text-sm text-muted-foreground">
                        Notifications pour mises à jour d'annonces
                      </p>
                    </div>
                    <Switch
                      checked={notifications.listings}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          listings: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Promotions</h4>
                      <p className="text-sm text-muted-foreground">
                        Recevoir des emails promotionnels
                      </p>
                    </div>
                    <Switch
                      checked={notifications.promotions}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          promotions: checked,
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertes de Sécurité</h4>
                      <p className="text-sm text-muted-foreground">
                        Notifications de sécurité importantes
                      </p>
                    </div>
                    <Switch
                      checked={notifications.security}
                      onCheckedChange={(checked) =>
                        setNotifications({
                          ...notifications,
                          security: checked,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Paramètres de Sécurité
                  </CardTitle>
                  <CardDescription>
                    Gérez la sécurité et la confidentialité de votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Changer le Mot de Passe</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">
                          Mot de Passe Actuel
                        </Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">
                          Nouveau Mot de Passe
                        </Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirmer le Mot de Passe
                        </Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                    <Button>Mettre à Jour le Mot de Passe</Button>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">
                      Authentification à Deux Facteurs
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Ajoutez une couche de sécurité supplémentaire à votre
                          compte
                        </p>
                      </div>
                      <Button variant="outline">Activer 2FA</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-red-600">Zone de Danger</h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h5 className="font-medium text-red-800">
                            Supprimer le Compte
                          </h5>
                          <p className="text-sm text-red-700">
                            Supprimez définitivement votre compte et toutes vos
                            données
                          </p>
                        </div>
                        <Button variant="destructive">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Supprimer le Compte
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
