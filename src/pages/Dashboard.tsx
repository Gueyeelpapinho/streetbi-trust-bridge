import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    signale: 0,
    en_cours: 0,
    resolu: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user is authority
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile || (profile.role !== "autorite" && profile.role !== "admin")) {
      navigate("/");
      return;
    }

    setUser(session.user);
    fetchStats();
  };

  const fetchStats = async () => {
    const { data: reports } = await supabase
      .from("reports")
      .select("status");

    if (reports) {
      setStats({
        total: reports.length,
        signale: reports.filter(r => r.status === "signale").length,
        en_cours: reports.filter(r => r.status === "en_cours").length,
        resolu: reports.filter(r => r.status === "resolu").length,
      });
    }

    setLoading(false);
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble des signalements</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total des signalements</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Signalés</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.signale}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.en_cours}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolu}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => navigate("/dashboard/reports")}
              className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Gérer les signalements</div>
              <div className="text-sm text-muted-foreground">Voir et mettre à jour tous les signalements</div>
            </button>
            <button
              onClick={() => navigate("/dashboard/analytics")}
              className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Analyses et rapports</div>
              <div className="text-sm text-muted-foreground">Visualiser les statistiques et exporter des rapports</div>
            </button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}