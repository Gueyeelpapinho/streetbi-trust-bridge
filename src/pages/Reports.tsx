import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Clock, Droplets, Zap, Car, GraduationCap, Plus, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockReportsSimple, getUserReports, mockReportsMap, normalizeStatus } from "@/lib/mockData";

const statusLabels = {
  pending: "Nouveau",
  "in-progress": "En cours",
  resolved: "Résolu",
  signale: "Signalé",
  en_cours: "En cours",
  resolu: "Résolu"
};

const statusColors = {
  pending: "bg-status-pending text-warning-foreground",
  "in-progress": "bg-status-in-progress text-white",
  resolved: "bg-status-resolved text-success-foreground",
  signale: "bg-status-pending text-warning-foreground",
  en_cours: "bg-status-in-progress text-white",
  resolu: "bg-status-resolved text-success-foreground"
};

const categoryIcons = {
  eau: Droplets,
  eclairage: Zap,
  voirie: Car,
  education: GraduationCap
};

export default function Reports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [allReports, setAllReports] = useState<any[]>([]);

  // Charger tous les signalements (mockés + utilisateur)
  useEffect(() => {
    // Normaliser les signalements mockés simples
    const normalizedMockSimple = mockReportsSimple.map((report) => ({
      ...report,
      status: normalizeStatus(report.status),
      location_address: report.location_address || report.location || '',
      location: report.location || report.location_address || '',
      image_url: report.image_url || report.image || '/placeholder.svg',
      views: report.views || 0,
      author: report.author || 'Utilisateur',
    }));

    // Normaliser les signalements mockés de la carte
    const normalizedMockMap = mockReportsMap.map((report) => ({
      ...report,
      status: normalizeStatus(report.status),
      location_address: report.location_address || report.location || '',
      location: report.location || report.location_address || '',
      image_url: report.image_url || report.image || '/placeholder.svg',
      views: report.views || 0,
      author: report.author || 'Utilisateur',
    }));

    // Récupérer les signalements utilisateur depuis localStorage (déjà migrés par getUserReports)
    const userReports = getUserReports().map((report) => ({
      ...report,
      status: normalizeStatus(report.status),
      location_address: report.location_address || report.location || '',
      location: report.location || report.location_address || '',
      image_url: report.image_url || report.image || '/placeholder.svg',
      views: report.views || 0,
      author: report.author || 'Utilisateur',
    }));

    // Combiner tous les signalements et trier par date (plus récent en premier)
    const combined = [...userReports, ...normalizedMockMap, ...normalizedMockSimple];
    combined.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setAllReports(combined);
  }, []);

  // Écouter les changements dans localStorage pour mettre à jour la liste
  useEffect(() => {
    const handleStorageChange = () => {
      const userReports = getUserReports().map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        location: report.location || report.location_address || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
        views: report.views || 0,
        author: report.author || 'Utilisateur',
      }));

      const normalizedMockSimple = mockReportsSimple.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        location: report.location || report.location_address || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
        views: report.views || 0,
        author: report.author || 'Utilisateur',
      }));

      const normalizedMockMap = mockReportsMap.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        location: report.location || report.location_address || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
        views: report.views || 0,
        author: report.author || 'Utilisateur',
      }));

      const combined = [...userReports, ...normalizedMockMap, ...normalizedMockSimple];
      combined.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setAllReports(combined);
    };

    // Écouter les événements de stockage (quand localStorage change dans un autre onglet)
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter l'événement personnalisé déclenché lors de la création d'un signalement
    window.addEventListener('userReportsUpdated', handleStorageChange);
    
    // Vérifier aussi périodiquement (pour les changements dans le même onglet)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userReportsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredReports = allReports.filter(report => {
    const location = report.location || report.location_address || "";
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normaliser le statut pour le filtrage
    const normalizedStatus = report.status === "pending" || report.status === "signale" ? "pending"
      : report.status === "in-progress" || report.status === "en_cours" ? "in-progress"
      : "resolved";
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "pending" && (report.status === "pending" || report.status === "signale")) ||
      (statusFilter === "in-progress" && (report.status === "in-progress" || report.status === "en_cours")) ||
      (statusFilter === "resolved" && (report.status === "resolved" || report.status === "resolu")) ||
      normalizedStatus === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculer les statistiques réelles à partir de tous les signalements
  const stats = {
    total: allReports.length,
    pending: allReports.filter(r => r.status === "pending" || r.status === "signale").length,
    inProgress: allReports.filter(r => r.status === "in-progress" || r.status === "en_cours").length,
    resolved: allReports.filter(r => r.status === "resolved" || r.status === "resolu").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tous les signalements
            </h1>
            <p className="text-muted-foreground">
              Découvrez et suivez tous les signalements de la communauté
            </p>
          </div>
          <Button onClick={() => navigate("/new-report")}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau signalement
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un signalement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">Nouveau</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="eau">Eau et assainissement</SelectItem>
                  <SelectItem value="voirie">Voirie et transport</SelectItem>
                  <SelectItem value="eclairage">Éclairage public</SelectItem>
                  <SelectItem value="education">Éducation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.total.toLocaleString('fr-FR')}</div>
              <div className="text-sm text-muted-foreground">Total signalements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-pending">{stats.pending.toLocaleString('fr-FR')}</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-in-progress">{stats.inProgress.toLocaleString('fr-FR')}</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-resolved">{stats.resolved.toLocaleString('fr-FR')}</div>
              <div className="text-sm text-muted-foreground">Résolus</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => {
            const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons];
            const status = report.status === "pending" || report.status === "signale" ? "signale" 
              : report.status === "in-progress" || report.status === "en_cours" ? "en_cours"
              : "resolu";
            const displayStatus = report.status === "pending" || report.status === "signale" ? "pending" 
              : report.status === "in-progress" || report.status === "en_cours" ? "in-progress"
              : "resolved";
            
            return (
              <Card key={report.id} className="hover:shadow-card transition-all duration-300 cursor-pointer" onClick={() => navigate(`/report/${report.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    {report.image_url && report.image_url !== '/placeholder.svg' ? (
                      <div className="w-full lg:w-48 h-32 rounded-lg overflow-hidden">
                        <img 
                          src={report.image_url} 
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full lg:w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <CategoryIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[displayStatus as keyof typeof statusColors]}>
                          {statusLabels[status as keyof typeof statusLabels]}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {report.date ? new Date(report.date).toLocaleDateString('fr-FR') : (report.created_at ? new Date(report.created_at).toLocaleDateString('fr-FR') : 'Date inconnue')}
                        </div>
                        {(report.views !== undefined && report.views !== null) && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>👁 {report.views} vues</span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                          {report.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {report.location || report.location_address}
                        </div>
                        {report.author && (
                          <div className="text-sm text-muted-foreground">
                            Par {report.author}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mt-2">
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-3 w-3 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-primary">Hashblock Hedera</p>
                            <p className="text-xs text-muted-foreground truncate font-mono">
                              {report.hedera_hash || 'En cours de génération...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun signalement trouvé
              </h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche ou créez un nouveau signalement.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}