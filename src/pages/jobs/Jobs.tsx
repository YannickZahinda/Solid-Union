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
  Filter,
  MapPin,
  Eye,
  Heart,
  MessageSquare,
  Briefcase,
  DollarSign,
  User,
  Calendar,
  Phone,
  Send,
  X,
  Check,
  Building2,
  Clock,
  Award,
  Users,
  Globe,
  Mail,
  GraduationCap,
  TrendingUp,
  CheckCircle,
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

interface Job {
  id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  salary_negotiable: boolean;
  experience_level: string;
  education_level: string;
  skills: string[];
  benefits: string[];
  application_deadline: string;
  is_remote: boolean;
  application_url: string;
  images: string[];
  created_at: string;
  category_id: string;
  user_id: string;
  employer?: {
    full_name: string;
    avatar_url: string;
    city: string;
    phone: string;
    email: string;
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

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("all");
  const [selectedRemote, setSelectedRemote] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const jobTypes = [
    { label: "Tous les types", value: "all" },
    { label: "CDI - Temps plein", value: "full-time" },
    { label: "CDD - Temps partiel", value: "part-time" },
    { label: "Freelance", value: "freelance" },
    { label: "Stage", value: "internship" },
    { label: "Alternance", value: "apprenticeship" },
    { label: "Télétravail", value: "remote" },
  ];

  const experienceLevels = [
    { label: "Tous niveaux", value: "all" },
    { label: "Débutant (0-2 ans)", value: "entry" },
    { label: "Junior (2-4 ans)", value: "junior" },
    { label: "Senior (5-8 ans)", value: "senior" },
    { label: "Expert (8+ ans)", value: "expert" },
  ];

  const remoteOptions = [
    { label: "Tous", value: "all" },
    { label: "Télétravail possible", value: "remote" },
    { label: "Sur site uniquement", value: "onsite" },
  ];

  useEffect(() => {
    fetchJobs();
    fetchCategories();
    fetchFavorites();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          employer:profiles!user_id(full_name, avatar_url, city, phone, email),
          category:categories(name, icon)
        `
        )
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres d'emploi",
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
      .eq("type", "job")
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
      .eq("listing_type", "job");

    if (data) {
      setFavorites(new Set(data.map((item) => item.listing_id)));
    }
  };

  const toggleFavorite = async (jobId: string) => {
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
      if (favorites.has(jobId)) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", jobId)
          .eq("listing_type", "job");

        if (error) throw error;
        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast({
          title: "Retiré des favoris",
          description: "Offre d'emploi retirée de vos favoris",
        });
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: jobId,
          listing_type: "job",
        });

        if (error) throw error;
        setFavorites((prev) => new Set(prev).add(jobId));
        toast({
          title: "Ajouté aux favoris",
          description: "Offre d'emploi ajoutée à vos favoris",
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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || job.category_id === selectedCategory;

    const matchesJobType =
      selectedJobType === "all" || job.job_type === selectedJobType;

    const matchesExperience =
      selectedExperience === "all" || job.experience_level === selectedExperience;

    let matchesRemote = true;
    if (selectedRemote === "remote") {
      matchesRemote = job.is_remote === true;
    } else if (selectedRemote === "onsite") {
      matchesRemote = job.is_remote === false;
    }

    return matchesSearch && matchesCategory && matchesJobType && matchesExperience && matchesRemote;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (min && max) return `${formatPrice(min)} - ${formatPrice(max)}/mois`;
    if (min) return `À partir de ${formatPrice(min)}/mois`;
    if (max) return `Jusqu'à ${formatPrice(max)}/mois`;
    return "Salaire sur demande";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      "full-time": "CDI - Temps plein",
      "part-time": "CDD - Temps partiel",
      freelance: "Freelance",
      internship: "Stage",
      apprenticeship: "Alternance",
      remote: "Télétravail",
    };
    return types[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const levels: Record<string, string> = {
      entry: "Débutant (0-2 ans)",
      junior: "Junior (2-4 ans)",
      senior: "Senior (5-8 ans)",
      expert: "Expert (8+ ans)",
    };
    return levels[level] || level;
  };

  const getEducationLabel = (level: string) => {
    const levels: Record<string, string> = {
      none: "Aucun diplôme requis",
      "high-school": "Baccalauréat",
      bachelor: "Licence / Bachelor",
      master: "Master / Bac+5",
      phd: "Doctorat",
    };
    return levels[level] || level;
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!selectedJob || !messageContent.trim()) return;

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
        p_receiver_id: selectedJob.user_id,
        p_content: messageContent,
        p_listing_id: selectedJob.id,
        p_listing_type: "job",
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
          <div className="text-lg">Chargement des offres d'emploi...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Trouvez l'Emploi de Vos Rêves
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Des milliers d'offres d'emploi dans tous les secteurs d'activité
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Titre, entreprise, compétences..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={selectedJobType} onValueChange={setSelectedJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                <SelectTrigger>
                  <SelectValue placeholder="Niveau d'expérience" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedJobType("all");
                  setSelectedExperience("all");
                  setSelectedRemote("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="section-padding">
        <div className="container-max">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1 ? "Offre d'emploi" : "Offres d'emploi"}
            </h2>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Aucune offre d'emploi trouvée
              </h3>
              <p className="text-muted-foreground">
                Aucune offre ne correspond à vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="group overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(job)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <Building2 className="h-3 w-3 mr-1" />
                          {job.company_name}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(job.id);
                        }}
                        className="p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(job.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getJobTypeLabel(job.job_type)}
                      </Badge>
                      {job.is_remote && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          Télétravail
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {getExperienceLabel(job.experience_level)}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {job.location}
                    </div>

                    <div className="flex items-center text-lg font-bold text-primary mb-3">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Publiée le {formatDate(job.created_at)}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                <DialogDescription>
                  {selectedJob.category?.name} • {getJobTypeLabel(selectedJob.job_type)} •{" "}
                  {formatDate(selectedJob.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Company Header */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        {selectedJob.company_name}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedJob.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                      </div>
                      {selectedJob.salary_negotiable && (
                        <span className="text-xs text-muted-foreground">Salaire négociable</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Informations générales</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Type de contrat:</span>
                        <span className="ml-2">{getJobTypeLabel(selectedJob.job_type)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Expérience requise:</span>
                        <span className="ml-2">{getExperienceLabel(selectedJob.experience_level)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Niveau d'études:</span>
                        <span className="ml-2">{getEducationLabel(selectedJob.education_level)}</span>
                      </div>
                      {selectedJob.is_remote && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Télétravail:</span>
                          <span className="ml-2 text-green-600">Possible</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Compétences requises</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills?.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description du poste</h4>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Benefits */}
                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Avantages</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.benefits.map((benefit, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-600" />
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employer Info */}
                {selectedJob.employer && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Informations du recruteur</h4>
                    <div className="flex items-center gap-3">
                      {selectedJob.employer.avatar_url ? (
                        <img
                          src={selectedJob.employer.avatar_url}
                          alt={selectedJob.employer.full_name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{selectedJob.employer.full_name}</div>
                        {selectedJob.employer.email && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {selectedJob.employer.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {selectedJob.application_deadline && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center text-amber-800">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Date limite de candidature:</span>
                      <span className="ml-2">{formatDate(selectedJob.application_deadline)}</span>
                    </div>
                  </div>
                )}
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
                  Contacter le recruteur
                </Button>
                {selectedJob.application_url && (
                  <Button asChild className="btn-hero">
                    <a href={selectedJob.application_url} target="_blank" rel="noopener noreferrer">
                      Postuler maintenant
                    </a>
                  </Button>
                )}
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
              Contactez {selectedJob?.employer?.full_name || "le recruteur"} au sujet de "{selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Votre message</Label>
              <Textarea
                id="message"
                placeholder="Bonjour, je suis intéressé par cette offre d'emploi..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste
              </p>
            </div>

            {selectedJob && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedJob.title}</div>
                <div className="text-sm text-muted-foreground">{selectedJob.company_name}</div>
                <div className="text-sm text-muted-foreground">{formatSalary(selectedJob.salary_min, selectedJob.salary_max)}</div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
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
    </Layout>
  );
};

export default Jobs;