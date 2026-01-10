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
        title: "Error",
        description: "User not found. Please login again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // First, ensure the user has a profile (this should already exist via trigger)
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileCheckError && profileCheckError.code === "PGRST116") {
        // Profile doesn't exist, create it
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

      // Update profile
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

      // Update interests - only if we have valid categories
      if (selectedInterests.length > 0) {
        // First verify categories exist
        const { data: validCategories, error: categoriesError } = await supabase
          .from("categories")
          .select("id")
          .in("id", selectedInterests);

        if (categoriesError) throw categoriesError;

        const validCategoryIds = validCategories?.map((c) => c.id) || [];

        // Clear existing interests
        await supabase.from("user_interests").delete().eq("user_id", user.id);

        // Insert only valid interests
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
            console.error("Interests insert error:", interestsError);
            throw interestsError;
          }
        }
      } else {
        // Clear interests if none selected
        await supabase.from("user_interests").delete().eq("user_id", user.id);
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      // Refresh to get updated completion percentage
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
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

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
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

      // Update profile with new avatar URL
      setProfileData((prev) => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Success",
        description: "Profile picture uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateProgress = () => {
    let filledFields = 0;
    const totalFields = 7; // Excluding avatar_url which is optional

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
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Profile Completion</h2>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="mt-2 text-sm text-muted-foreground">
              {progress < 50 ? (
                <span className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Complete your profile to unlock all features
                </span>
              ) : progress < 90 ? (
                <span className="flex items-center text-blue-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Good progress! Keep going
                </span>
              ) : (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Excellent! Your profile is almost complete
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Tell us about yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          City *
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
                          placeholder="New York"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Phone *
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
                          placeholder="+1 (555) 123-4567"
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
                        placeholder="Tell us about yourself, your business, or what you're looking for..."
                        rows={3}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Business Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Business Information
                    </CardTitle>
                    <CardDescription>Optional business details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={profileData.company_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            company_name: e.target.value,
                          })
                        }
                        placeholder="Your company name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        Website
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
                        placeholder="https://yourwebsite.com"
                        type="url"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Interests */}
              <div className="space-y-6">
                {/* Interests Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Your Interests *
                    </CardTitle>
                    <CardDescription>
                      Select categories you're interested in
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
                      This helps us show you relevant listings and suggestions.
                    </p>
                  </CardContent>
                </Card>

                {/* Avatar Upload Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="h-5 w-5 mr-2" />
                      Profile Picture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                        {profileData.avatar_url ? (
                          <img
                            src={profileData.avatar_url}
                            alt="Profile"
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
                          Upload Photo
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Optional - You can add this later
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Card */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{progress}%</div>
                        <div className="text-sm text-muted-foreground">
                          Profile Complete
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || progress < 50}
                      >
                        {loading ? "Saving..." : "Save & Continue"}
                      </Button>

                      {progress < 50 && (
                        <p className="text-sm text-amber-600 text-center">
                          Please complete at least 50% of your profile to
                          continue
                        </p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                        disabled={progress < 50}
                      >
                        Skip for Now
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
