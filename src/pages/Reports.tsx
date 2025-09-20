import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin, Clock, Droplets, Zap, Car, GraduationCap, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockReports = [
  {
    id: 1,
    title: "Fuite d'eau importante sur l'avenue Bourguiba",
    description: "Canalisation cassée provoquant une importante fuite d'eau et des désagréments pour les riverains",
    location: "Avenue Bourguiba, Plateau, Dakar",
    status: "pending",
    date: "2024-01-15",
    category: "eau",
    author: "Amadou Diop",
    views: 156,
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Éclairage public défaillant quartier Médina",
    description: "Plusieurs lampadaires ne fonctionnent plus depuis une semaine, créant un problème de sécurité",
    location: "Quartier Médina, Dakar",
    status: "in-progress",
    date: "2024-01-14",
    category: "eclairage",
    author: "Fatou Sall",
    views: 89,
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Nid de poule dangereux route de Pikine",
    description: "Route très dégradée causant des accidents et endommageant les véhicules",
    location: "Route de Pikine, Dakar",
    status: "pending",
    date: "2024-01-13",
    category: "voirie",
    author: "Ousmane Ba",
    views: 234,
    image: "/placeholder.svg"
  },
  {
    id: 4,
    title: "École sans électricité depuis 3 jours",
    description: "Panne électrique dans l'établissement scolaire, perturbant les cours",
    location: "École primaire de Guédiawaye",
    status: "resolved",
    date: "2024-01-10",
    category: "education",
    author: "Aissatou Thiam",
    views: 178,
    image: "/placeholder.svg"
  },
];

const statusLabels = {
  pending: "Nouveau",
  "in-progress": "En cours",
  resolved: "Résolu"
};

const statusColors = {
  pending: "bg-status-pending text-warning-foreground",
  "in-progress": "bg-status-in-progress text-white",
  resolved: "bg-status-resolved text-success-foreground"
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

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Total signalements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-pending">23</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-in-progress">15</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-status-resolved">1,209</div>
              <div className="text-sm text-muted-foreground">Résolus</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => {
            const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons];
            
            return (
              <Card key={report.id} className="hover:shadow-card transition-all duration-300 cursor-pointer" onClick={() => navigate(`/report/${report.id}`)}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image placeholder */}
                    <div className="w-full lg:w-48 h-32 bg-muted rounded-lg flex items-center justify-center">
                      <CategoryIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                          {statusLabels[report.status as keyof typeof statusLabels]}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(report.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>👁 {report.views} vues</span>
                        </div>
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
                          {report.location}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Par {report.author}
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