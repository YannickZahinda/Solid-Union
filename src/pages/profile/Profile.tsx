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
  Briefcase,
  Star,
  Calendar,
  Eye,
  ShoppingBag,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { toast } from "@/components/ui/use-toast";

interface ProfileData {
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

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState<Stat[]>([
    {
      label: "Listings",
      value: 0,
      icon: <ShoppingBag className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Profile Views",
      value: 0,
      icon: <Eye className="h-4 w-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Messages",
      value: 0,
      icon: <Briefcase className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Rating",
      value: 0,
      icon: <Star className="h-4 w-4" />,
      color: "bg-amber-100 text-amber-600",
    },
  ]);
  const [notifications, setNotifications] = useState({
    messages: true,
    listings: true,
    promotions: false,
    security: true,
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
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
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual data
    setStats([
      {
        label: "Listings",
        value: 12,
        icon: <ShoppingBag className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Profile Views",
        value: 245,
        icon: <Eye className="h-4 w-4" />,
        color: "bg-green-100 text-green-600",
      },
      {
        label: "Messages",
        value: 34,
        icon: <Briefcase className="h-4 w-4" />,
        color: "bg-purple-100 text-purple-600",
      },
      {
        label: "Rating",
        value: 4.8,
        icon: <Star className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
      },
    ]);
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
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });

      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

 const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
        const fileExt = file.name.split(".").pop();
        // SIMPLIFIED PATH - don't include "avatars/" prefix
        const fileName = `${user.id}/avatar.${fileExt}`;
        
        // Upload to Supabase Storage (use fileName directly, not filePath)
        const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

        // Update profile with new avatar URL
        const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar_url: publicUrl })
            .eq("id", user.id);

        if (updateError) throw updateError;

        setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);

        toast({
            title: "Avatar mis à jour",
            description: "Votre photo de profil a été mise à jour.",
        });
    } catch (error: any) {
        console.error('Avatar upload error:', error);
        toast({
            title: "Erreur de téléchargement",
            description: error.message || "Impossible de télécharger l'avatar",
            variant: "destructive",
        });
    }
};

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Section */}
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

              {/* Profile Info */}
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
                        Verified Member
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Joined {formatDate(profile.created_at)}
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
                          Cancel
                        </Button>
                        <Button onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {/* Completion Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Profile Completion
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
                      Complete your profile to increase trust and visibility
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="info">Personal Info</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
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
                      Email Address
                    </Label>
                    <p className="text-lg">{profile.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </Label>
                    {editing ? (
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.phone || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      City
                    </Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={profile.city}
                        onChange={(e) =>
                          setProfile({ ...profile, city: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.city || "Not provided"}
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
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-lg">
                        {profile.bio || "No bio provided"}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Company
                      </Label>
                      {editing ? (
                        <Input
                          id="company"
                          value={profile.company_name}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              company_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-lg">
                          {profile.company_name || "Not provided"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </Label>
                      {editing ? (
                        <Input
                          id="website"
                          value={profile.website}
                          onChange={(e) =>
                            setProfile({ ...profile, website: e.target.value })
                          }
                          type="url"
                        />
                      ) : (
                        <p className="text-lg">
                          {profile.website || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Messages</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify me about new messages
                    </p>
                  </div>
                  <Switch
                    checked={notifications.messages}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, messages: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Listings</h4>
                    <p className="text-sm text-muted-foreground">
                      Notify me about listing updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.listings}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, listings: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Promotions</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails
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
                    <h4 className="font-medium">Security Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Important security notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  <Button>Update Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-600">Danger Zone</h4>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-medium text-red-800">
                          Delete Account
                        </h5>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your recent actions and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats[0].value > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Profile Updated</p>
                            <p className="text-sm text-muted-foreground">
                              Your profile is {profile.completion_percentage}%
                              complete
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Today
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">New Listing Created</p>
                            <p className="text-sm text-muted-foreground">
                              You published a new product
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          2 days ago
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium">No activity yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your activity will appear here
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
