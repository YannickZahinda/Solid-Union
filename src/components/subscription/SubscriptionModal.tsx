import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/services/supabase";
import {
  CheckCircle,
  Shield,
  Star,
  Zap,
  Crown,
  Loader2,
  Phone,
  X,
} from "lucide-react";

interface Plan {
  id: "standard" | "pro";
  name: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  badge?: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "standard",
    name: "Standard",
    price: 2,
    icon: <Star className="h-6 w-6" />,
    color: "text-blue-600",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-50",
    features: [
      "Voir les numéros de téléphone des vendeurs",
      "Messagerie illimitée",
      "Accès à toutes les annonces",
      "Support prioritaire",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 5,
    icon: <Crown className="h-6 w-6" />,
    color: "text-purple-600",
    borderColor: "border-purple-500",
    bgColor: "bg-purple-50",
    badge: "Populaire",
    features: [
      "Tout du plan Standard",
      "Vos annonces mises en avant",
      'Badge "Vendeur Pro" sur votre profil',
      "Statistiques détaillées de vos annonces",
      "Annonces sans limite",
    ],
  },
];

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "plans" | "payment" | "processing" | "success";

const SubscriptionModal = ({ isOpen, onClose, onSuccess }: SubscriptionModalProps) => {
  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    if (!phoneNumber.trim() || phoneNumber.replace(/\s/g, "").length < 9) {
      toast({
        title: "Numéro invalide",
        description: "Veuillez entrer un numéro de téléphone valide (minimum 9 chiffres)",
        variant: "destructive",
      });
      return;
    }

    setStep("processing");

    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan: selectedPlan.id,
        status: "active",
        amount: selectedPlan.price,
        currency: "USD",
        payment_method: "mobile_money",
        payment_provider: "pawapay",
        phone_number: phoneNumber,
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      setStep("success");
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      setStep("payment");
    }
  };

  const handleClose = () => {
    if (step === "success") onSuccess();
    setStep("plans");
    setSelectedPlan(null);
    setPhoneNumber("");
    onClose();
  };

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              {step === "plans" && "Choisir un abonnement"}
              {step === "payment" && "Paiement Mobile Money"}
              {step === "processing" && "Traitement en cours..."}
              {step === "success" && "Abonnement activé !"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Step: Plans */}
        {step === "plans" && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Abonnez-vous pour accéder aux coordonnées des vendeurs et profiter de
              fonctionnalités exclusives.
            </p>

            {/* Free plan reminder */}
            <div className="p-3 rounded-lg border border-dashed bg-muted/30 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Gratuit</p>
                <p className="text-xs text-muted-foreground">Voir les annonces, publier, messagerie</p>
              </div>
              <Badge variant="outline">Actuel</Badge>
            </div>

            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md relative ${plan.borderColor} ${plan.bgColor}`}
              >
                {plan.badge && (
                  <Badge className="absolute -top-2 right-4 bg-purple-600 text-white text-xs">
                    {plan.badge}
                  </Badge>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex items-center gap-2 ${plan.color}`}>
                    {plan.icon}
                    <span className="font-bold text-lg">{plan.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">{plan.price}$</span>
                    <span className="text-xs text-muted-foreground">/mois</span>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${plan.color}`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={`mt-3 text-center py-2 rounded-lg font-medium text-sm ${plan.color} border ${plan.borderColor}`}>
                  Choisir ce plan →
                </div>
              </button>
            ))}

            <p className="text-xs text-center text-muted-foreground">
              Paiement sécurisé via PawaPay · Mobile Money · Sans engagement
            </p>
          </div>
        )}

        {/* Step: Payment */}
        {step === "payment" && selectedPlan && (
          <div className="space-y-5 mt-2">
            <button
              onClick={() => setStep("plans")}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Retour
            </button>

            {/* Selected plan summary */}
            <div className={`p-4 rounded-xl border-2 ${selectedPlan.borderColor} ${selectedPlan.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${selectedPlan.color}`}>
                  {selectedPlan.icon}
                  <span className="font-bold">Plan {selectedPlan.name}</span>
                </div>
                <span className="text-xl font-bold">{selectedPlan.price}$/mois</span>
              </div>
            </div>

            {/* PawaPay branding */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                PP
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-700">PawaPay</p>
                <p className="text-xs text-orange-600">Paiement Mobile Money sécurisé</p>
              </div>
              <Badge className="ml-auto bg-orange-100 text-orange-700 border-orange-300">
                Sandbox
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numéro Mobile Money
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+243 8XX XXX XXX (Airtel / M-Pesa)"
                className="h-12 text-base"
              />
              <p className="text-xs text-muted-foreground">
                Airtel Money, M-Pesa, Orange Money acceptés
              </p>
            </div>

            <Button
              onClick={handlePayment}
              className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Zap className="h-5 w-5 mr-2" />
              Payer {selectedPlan.price}$ via PawaPay
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 Paiement simulé — intégration réelle bientôt disponible
            </p>
          </div>
        )}

        {/* Step: Processing */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Traitement en cours...</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Votre opérateur mobile va vous envoyer une notification pour
              confirmer le paiement.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm text-orange-700 font-medium">En attente de confirmation</span>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === "success" && selectedPlan && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-700">Paiement réussi !</h3>
            <div className={`w-full p-4 rounded-xl border-2 ${selectedPlan.borderColor} ${selectedPlan.bgColor} text-center`}>
              <div className={`font-bold text-lg ${selectedPlan.color}`}>Plan {selectedPlan.name} activé</div>
              <p className="text-sm text-muted-foreground mt-1">
                Valable jusqu'au{" "}
                {expiryDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Vous pouvez maintenant voir les numéros de téléphone des vendeurs et
              profiter de toutes les fonctionnalités de votre abonnement.
            </p>
            <Button onClick={handleClose} className="w-full h-11">
              Commencer à explorer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
