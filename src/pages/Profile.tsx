import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Award, Gift, HelpCircle, Settings, Clock, CheckCircle } from "lucide-react";

const userStats = {
  name: "Amadou Diop",
  email: "amadou.diop@email.com",
  joinDate: "Janvier 2024",
  totalReports: 15,
  resolvedReports: 12,
  werTokens: 450,
  level: "Citoyen Actif",
  nextLevel: 500,
};

const userReports = [
  {
    id: 1,
    title: "Fuite d'eau avenue Bourguiba",
    status: "resolved",
    date: "2024-01-15",
    werEarned: 50,
  },
  {
    id: 2,
    title: "Éclairage défaillant Médina",
    status: "in-progress",
    date: "2024-01-14",
    werEarned: 0,
  },
  {
    id: 3,
    title: "Nid de poule route Pikine",
    status: "pending",
    date: "2024-01-13",
    werEarned: 0,
  },
];

const achievements = [
  {
    title: "Premier signalement",
    description: "Vous avez créé votre premier signalement",
    earned: true,
    werReward: 25,
  },
  {
    title: "Contributeur régulier",
    description: "10 signalements créés",
    earned: true,
    werReward: 100,
  },
  {
    title: "Impact communautaire",
    description: "5 problèmes résolus grâce à vos signalements",
    earned: true,
    werReward: 150,
  },
  {
    title: "Ambassadeur StreetBi",
    description: "25 signalements créés",
    earned: false,
    werReward: 250,
  },
];

const statusLabels = {
  pending: "En attente",
  "in-progress": "En cours",
  resolved: "Résolu"
};

const statusColors = {
  pending: "bg-status-pending text-warning-foreground",
  "in-progress": "bg-status-in-progress text-white",
  resolved: "bg-status-resolved text-success-foreground"
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // Mode test : bypass des credentials en développement
    const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    if (isTestMode) {
      // En mode test, on crée un profil mock
      setProfile({
        id: "test-citoyen-id",
        full_name: "Citoyen Test",
        role: "citoyen",
        wer_tokens: 150,
        reports_submitted: 5,
        problems_resolved: 2,
        phone: "+221 77 123 45 67",
      });
      setLoading(false);
      return;
    }

    // Mode production : authentification normale
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p className="text-center">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const progressToNextLevel = (profile.wer_tokens / 500) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Mon Profil
            </h1>
            <p className="text-muted-foreground">
              Gérez votre compte et suivez vos contributions à la communauté
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Avatar className="w-20 h-20 mx-auto">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {userStats.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="text-xl font-semibold">{profile.full_name || "Utilisateur"}</h3>
                      <Badge variant="secondary" className="mt-2">
                        Citoyen Actif
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WER Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-reward" />
                    Tokens WER
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-reward">{profile.wer_tokens}</div>
                    <div className="text-sm text-muted-foreground">Tokens disponibles</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression vers le niveau suivant</span>
                      <span>{profile.wer_tokens}/500</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2" />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Comment ça marche ?
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{profile.reports_submitted}</div>
                      <div className="text-xs text-muted-foreground">Signalements</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">{profile.problems_resolved}</div>
                      <div className="text-xs text-muted-foreground">Résolus</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="reports" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="reports">Mes Signalements</TabsTrigger>
                  <TabsTrigger value="achievements">Récompenses</TabsTrigger>
                  <TabsTrigger value="settings">Paramètres</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-4">
                  {userReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{report.title}</h4>
                          <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                            {statusLabels[report.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(report.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center text-reward">
                            <Gift className="h-3 w-3 mr-1" />
                            {report.werEarned > 0 ? `+${report.werEarned} WER` : 'En attente'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="achievements" className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className={achievement.earned ? "border-success" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.earned ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {achievement.earned ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <Award className="h-6 w-6" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            <div className="flex items-center text-sm">
                              <Gift className="h-3 w-3 mr-1 text-reward" />
                              <span className="text-reward font-medium">
                                {achievement.werReward} WER
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Préférences du compte</CardTitle>
                      <CardDescription>
                        Gérez vos informations personnelles et préférences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" className="w-full">
                        <User className="h-4 w-4 mr-2" />
                        Modifier le profil
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Préférences de notification
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => navigate("/settings")}>
                        Paramètres de langue
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres de confidentialité</CardTitle>
                      <CardDescription>
                        Contrôlez la visibilité de vos informations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Profil public</span>
                        <Button variant="outline" size="sm">Activé</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Afficher mes statistiques</span>
                        <Button variant="outline" size="sm">Activé</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}