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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Phone,
  MapPin,
  Building,
  Globe,
  Briefcase,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

interface ProfileData {
  full_name: string;
  city: string;
  phone: string;
  bio: string;
  company_name: string;
  website: string;
  avatar_url: string;
  interests: string[];
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    city: "",
    phone: "",
    bio: "",
    company_name: "",
    website: "",
    avatar_url: "",
    interests: [],
  });

  useEffect(() => {
    fetchCategories();
    fetchUserProfile();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchUserProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        city: profile.city || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        company_name: profile.company_name || "",
        website: profile.website || "",
        avatar_url: profile.avatar_url || "",
        interests: [],
      });

      setCompletionPercentage(profile.completion_percentage || 0);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non trouvé. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileCheckError && profileCheckError.code === "PGRST116") {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            full_name: profileData.full_name,
            city: profileData.city,
            phone: profileData.phone,
            role: "regular",
          });

        if (createProfileError) throw createProfileError;
      } else if (profileCheckError) {
        throw profileCheckError;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          city: profileData.city,
          phone: profileData.phone,
          bio: profileData.bio,
          company_name: profileData.company_name,
          website: profileData.website,
          avatar_url: profileData.avatar_url,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      if (selectedInterests.length > 0) {
        const { data: validCategories, error: categoriesError } = await supabase
          .from("categories")
          .select("id")
          .in("id", selectedInterests);

        if (categoriesError) throw categoriesError;

        const validCategoryIds = validCategories?.map((c) => c.id) || [];

        await supabase.from("user_interests").delete().eq("user_id", user.id);

        if (validCategoryIds.length > 0) {
          const interestsData = validCategoryIds.map((categoryId) => ({
            user_id: user.id,
            category_id: categoryId,
            interest_level: 3,
          }));

          const { error: interestsError } = await supabase
            .from("user_interests")
            .insert(interestsData);

          if (interestsError) {
            console.error("Erreur d'insertion des intérêts:", interestsError);
            throw interestsError;
          }
        }
      } else {
        await supabase.from("user_interests").delete().eq("user_id", user.id);
      }

      toast({
        title: "Profil mis à jour",
        description: "Votre profil a été mis à jour avec succès.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Erreur de mise à jour du profil:", error);
      toast({
        title: "Erreur",
        description: error.message || "Échec de la mise à jour du profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez télécharger un fichier image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Veuillez télécharger une image de moins de 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfileData((prev) => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Succès",
        description: "Photo de profil téléchargée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Échec du téléchargement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    let filledFields = 0;
    const totalFields = 7;

    if (profileData.full_name.trim()) filledFields++;
    if (profileData.city.trim()) filledFields++;
    if (profileData.phone.trim()) filledFields++;
    if (profileData.bio.trim()) filledFields++;
    if (selectedInterests.length > 0) filledFields++;
    if (profileData.company_name.trim()) filledFields++;
    if (profileData.website.trim()) filledFields++;

    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-muted/30 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Complétion du Profil</h2>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-2 text-sm text-muted-foreground">
              {progress < 50 ? (
                <span className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Complétez votre profil pour débloquer toutes les
                  fonctionnalités
                </span>
              ) : progress < 90 ? (
                <span className="flex items-center text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Bon progrès ! Continuez
                </span>
              ) : (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Excellent ! Votre profil est presque complet
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informations Personnelles
                    </CardTitle>
                    <CardDescription>Parlez-nous de vous</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nom Complet *</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Ville *
                        </Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              city: e.target.value,
                            })
                          }
                          placeholder="Paris"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Téléphone *
                        </Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="+33 1 23 45 67 89"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio *</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Parlez-nous de vous, de votre entreprise ou de ce que vous recherchez..."
                        rows={3}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Informations Professionnelles
                    </CardTitle>
                    <CardDescription>
                      Détails optionnels sur votre entreprise
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nom de l'Entreprise</Label>
                      <Input
                        id="company_name"
                        value={profileData.company_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            company_name: e.target.value,
                          })
                        }
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        Site Web
                      </Label>
                      <Input
                        id="website"
                        value={profileData.website}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            website: e.target.value,
                          })
                        }
                        placeholder="https://votresite.com"
                        type="url"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Vos Centres d'Intérêt *
                    </CardTitle>
                    <CardDescription>
                      Sélectionnez les catégories qui vous intéressent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`interest-${category.id}`}
                            checked={selectedInterests.includes(category.id)}
                            onCheckedChange={() =>
                              handleInterestToggle(category.id)
                            }
                          />
                          <Label
                            htmlFor={`interest-${category.id}`}
                            className="flex items-center cursor-pointer"
                          >
                            <span className="mr-2">{category.icon}</span>
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Cela nous aide à vous montrer des annonces et suggestions
                      pertinentes.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="h-5 w-5 mr-2" />
                      Photo de Profil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                        {profileData.avatar_url ? (
                          <img
                            src={profileData.avatar_url}
                            alt="Profil"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <Button variant="outline" size="sm" type="button">
                          Télécharger une Photo
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Optionnel - Vous pouvez ajouter cela plus tard
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{progress}%</div>
                        <div className="text-sm text-muted-foreground">
                          Profil Complété
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || progress < 50}
                      >
                        {loading
                          ? "Enregistrement..."
                          : "Enregistrer & Continuer"}
                      </Button>

                      {progress < 50 && (
                        <p className="text-sm text-amber-600 text-center">
                          Veuillez compléter au moins 50% de votre profil pour
                          continuer
                        </p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                        disabled={progress < 50}
                      >
                        Passer pour l'instant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CompleteProfile;
