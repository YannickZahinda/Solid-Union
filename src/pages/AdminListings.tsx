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
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/services/supabase";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Listing {
  id: string;
  title: string;
  type: "product" | "property";
  price: number;
  user_id: string;
  user_name: string;
  created_at: string;
  status: "active" | "pending" | "reported" | "suspended";
}

const AdminListings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      // Récupérer les produits
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select(
          `
          *,
          user:profiles(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Récupérer les propriétés
      const { data: properties, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
          *,
          user:profiles(full_name)
        `
        )
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      // Combiner et formater les données
      const allListings: Listing[] = [
        ...(products?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "product" as const,
          price: p.price,
          user_id: p.user_id,
          user_name: p.user?.full_name || "Utilisateur inconnu",
          created_at: p.created_at,
          status: (
            Math.random() > 0.7
              ? "reported"
              : Math.random() > 0.5
              ? "pending"
              : "active"
          ) as "active" | "pending" | "reported" | "suspended",
        })) || []),
        ...(properties?.map((p) => ({
          id: p.id,
          title: p.title,
          type: "property" as const,
          price: p.price,
          user_id: p.user_id,
          user_name: p.user?.full_name || "Utilisateur inconnu",
          created_at: p.created_at,
          status: (
            Math.random() > 0.7
              ? "reported"
              : Math.random() > 0.5
              ? "pending"
              : "active"
          ) as "active" | "pending" | "reported" | "suspended",
        })) || []),
      ];

      // Filtrer les annonces
      let filteredListings = allListings;
      if (filter !== "all") {
        filteredListings = allListings.filter(
          (listing) => listing.status === filter
        );
      }

      setListings(filteredListings);
    } catch (error) {
      console.error("Erreur lors du chargement des annonces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: "product" | "property") => {
    // Ici, vous pourriez mettre à jour le statut dans la base de données
    toast({
      title: "Annonce approuvée",
      description: "L'annonce a été approuvée avec succès",
      variant: "default",
    });
    fetchListings();
  };

  const handleReject = async (id: string, type: "product" | "property") => {
    // Ici, vous pourriez mettre à jour le statut dans la base de données
    toast({
      title: "Annonce rejetée",
      description: "L'annonce a été rejetée",
      variant: "destructive",
    });
    fetchListings();
  };

  const handleSuspend = async (id: string, type: "product" | "property") => {
    // Ici, vous pourriez suspendre l'annonce
    toast({
      title: "Annonce suspendue",
      description: "L'annonce a été suspendue temporairement",
      variant: "destructive",
    });
    fetchListings();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case "reported":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Signalée
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Suspendue
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Modération des annonces</h1>
            <p className="text-muted-foreground">
              Gérez et modérez toutes les annonces de la plateforme
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchListings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Liste des annonces</CardTitle>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-2">
                    {["all", "active", "pending", "reported", "suspended"].map(
                      (status) => (
                        <Button
                          key={status}
                          variant={filter === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFilter(status)}
                        >
                          {status === "all"
                            ? "Toutes"
                            : status === "active"
                            ? "Actives"
                            : status === "pending"
                            ? "En attente"
                            : status === "reported"
                            ? "Signalées"
                            : "Suspendues"}
                        </Button>
                      )
                    )}
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9 w-full md:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium truncate max-w-[200px]">
                      {listing.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {listing.type === "product" ? "Produit" : "Propriété"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(listing.price)}</TableCell>
                    <TableCell>{listing.user_name}</TableCell>
                    <TableCell>{formatDate(listing.created_at)}</TableCell>
                    <TableCell>{getStatusBadge(listing.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                handleApprove(listing.id, listing.type)
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approuver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleReject(listing.id, listing.type)
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleSuspend(listing.id, listing.type)
                              }
                            >
                              Suspendre
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminListings;
function toast(arg0: { title: string; description: string; variant: string; }) {
    throw new Error("Function not implemented.");
}

