import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const categories = [
  { value: "eau", label: "Eau et assainissement" },
  { value: "voirie", label: "Voirie et transport" },
  { value: "eclairage", label: "Éclairage public" },
  { value: "sante", label: "Santé publique" },
  { value: "education", label: "Éducation" },
  { value: "environnement", label: "Environnement" },
  { value: "securite", label: "Sécurité" },
  { value: "autre", label: "Autre" },
];

export default function DashboardAnalytics() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile || (profile.role !== "autorite" && profile.role !== "admin")) {
      navigate("/");
      return;
    }

    fetchData();
  };

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*");

    if (!error && data) {
      setReports(data);
      calculateStats(data);
    }

    setLoading(false);
  };

  const calculateStats = (reportsData: any[]) => {
    const stats = categories.map((category) => {
      const categoryReports = reportsData.filter((r) => r.category === category.value);
      return {
        ...category,
        count: categoryReports.length,
        signale: categoryReports.filter((r) => r.status === "signale").length,
        en_cours: categoryReports.filter((r) => r.status === "en_cours").length,
        resolu: categoryReports.filter((r) => r.status === "resolu").length,
      };
    });

    setCategoryStats(stats.filter((s) => s.count > 0));
  };

  const exportToCSV = () => {
    const headers = ["ID", "Titre", "Catégorie", "Statut", "Adresse", "Date de création"];
    const rows = reports.map((r) => [
      r.id,
      r.title,
      categories.find((c) => c.value === r.category)?.label || r.category,
      r.status,
      r.location_address,
      new Date(r.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `streetbi-reports-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analyses et rapports</h1>
            <p className="text-muted-foreground">Statistiques détaillées sur les signalements</p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
              <CardDescription>Nombre de signalements par catégorie et leur statut</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryStats.map((stat) => (
                  <div key={stat.value} className="border-b border-border last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{stat.label}</h4>
                      <span className="text-2xl font-bold">{stat.count}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-status-pending/10 rounded p-2 text-center">
                        <div className="text-status-pending font-medium">{stat.signale}</div>
                        <div className="text-muted-foreground">Signalés</div>
                      </div>
                      <div className="bg-status-in-progress/10 rounded p-2 text-center">
                        <div className="text-status-in-progress font-medium">{stat.en_cours}</div>
                        <div className="text-muted-foreground">En cours</div>
                      </div>
                      <div className="bg-status-resolved/10 rounded p-2 text-center">
                        <div className="text-status-resolved font-medium">{stat.resolu}</div>
                        <div className="text-muted-foreground">Résolus</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques générales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total des signalements</div>
                  <div className="text-3xl font-bold">{reports.length}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Taux de résolution</div>
                  <div className="text-3xl font-bold">
                    {reports.length > 0
                      ? Math.round((reports.filter((r) => r.status === "resolu").length / reports.length) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}