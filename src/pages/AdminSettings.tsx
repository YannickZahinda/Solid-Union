import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Save,
  Globe,
  Bell,
  Shield,
  Mail,
  AlertTriangle,
  Users,
  CreditCard,
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    // Général
    siteName: "SolidUnion",
    siteDescription: "Marketplace communautaire",
    siteUrl: "https://solidunion.com",

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    adminAlerts: true,

    // Sécurité
    twoFactorAuth: true,
    ipWhitelist: false,
    sessionTimeout: 30,

    // Paiements
    stripeEnabled: true,
    paypalEnabled: false,
    commissionRate: 5,
  });

  const handleSave = () => {
    // Ici, vous enverriez les paramètres à l'API
    console.log("Paramètres sauvegardés:", settings);
    alert("Paramètres sauvegardés avec succès!");
  };

  return (
    <Layout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Paramètres système
            </h1>
            <p className="text-muted-foreground">
              Configurez les paramètres de la plateforme SolidUnion
            </p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les changements
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Paiements
            </TabsTrigger>
          </TabsList>

          {/* Onglet Général */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez les paramètres de base de votre plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">URL du site</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) =>
                        setSettings({ ...settings, siteUrl: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description du site</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        siteDescription: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notification</CardTitle>
                <CardDescription>
                  Gérez les notifications système et emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications en temps réel dans le navigateur
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertes administrateur</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertes pour les activités suspectes
                    </p>
                  </div>
                  <Switch
                    checked={settings.adminAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, adminAlerts: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de sécurité</CardTitle>
                <CardDescription>
                  Configurez les paramètres de sécurité avancés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Authentification à deux facteurs
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Exiger la 2FA pour les administrateurs
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, twoFactorAuth: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Liste blanche d'IP</Label>
                    <p className="text-sm text-muted-foreground">
                      Restreindre l'accès admin à des IP spécifiques
                    </p>
                  </div>
                  <Switch
                    checked={settings.ipWhitelist}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, ipWhitelist: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">
                    Délai d'expiration de session (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        sessionTimeout: parseInt(e.target.value) || 30,
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paiements */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de paiement</CardTitle>
                <CardDescription>
                  Configurez les options de paiement et commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Stripe</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les paiements Stripe
                    </p>
                  </div>
                  <Switch
                    checked={settings.stripeEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, stripeEnabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">PayPal</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les paiements PayPal
                    </p>
                  </div>
                  <Switch
                    checked={settings.paypalEnabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, paypalEnabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Taux de commission (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.commissionRate}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        commissionRate: parseFloat(e.target.value) || 5,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Pourcentage prélevé sur chaque transaction
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Zone de danger */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Zone de danger
            </CardTitle>
            <CardDescription className="text-red-700">
              Actions irréversibles - Utilisez avec prudence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-red-800">
                    Effacer toutes les données
                  </h4>
                  <p className="text-sm text-red-700">
                    Supprime définitivement toutes les données de la plateforme
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Effacer toutes les données
                </Button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-medium text-red-800">
                    Désactiver la plateforme
                  </h4>
                  <p className="text-sm text-red-700">
                    Rend la plateforme inaccessible aux utilisateurs
                  </p>
                </div>
                <Button variant="destructive" disabled>
                  Désactiver la plateforme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminSettings;
