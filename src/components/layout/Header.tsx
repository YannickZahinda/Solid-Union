import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  PlusCircle,
  Bell,
  Home,
  Shield,
  Settings,
  Package,
  Building,
  ChevronDown,
  MessageSquare,
  FileText,
  TrendingUp,
  Filter,
  BarChart3,
} from "lucide-react";
import logo from "@/assets/solidunion-logo.png";
import { supabase } from "@/services/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          fetchProfile(session.user.id);
          fetchUnreadMessages(session.user.id);
        } else {
          setProfile(null);
          setUnreadMessages(0);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      await fetchProfile(user.id);
      await fetchUnreadMessages(user.id);
    }
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchUnreadMessages = async (userId: string) => {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("read", false);

    if (!error) {
      setUnreadMessages(count || 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setUnreadMessages(0);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="hidden md:flex space-x-4">
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="SolidUnion logo"
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gradient hidden sm:inline-block">
                SolidUnion
              </span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {/* Browse Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9">
                    Parcourir
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Produits
                          </h4>
                          <Link to="/products?category=electronics">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Électronique
                            </NavigationMenuLink>
                          </Link>
                          <Link to="/products?category=fashion">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Mode & Vêtements
                            </NavigationMenuLink>
                          </Link>
                          <Link to="/products?category=vehicles">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Véhicules
                            </NavigationMenuLink>
                          </Link>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Propriétés
                          </h4>
                          <Link to="/properties?type=apartment">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Building className="h-4 w-4 mr-2" />
                              Appartements à louer
                            </NavigationMenuLink>
                          </Link>
                          <Link to="/properties?type=house">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Building className="h-4 w-4 mr-2" />
                              Maisons à vendre
                            </NavigationMenuLink>
                          </Link>
                          <Link to="/properties?type=commercial">
                            <NavigationMenuLink
                              className={navigationMenuTriggerStyle()}
                            >
                              <Building className="h-4 w-4 mr-2" />
                              Espaces commerciaux
                            </NavigationMenuLink>
                          </Link>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <Link to="/products">
                          <Button variant="outline" className="w-full">
                            <Package className="h-4 w-4 mr-2" />
                            Voir tous les produits
                          </Button>
                        </Link>
                        <Link to="/properties" className="mt-2 block">
                          <Button variant="outline" className="w-full">
                            <Building className="h-4 w-4 mr-2" />
                            Voir toutes les propriétés
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* About Link */}
                <NavigationMenuItem>
                  <Link to="/about">
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      À propos
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                {/* User-specific navigation */}
                {user && (
                  <>
                    <NavigationMenuItem>
                      <Link to="/dashboard">
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Tableau de bord
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/my-listings">
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Mes annonces
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <>
                {/* Create Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="h-9 hidden sm:flex">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Créer
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/create-listing?type=product">
                        <Package className="mr-2 h-4 w-4" />
                        Nouveau produit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/create-listing?type=property">
                        <Building className="mr-2 h-4 w-4" />
                        Nouvelle propriété
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Messages Button */}
                <Link to="/messages">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hidden sm:flex"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {unreadMessages > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-red-500 text-white border-2 border-background">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Admin Panel Button */}
                {profile?.role === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Administration</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Tableau de bord
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">
                          <User className="mr-2 h-4 w-4" />
                          Utilisateurs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/listings">
                          <Filter className="mr-2 h-4 w-4" />
                          Modération
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/analytics">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={profile?.avatar_url}
                          alt={profile?.full_name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(profile?.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.role === "admin" && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-purple-500 border-2 border-background" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none truncate">
                            {profile?.full_name || "Utilisateur"}
                          </p>
                          {profile?.role === "admin" && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="pt-1">
                          <div className="text-xs text-muted-foreground">
                            Profil complété à{" "}
                            {profile?.completion_percentage || 0}%
                          </div>
                          <div className="h-1 w-full bg-muted rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${
                                  profile?.completion_percentage || 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard">
                          <Home className="mr-2 h-4 w-4" />
                          Tableau de bord
                          <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">
                          <User className="mr-2 h-4 w-4" />
                          Mon profil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-listings">
                          <Package className="mr-2 h-4 w-4" />
                          Mes annonces
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/messages">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                          {unreadMessages > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white">
                              {unreadMessages}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {profile?.role === "admin" && (
                      <>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Administration
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link to="/admin-dashboard">
                              <Shield className="mr-2 h-4 w-4" />
                              Dashboard Admin
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/admin/users">
                              <User className="mr-2 h-4 w-4" />
                              Gestion utilisateurs
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                      <DropdownMenuShortcut>⌘Q</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="outline" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup" className="hidden sm:block">
                  <Button size="sm" className="btn-hero">
                    Inscription
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t mt-2">
            <div className="py-4 space-y-3">
              {/* Browse Section */}
              <div className="px-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Parcourir
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      Produits
                    </Button>
                  </Link>
                  <Link
                    to="/properties"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      <Building className="mr-2 h-4 w-4" />
                      Propriétés
                    </Button>
                  </Link>
                  <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />À propos
                    </Button>
                  </Link>
                </div>
              </div>

              {/* User-specific sections */}
              {user && (
                <>
                  <div className="px-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      Mon compte
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Home className="mr-2 h-4 w-4" />
                          Tableau de bord
                        </Button>
                      </Link>
                      <Link
                        to="/create-listing"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Créer une annonce
                        </Button>
                      </Link>
                      <Link
                        to="/my-listings"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Mes annonces
                        </Button>
                      </Link>
                      <Link
                        to="/messages"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className="w-full justify-start relative"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                          {unreadMessages > 0 && (
                            <Badge className="ml-auto bg-red-500 text-white">
                              {unreadMessages}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Admin Section */}
                  {profile?.role === "admin" && (
                    <div className="px-4">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Administration
                      </h3>
                      <div className="space-y-1">
                        <Link
                          to="/admin-dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700"
                          >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Dashboard Admin
                          </Button>
                        </Link>
                        <Link
                          to="/admin/users"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-700"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Utilisateurs
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* User Info */}
                  <div className="px-4 pt-4 border-t">
                    <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(profile?.full_name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {profile?.full_name || "Utilisateur"}
                          </p>
                          {profile?.role === "admin" && (
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            {profile?.completion_percentage || 0}%
                          </div>
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${
                                  profile?.completion_percentage || 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Auth Buttons */}
              <div className="px-4 space-y-2">
                {user ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="btn-hero w-full">Inscription</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
