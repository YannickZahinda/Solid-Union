import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Eye,
  Home,
  ShoppingBag,
  MessageSquare,
  X,
  Phone,
  MapPin,
  Building,
  Globe,
  Edit,
  Shield,
  AlertTriangle,
  Send,
  BarChart,
  Package,
  MailOpen,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface User {
  id: string;
  email: string;
  full_name: string;
  city: string;
  phone: string;
  bio: string;
  company_name: string;
  website: string;
  avatar_url: string;
  role: string;
  created_at: string;
  completion_percentage: number;
  profile_completion: string;
}

interface UserStats {
  products: number;
  properties: number;
  messages: number;
  favorites: number;
  views: number;
}

interface UserDetail {
  user: User;
  stats: UserStats;
  recentProducts: any[];
  recentProperties: any[];
  recentMessages: any[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // États de chargement
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      // Récupérer l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      // Récupérer les statistiques en parallèle
      const [
        { count: productsCount },
        { count: propertiesCount },
        { count: messagesCount },
        { count: favoritesCount },
        { count: viewsCount },
        { data: recentProducts },
        { data: recentProperties },
        { data: recentMessages },
      ] = await Promise.all([
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
        supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("views")
          .select("*", { count: "exact", head: true })
          .eq("viewer_id", userId),
        supabase
          .from("products")
          .select("id, title, price, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("properties")
          .select("id, title, price, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("messages")
          .select("id, content, created_at, receiver_id, sender_id")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const userDetail: UserDetail = {
        user: userData,
        stats: {
          products: productsCount || 0,
          properties: propertiesCount || 0,
          messages: messagesCount || 0,
          favorites: favoritesCount || 0,
          views: viewsCount || 0,
        },
        recentProducts: recentProducts || [],
        recentProperties: recentProperties || [],
        recentMessages: recentMessages || [],
      };

      setSelectedUser(userDetail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleContactUser = async () => {
    if (!selectedUser || !contactMessage.trim() || !contactSubject.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      const {
        data: { user: adminUser },
      } = await supabase.auth.getUser();

      if (!adminUser) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.rpc("send_message", {
        p_receiver_id: selectedUser.user.id,
        p_content: `[Message Administrateur] ${contactSubject}\n\n${contactMessage}\n\n---\nCet message a été envoyé par l'équipe d'administration de SolidUnion.`,
        p_listing_id: null,
        p_listing_type: null,
      });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé à l'utilisateur",
      });

      setContactMessage("");
      setContactSubject("");
      setIsContactOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingRole(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Rôle mis à jour",
        description: `Le rôle de l'utilisateur a été changé en ${newRole}`,
      });

      fetchUsers();
      if (selectedUser && selectedUser.user.id === userId) {
        setSelectedUser({
          ...selectedUser,
          user: { ...selectedUser.user, role: newRole },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Composant de chargement personnalisé
  const LoadingSpinner = ({
    size = "default",
    text = "",
  }: {
    size?: "sm" | "default" | "lg";
    text?: string;
  }) => {
    const sizeClass = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
    }[size];

    return (
      <div className="flex items-center justify-center space-x-2">
        <div
          className={`animate-spin rounded-full border-2 border-current border-t-transparent ${sizeClass}`}
        />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  };

  // Squelette de chargement pour la table
  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 border rounded-lg"
        >
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: "60%" }}
            />
            <div
              className="h-3 bg-muted rounded animate-pulse"
              style={{ width: "40%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen p-6">
          <div className="space-y-6">
            {/* En-tête avec skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64 animate-pulse" />
                <div className="h-4 bg-muted rounded w-96 animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded w-32 animate-pulse" />
            </div>

            {/* Filtres skeleton */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                  <div className="flex gap-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-8 bg-muted rounded w-24 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <TableSkeleton />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-3" />
              Gestion des utilisateurs
            </h1>
            <p className="text-muted-foreground">
              Gérez tous les utilisateurs de la plateforme SolidUnion
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label>Filtrer par rôle</Label>
                  <div className="flex gap-2">
                    {["all", "regular", "admin"].map((role) => (
                      <Button
                        key={role}
                        variant={roleFilter === role ? "default" : "outline"}
                        size="sm"
                        onClick={() => setRoleFilter(role)}
                      >
                        {role === "all"
                          ? "Tous"
                          : role === "regular"
                          ? "Utilisateurs"
                          : "Administrateurs"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  className="pl-9 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>
                Liste des utilisateurs ({filteredUsers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  <Users className="h-3 w-3 mr-1" />
                  {users.filter((u) => u.role === "admin").length} Admins
                </Badge>
                <Badge variant="outline" className="bg-green-50">
                  {users.filter((u) => u.role === "regular").length}{" "}
                  Utilisateurs
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statistiques</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) ||
                                user.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.full_name || "Non défini"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.city || "Ville non spécifiée"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            <Shield className="h-3 w-3 mr-1" />
                            Administrateur
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Utilisateur
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Profil
                            </div>
                            <div className="text-sm font-medium">
                              {user.completion_percentage}%
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchUserDetails(user.id)}
                            disabled={loadingDetails}
                          >
                            {loadingDetails &&
                            selectedUser?.user.id === user.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Détails
                              </>
                            )}
                          </Button>

                          <Dialog
                            open={
                              isContactOpen && selectedUser?.user.id === user.id
                            }
                            onOpenChange={setIsContactOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser({
                                    user,
                                    stats: {
                                      products: 0,
                                      properties: 0,
                                      messages: 0,
                                      favorites: 0,
                                      views: 0,
                                    },
                                    recentProducts: [],
                                    recentProperties: [],
                                    recentMessages: [],
                                  });
                                }}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Contacter
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>
                                  Contacter l'utilisateur
                                </DialogTitle>
                                <DialogDescription>
                                  Envoyer un message à{" "}
                                  {user.full_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="subject">Sujet</Label>
                                  <Input
                                    id="subject"
                                    placeholder="Sujet du message"
                                    value={contactSubject}
                                    onChange={(e) =>
                                      setContactSubject(e.target.value)
                                    }
                                    disabled={sendingMessage}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="message">Message</Label>
                                  <Textarea
                                    id="message"
                                    placeholder="Votre message..."
                                    rows={5}
                                    value={contactMessage}
                                    onChange={(e) =>
                                      setContactMessage(e.target.value)
                                    }
                                    disabled={sendingMessage}
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setIsContactOpen(false)}
                                    disabled={sendingMessage}
                                  >
                                    Annuler
                                  </Button>
                                  <Button
                                    onClick={handleContactUser}
                                    disabled={sendingMessage}
                                  >
                                    {sendingMessage ? (
                                      <LoadingSpinner
                                        size="sm"
                                        text="Envoi..."
                                      />
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Envoyer
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Modal Détails Utilisateur */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <LoadingSpinner size="lg" text="Chargement des détails..." />
                <Progress value={75} className="w-1/2" />
              </div>
            ) : selectedUser ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.user.avatar_url} />
                      <AvatarFallback>
                        {selectedUser.user.full_name?.charAt(0) ||
                          selectedUser.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>
                          {selectedUser.user.full_name ||
                            "Utilisateur sans nom"}
                        </span>
                        {selectedUser.user.role === "admin" ? (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Utilisateur
                          </Badge>
                        )}
                      </div>
                      <DialogDescription className="mt-1">
                        {selectedUser.user.email}
                      </DialogDescription>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <ScrollArea className="h-[70vh] pr-4">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="profile">Profil</TabsTrigger>
                      <TabsTrigger value="stats">Statistiques</TabsTrigger>
                      <TabsTrigger value="listings">Annonces</TabsTrigger>
                      <TabsTrigger value="activity">Activité</TabsTrigger>
                    </TabsList>

                    {/* Onglet Profil */}
                    <TabsContent value="profile" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Information personnelle
                          </Label>
                          <div className="space-y-1 p-3 bg-muted/50 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Ville:
                              </span>
                              <span className="font-medium">
                                {selectedUser.user.city || "Non spécifié"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Téléphone:
                              </span>
                              <span className="font-medium">
                                {selectedUser.user.phone || "Non spécifié"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Entreprise:
                              </span>
                              <span className="font-medium">
                                {selectedUser.user.company_name ||
                                  "Non spécifié"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Site web:
                              </span>
                              <span className="font-medium">
                                {selectedUser.user.website || "Non spécifié"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Progression du profil
                          </Label>
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Complétion
                              </span>
                              <span className="text-lg font-bold">
                                {selectedUser.user.completion_percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${selectedUser.user.completion_percentage}%`,
                                }}
                              />
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              Statut: {selectedUser.user.profile_completion}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Bio</Label>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          {selectedUser.user.bio || "Aucune bio fournie"}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Modifier le rôle</Label>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              selectedUser.user.role === "regular"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleUpdateRole(selectedUser.user.id, "regular")
                            }
                            disabled={updatingRole === selectedUser.user.id}
                          >
                            {updatingRole === selectedUser.user.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Utilisateur
                              </>
                            )}
                          </Button>
                          <Button
                            variant={
                              selectedUser.user.role === "admin"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleUpdateRole(selectedUser.user.id, "admin")
                            }
                            disabled={updatingRole === selectedUser.user.id}
                          >
                            {updatingRole === selectedUser.user.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Administrateur
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Statistiques */}
                    <TabsContent value="stats" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Package className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {selectedUser.stats.products}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Produits
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Home className="h-8 w-8 text-green-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {selectedUser.stats.properties}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Propriétés
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {selectedUser.stats.messages}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Messages
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Eye className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {selectedUser.stats.views}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Vues
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <MailOpen className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                              <div className="text-2xl font-bold">
                                {selectedUser.stats.favorites}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Favoris
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Membre depuis le{" "}
                        {formatDate(selectedUser.user.created_at)}
                      </div>
                    </TabsContent>

                    {/* Onglet Annonces */}
                    <TabsContent value="listings" className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Produits ({selectedUser.recentProducts.length})
                          </h3>
                          <Button variant="outline" size="sm">
                            Voir tous
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {selectedUser.recentProducts.length > 0 ? (
                            selectedUser.recentProducts.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">
                                    {product.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(product.price)} •{" "}
                                    {formatDate(product.created_at)}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucun produit publié
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium flex items-center">
                            <Home className="h-5 w-5 mr-2" />
                            Propriétés ({selectedUser.recentProperties.length})
                          </h3>
                          <Button variant="outline" size="sm">
                            Voir tous
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {selectedUser.recentProperties.length > 0 ? (
                            selectedUser.recentProperties.map((property) => (
                              <div
                                key={property.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <div className="font-medium">
                                    {property.title}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatCurrency(property.price)} •{" "}
                                    {formatDate(property.created_at)}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucune propriété publiée
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Onglet Activité */}
                    <TabsContent value="activity" className="space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Messages récents ({selectedUser.recentMessages.length}
                          )
                        </h3>
                        <div className="space-y-3">
                          {selectedUser.recentMessages.length > 0 ? (
                            selectedUser.recentMessages.map((message) => (
                              <div
                                key={message.id}
                                className="p-3 border rounded-lg"
                              >
                                <div className="text-sm text-muted-foreground mb-1">
                                  {formatDate(message.created_at)}
                                </div>
                                <div className="text-sm line-clamp-2">
                                  {message.content}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              Aucun message récent
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminUsers;
