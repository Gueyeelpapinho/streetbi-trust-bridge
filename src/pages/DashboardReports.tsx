import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mockReportsMap, normalizeStatus, getUserReports } from "@/lib/mockData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

const statusConfig = {
  signale: { label: "Signalé", color: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-yellow-500" },
  resolu: { label: "Résolu", color: "bg-green-500" },
};

export default function DashboardReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, statusFilter, categoryFilter, reports]);

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

    fetchReports();
  };

  const fetchReports = async () => {
    // Éviter les appels multiples simultanés
    if (isFetching) return;
    
    setIsFetching(true);
    setLoading(true);
    
    // Utiliser les données mockées + les signalements utilisateur depuis localStorage
    try {
      // Normaliser les données mockées pour correspondre au format attendu
      const normalizedMockReports = mockReportsMap.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      // Récupérer les signalements utilisateur depuis localStorage
      const userReports = getUserReports().map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      // Combiner les deux sources de données
      const allReports = [...userReports, ...normalizedMockReports];

      // Trier par date de création (plus récent en premier)
      allReports.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      setReports(allReports);
      setFilteredReports(allReports);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.location_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }

    setFilteredReports(filtered);
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
          <h1 className="text-3xl font-bold mb-2">Gestion des signalements</h1>
          <p className="text-muted-foreground">Visualisez et gérez tous les signalements</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="signale">Signalé</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="resolu">Résolu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Hashblock</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const category = categories.find((c) => c.value === report.category);
                  const status = statusConfig[report.status as keyof typeof statusConfig];

                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono text-xs">
                        {report.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>
                        <span className="text-sm">{category?.label}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(report.created_at), "dd/MM/yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-sm">{report.location_address}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {report.hedera_hash ? (
                          <div className="flex items-center space-x-1 max-w-[120px]">
                            <LinkIcon className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="font-mono truncate" title={report.hedera_hash}>
                              {report.hedera_hash.substring(0, 12)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{report.assigned_agent || "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}