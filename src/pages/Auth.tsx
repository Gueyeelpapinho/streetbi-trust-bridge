import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Globe, ArrowLeft, Mail, Lock, User, Building2, Loader2 } from "lucide-react";
import streetbiLogo from "@/assets/streetbi-logo.jpg";

type Language = "fr" | "wo" | "ff" | "srr";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [language, setLanguage] = useState<Language>("fr");
  const [activeTab, setActiveTab] = useState<"citizen" | "authority">("citizen");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    orgEmail: "",
    orgPassword: "",
  });

  useEffect(() => {
    const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    if (!isTestMode) {
      // En mode production, vérifier la session normalement
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/");
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          navigate("/");
        }
      });

      return () => subscription.unsubscribe();
    }
    // En mode test, on ne vérifie pas la session ici pour permettre le bypass
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "citizen") {
        if (isSignUp) {
          // Inscription citoyen
          if (formData.password !== formData.confirmPassword) {
            toast({
              title: "Erreur",
              description: "Les mots de passe ne correspondent pas",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }

          const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.name,
                role: "citoyen",
              },
              emailRedirectTo: `${window.location.origin}/`,
            },
          });

          if (error) {
            toast({
              title: "Erreur d'inscription",
              description: error.message,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Inscription réussie",
              description: "Votre compte a été créé avec succès. Vérifiez votre email pour confirmer votre compte.",
            });
            // Reset form
            setFormData({
              email: "",
              password: "",
              name: "",
              confirmPassword: "",
              orgEmail: "",
              orgPassword: "",
            });
            setIsSignUp(false);
          }
        } else {
          // Connexion citoyen
          // Mode test : bypass des credentials en développement
          const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
          
          if (isTestMode) {
            // En mode test, on bypass complètement la validation
            // On essaie de créer/se connecter avec un compte test automatiquement
            try {
              const testEmail = "test.citoyen@streetbi.sn";
              const testPassword = "test123456";
              
              // Essayer de se connecter d'abord
              let { error: loginError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
              });

              // Si la connexion échoue, essayer de créer le compte
              if (loginError) {
                const { error: signUpError } = await supabase.auth.signUp({
                  email: testEmail,
                  password: testPassword,
                  options: {
                    data: {
                      full_name: formData.email || "Citoyen Test",
                      role: "citoyen",
                    },
                  },
                });

                // Si l'inscription réussit, réessayer la connexion après un court délai
                if (!signUpError) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  const { error: retryError } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword,
                  });
                  
                  if (!retryError) {
                    toast({
                      title: "Connexion réussie (Mode Test)",
                      description: "Bienvenue sur StreetBi - Compte test créé",
                    });
                  } else {
                    // Même si ça échoue, on affiche le succès en mode test
                    toast({
                      title: "Mode Test Activé",
                      description: "Vous pouvez continuer (authentification bypass en mode test)",
                    });
                    // En mode test, on peut quand même rediriger
                    setTimeout(() => navigate("/"), 500);
                  }
                } else {
                  // Même si l'inscription échoue, on considère que c'est OK en mode test
                  toast({
                    title: "Mode Test Activé",
                    description: "Connexion simulée - Vous pouvez continuer",
                  });
                  setTimeout(() => navigate("/"), 500);
                }
              } else {
                // Connexion réussie
                toast({
                  title: "Connexion réussie (Mode Test)",
                  description: "Bienvenue sur StreetBi",
                });
              }
            } catch (error) {
              // En cas d'erreur quelconque, on considère que c'est OK en mode test
              console.log("Mode test: erreur ignorée", error);
              toast({
                title: "Mode Test Activé",
                description: "Connexion simulée - Vous pouvez continuer",
              });
              setTimeout(() => navigate("/"), 500);
            }
          } else {
            // Mode production : authentification normale
            const { error } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (error) {
              toast({
                title: "Erreur de connexion",
                description: error.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Connexion réussie",
                description: "Bienvenue sur StreetBi",
              });
            }
          }
        }
      } else {
        // Autorité
        // Mode test : bypass des credentials en développement
        const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
        
        if (isTestMode) {
          // En mode test, on bypass la validation et on redirige directement
          toast({
            title: "Connexion réussie (Mode Test)",
            description: "Bienvenue sur le dashboard autorité",
          });
          navigate("/authority-dashboard");
        } else {
          // Mode production : authentification normale
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.orgEmail,
            password: formData.orgPassword,
          });

          if (error) {
            toast({
              title: "Erreur de connexion",
              description: error.message,
              variant: "destructive",
            });
          } else {
            // Vérifier si l'utilisateur a le rôle autorité
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

              if (profile && (profile.role === "autorite" || profile.role === "admin")) {
                toast({
                  title: "Connexion réussie",
                  description: "Bienvenue sur le dashboard autorité",
                });
                navigate("/authority-dashboard");
              } else {
                toast({
                  title: "Accès refusé",
                  description: "Vous n'avez pas les permissions d'autorité",
                  variant: "destructive",
                });
                await supabase.auth.signOut();
              }
            }
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleBrowseMap = () => {
    navigate("/map");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
          <SelectTrigger className="w-32">
            <Globe className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="wo">Wolof</SelectItem>
            <SelectItem value="ff">Pulaar</SelectItem>
            <SelectItem value="srr">Sérère</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <img src={streetbiLogo} alt="StreetBi" className="w-16 h-16 rounded-lg" />
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isSignUp ? "Créer un compte" : "Se connecter"}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? "Rejoignez la communauté StreetBi"
                : "Accédez à votre espace personnel"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value as "citizen" | "authority");
                // Réinitialiser le formulaire et le mode signup lors du changement d'onglet
                setIsSignUp(false);
                setFormData({
                  email: "",
                  password: "",
                  name: "",
                  confirmPassword: "",
                  orgEmail: "",
                  orgPassword: "",
                });
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="citizen" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Citoyen
                </TabsTrigger>
                <TabsTrigger value="authority" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Autorité
                </TabsTrigger>
              </TabsList>

              <TabsContent value="citizen">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Votre nom complet"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="votre@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="••••••••"
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSignUp ? "Créer mon compte citoyen" : "Se connecter"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="authority">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">Accès institutionnel</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      Réservé aux mairies, ONG et organismes officiels
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-email">Email institutionnel</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="org-email"
                        type="email"
                        value={formData.orgEmail}
                        onChange={(e) => handleInputChange("orgEmail", e.target.value)}
                        placeholder="contact@mairie.sn"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="org-password"
                        type="password"
                        value={formData.orgPassword}
                        onChange={(e) => handleInputChange("orgPassword", e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-warning hover:bg-warning/90" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Accès autorité
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Toggle Sign Up / Sign In */}
            {activeTab === "citizen" && (
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({
                      email: "",
                      password: "",
                      name: "",
                      confirmPassword: "",
                      orgEmail: "",
                      orgPassword: "",
                    });
                  }}
                  className="text-sm"
                  type="button"
                >
                  {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
                </Button>
              </div>
            )}

            {/* Browse Map Option */}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleBrowseMap} className="w-full" type="button">
                Consulter la carte sans compte
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
          <p>🔒 Vos données sont sécurisées par la blockchain Hedera</p>
          <p className="mt-2">🏆 Gagnez des tokens WER en contribuant à votre communauté</p>
        </div>
      </div>
    </div>
  );
}
