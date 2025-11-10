import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { mockReportsMap, normalizeStatus } from "@/lib/mockData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BarChart3,
  MapPin,
  Filter,
  Search,
  Eye,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Users,
  LogOut,
  Droplets,
  Zap,
  Car,
  GraduationCap,
  Heart,
  Shield,
  Leaf,
  AlertCircle,
} from "lucide-react";
import streetbiLogo from "@/assets/streetbi-logo.jpg";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const categories = [
  { value: "eau", label: "Eau et assainissement", icon: Droplets, color: "bg-blue-500" },
  { value: "voirie", label: "Voirie et transport", icon: Car, color: "bg-gray-500" },
  { value: "eclairage", label: "Éclairage public", icon: Zap, color: "bg-yellow-500" },
  { value: "sante", label: "Santé publique", icon: Heart, color: "bg-red-500" },
  { value: "education", label: "Éducation", icon: GraduationCap, color: "bg-green-500" },
  { value: "environnement", label: "Environnement", icon: Leaf, color: "bg-emerald-500" },
  { value: "securite", label: "Sécurité", icon: Shield, color: "bg-orange-500" },
  { value: "autre", label: "Autre", icon: AlertCircle, color: "bg-purple-500" },
];

const statusConfig = {
  signale: { label: "Signalé", color: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-yellow-500" },
  resolu: { label: "Résolu", color: "bg-green-500" },
};

const statusColors = {
  signale: "#FFCD00", // Jaune
  en_cours: "#0066FF", // Bleu
  resolu: "#00A651", // Vert
};

const statusLabels = {
  signale: "Signalé",
  en_cours: "En cours",
  resolu: "Résolu",
};

const categoryIcons = {
  eau: Droplets,
  eclairage: Zap,
  voirie: Car,
  education: GraduationCap,
  sante: Heart,
  securite: Shield,
  environnement: Leaf,
  autre: AlertCircle,
};

// Coordonnées de Dakar, Sénégal
const DAKAR_CENTER: [number, number] = [14.7150, -17.4000];

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    signale: 0,
    en_cours: 0,
    resolu: 0,
  });
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<"overview" | "reports" | "analytics">("overview");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [updateComment, setUpdateComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [reportUpdates, setReportUpdates] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<Array<{ name: string; count: number; value: string }>>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      filterReports();
    }
  }, [searchTerm, filterStatus]);

  // Fermer les popups Leaflet quand le modal est ouvert
  useEffect(() => {
    if (showReportModal) {
      // Fermer toutes les popups Leaflet ouvertes
      const mapContainer = document.querySelector('.leaflet-container');
      if (mapContainer) {
        // Leaflet stocke les popups dans L.popup, on peut les fermer via l'API
        const popups = document.querySelectorAll('.leaflet-popup');
        popups.forEach((popup) => {
          const closeButton = popup.querySelector('.leaflet-popup-close-button');
          if (closeButton) {
            (closeButton as HTMLElement).click();
          }
        });
      }
    }
  }, [showReportModal]);

  const checkAuth = async () => {
    // Mode test : bypass des credentials en développement
    const isTestMode = import.meta.env.DEV || import.meta.env.MODE === 'development';
    
    if (isTestMode) {
      // En mode test, on crée un utilisateur mock et on bypass la vérification
      setUser({
        id: "test-user-id",
        email: "test@autorite.sn",
        user_metadata: { full_name: "Autorité Test" }
      });
      setProfile({
        id: "test-user-id",
        full_name: "Autorité Test",
        role: "autorite"
      });
      fetchReports();
      return;
    }

    // Mode production : authentification normale
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profileData || (profileData.role !== "autorite" && profileData.role !== "admin")) {
      navigate("/");
      return;
    }

    setUser(session.user);
    setProfile(profileData);
    fetchReports();
  };

  const fetchReports = async () => {
    // Éviter les appels multiples simultanés
    if (isFetching) return;
    
    setIsFetching(true);
    setLoading(true);
    
    // Utiliser uniquement les données mockées
    try {
      // Normaliser les données mockées pour correspondre au format attendu
      const normalizedReports = mockReportsMap.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      // Trier par date de création (plus récent en premier)
      normalizedReports.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      setReports(normalizedReports);
      calculateStats(normalizedReports);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
      setReports([]);
      calculateStats([]);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  };

  const fetchReportUpdates = async (reportId: string) => {
    // Pour les données mockées, on n'a pas de mises à jour historiques
    // On peut créer une mise à jour factice si nécessaire
    setReportUpdates([]);
  };


  const calculateStats = (reportsData: any[]) => {
    const total = reportsData.length;
    const signale = reportsData.filter((r) => r.status === "signale").length;
    const en_cours = reportsData.filter((r) => r.status === "en_cours").length;
    const resolu = reportsData.filter((r) => r.status === "resolu").length;

    setStats({
      total,
      signale,
      en_cours,
      resolu,
    });

    // Calculer les catégories les plus signalées
    const categoryCounts = categories.map((cat) => ({
      name: cat.label,
      value: cat.value,
      count: reportsData.filter((r) => r.category === cat.value).length,
    }));

    setTopCategories(
      categoryCounts
        .filter((cat) => cat.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    );
  };

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    const matchesSearch =
      report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location_address?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterReports = () => {
    // Les rapports sont déjà filtrés dans filteredReports
  };

  const updateReportStatus = async (reportId: string, newStatus: "signale" | "en_cours" | "resolu", comment?: string) => {
    // Mettre à jour uniquement dans l'état local (données mockées)
    setReports((prevReports) => {
      return prevReports.map((report) => {
        if (report.id === reportId) {
          return {
            ...report,
            status: newStatus,
            updated_at: new Date().toISOString(),
            resolved_by: newStatus === "resolu" ? profile?.full_name || "Autorité" : null,
          };
        }
        return report;
      });
    });

    // Recalculer les stats
    setReports((prevReports) => {
      calculateStats(prevReports);
      return prevReports;
    });

    toast({
      title: "Succès",
      description: `Le signalement a été marqué comme "${statusConfig[newStatus].label}"`,
    });

    setShowReportModal(false);
    setUpdateComment("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getCategory = (categoryValue: string) => {
    return categories.find((c) => c.value === categoryValue) || categories[categories.length - 1];
  };

  const getStatus = (statusValue: string) => {
    return statusConfig[statusValue as keyof typeof statusConfig] || statusConfig.signale;
  };

  // Composant pour ajuster les bornes de la carte
  const MapBounds = ({ reports }: { reports: any[] }) => {
    const map = useMap();
    
    useEffect(() => {
      if (reports.length > 0) {
        const validReports = reports.filter(r => r.latitude && r.longitude);
        if (validReports.length > 0) {
          const bounds = L.latLngBounds(
            validReports.map(r => [r.latitude, r.longitude] as [number, number])
          );
          // Ajuster les bounds avec un padding pour une meilleure vue
          map.fitBounds(bounds, {
            padding: [50, 50], // Padding en pixels
            maxZoom: 14, // Limiter le zoom max pour éviter d'être trop proche
          });
        } else {
          map.setView(DAKAR_CENTER, 11);
        }
      } else {
        map.setView(DAKAR_CENTER, 11);
      }
    }, [map, reports]);
    
    return null;
  };

  // Créer une icône personnalisée pour les marqueurs
  const createCustomIcon = (color: string, category: string) => {
    const categorySymbols: Record<string, string> = {
      eau: "💧",
      eclairage: "⚡",
      voirie: "🚗",
      education: "📚",
      sante: "❤️",
      securite: "🛡️",
      environnement: "🌱",
      autre: "⚠️",
    };
    
    const symbol = categorySymbols[category] || "📍";
    
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        position: relative;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${color}40;
          position: absolute;
        "></div>
        <div style="
          transform: rotate(45deg);
          color: white;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        ">
          ${symbol}
        </div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "Fonctionnalité d'export PDF en cours de développement",
    });
  };

  const handleExportCSV = () => {
    // Créer un CSV des rapports
    const headers = ["Titre", "Catégorie", "Statut", "Adresse", "Date", "Description"];
    const rows = reports.map((report) => [
      report.title || "",
      getCategory(report.category).label,
      getStatus(report.status).label,
      report.location_address || "",
      format(new Date(report.created_at), "dd/MM/yyyy", { locale: fr }),
      report.description || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapports-${format(new Date(), "yyyy-MM-dd", { locale: fr })}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export réussi",
      description: "Le fichier CSV a été téléchargé",
    });
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

  const renderOverview = () => {
    const previousMonthTotal = Math.floor(stats.total * 0.88); // Simulation: -12%
    const percentageChange = stats.total > 0 ? ((stats.total - previousMonthTotal) / previousMonthTotal) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">Vue d'ensemble des signalements communautaires</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total signalements</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {percentageChange > 0 ? "+" : ""}
                {percentageChange.toFixed(0)}% par rapport au mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.signale}</div>
              <p className="text-xs text-muted-foreground">Nécessite une action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.en_cours}</div>
              <p className="text-xs text-muted-foreground">En cours de traitement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résolus</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.resolu}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.resolu / stats.total) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map and Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Carte des signalements
              </CardTitle>
              <CardDescription>
                {reports.filter((r) => r.latitude && r.longitude).length} signalements géolocalisés
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className={`h-[400px] w-full relative overflow-hidden rounded-lg ${showReportModal ? 'pointer-events-none opacity-60' : ''}`}>
                {reports.filter((r) => r.latitude && r.longitude).length > 0 ? (
                  <LeafletMapContainer
                    center={DAKAR_CENTER}
                    zoom={11}
                    minZoom={9}
                    maxZoom={18}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={!showReportModal}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapBounds reports={reports} />
                    {reports
                      .filter((r) => r.latitude && r.longitude)
                      .map((report) => {
                        const statusColor = statusColors[report.status as keyof typeof statusColors] || statusColors.signale;
                        const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons] || AlertCircle;
                        const icon = createCustomIcon(statusColor, report.category);
                        
                        return (
                          <Marker
                            key={report.id}
                            position={[report.latitude, report.longitude]}
                            icon={icon}
                            eventHandlers={{
                              click: () => {
                                setSelectedReport(report);
                                fetchReportUpdates(report.id);
                                setShowReportModal(true);
                              },
                            }}
                          >
                            <Popup maxWidth={300} className="custom-popup">
                              <div className="p-3 min-w-[250px]">
                                <div className="flex items-start justify-between mb-3 pb-2 border-b">
                                  <h3 className="font-bold text-base text-foreground pr-2 leading-tight">
                                    {report.title}
                                  </h3>
                                  <Badge
                                    style={{
                                      backgroundColor: statusColor,
                                      color: "white",
                                      border: "none",
                                    }}
                                    className="text-xs font-semibold px-2 py-1 flex-shrink-0"
                                  >
                                    {statusLabels[report.status as keyof typeof statusLabels] || "Signalé"}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-sm mb-3">
                                  <div
                                    className="p-1.5 rounded-md mr-2"
                                    style={{ backgroundColor: `${statusColor}20` }}
                                  >
                                    <CategoryIcon
                                      className="h-4 w-4"
                                      style={{ color: statusColor }}
                                    />
                                  </div>
                                  <span className="font-medium capitalize text-foreground">
                                    {getCategory(report.category).label}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                                  {report.description}
                                </p>
                                {report.location_address && (
                                  <div className="flex items-start text-xs text-muted-foreground mb-3 p-2 bg-muted/50 rounded-md">
                                    <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                                    <span className="leading-relaxed">{report.location_address}</span>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    fetchReportUpdates(report.id);
                                    setShowReportModal(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Voir les détails
                                </Button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                  </LeafletMapContainer>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="text-center p-6 bg-background rounded-lg shadow-lg border">
                      <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">Aucun signalement géolocalisé</p>
                      <p className="text-xs text-muted-foreground mt-1">Les signalements avec coordonnées GPS apparaîtront ici</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Derniers signalements reçus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports
                .sort((a, b) => {
                  const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                  const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 5)
                .map((report) => {
                  const category = getCategory(report.category);
                  const status = getStatus(report.status);
                  const CategoryIcon = category.icon;

                  // Les données sont déjà validées et nettoyées dans fetchReports
                  const title = report.title || 'Signalement sans titre';
                  const address = report.location_address || 'Adresse non spécifiée';
                  const date = report.created_at 
                    ? format(new Date(report.created_at), "dd MMM yyyy", { locale: fr })
                    : 'Date inconnue';

                  return (
                    <div
                      key={report.id}
                      className="flex items-start gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedReport(report);
                        fetchReportUpdates(report.id);
                        setShowReportModal(true);
                      }}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${category.color}`}>
                        <CategoryIcon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={title}>{title}</p>
                        <p className="text-xs text-muted-foreground truncate" title={address}>{address}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  );
                })}
              {reports.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun signalement pour le moment</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Catégories les plus signalées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCategories.map((category, index) => {
                  const percentage = stats.total > 0 ? (category.count / stats.total) * 100 : 0;
                  const categoryConfig = getCategory(category.value);
                  const CategoryIcon = categoryConfig.icon;

                  return (
                    <div key={category.value} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-medium text-sm">{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${categoryConfig.color}`}>
                            <CategoryIcon className="w-3 h-3" />
                          </span>
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className={`${categoryConfig.color} h-2 rounded-full transition-all`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{category.count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">Gestion des signalements</h1>
            <p className="text-muted-foreground">Traiter et suivre les signalements communautaires</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher dans les signalements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="signale">Signalé</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="resolu">Résolu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signalement</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.map((report) => {
              const category = getCategory(report.category);
              const status = getStatus(report.status);
              const CategoryIcon = category.icon;

              return (
                <TableRow key={report.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">{report.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${category.color}`}>
                        <CategoryIcon className="w-3 h-3" />
                      </span>
                      <span className="text-sm">{category.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(report.created_at), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{report.location_address}</TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        fetchReportUpdates(report.id);
                        setShowReportModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const renderAnalytics = () => {
    // Calculer la répartition par quartier (basé sur l'adresse)
    const neighborhoodCounts: Record<string, number> = {};
    reports.forEach((report) => {
      if (report.location_address) {
        // Extraire le quartier de l'adresse (premier mot après la virgule ou dernier mot)
        const parts = report.location_address.split(",");
        const neighborhood = parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
        neighborhoodCounts[neighborhood] = (neighborhoodCounts[neighborhood] || 0) + 1;
      }
    });

    const topNeighborhoods = Object.entries(neighborhoodCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analyses et rapports</h1>
          <p className="text-muted-foreground">Statistiques détaillées pour aide à la prise de décision</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p>Graphique d'évolution</p>
                  <p className="text-xs mt-1">Total: {stats.total} signalements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par quartier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                {topNeighborhoods.length > 0 ? (
                  <div className="w-full space-y-3">
                    {topNeighborhoods.map((neighborhood, index) => {
                      const percentage = stats.total > 0 ? (neighborhood.count / stats.total) * 100 : 0;
                      return (
                        <div key={neighborhood.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-primary font-medium text-sm">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium">{neighborhood.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{neighborhood.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                    <p>Aucune donnée de quartier</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => {
                const count = reports.filter((r) => r.category === category.value).length;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={category.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${category.color}`}>
                        <category.icon className="w-3 h-3" />
                      </span>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className={`${category.color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">{count}</span>
                      <span className="text-xs text-muted-foreground w-10 text-right">({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="w-4 h-4 mr-2" />
              Exporter PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="w-4 h-4 mr-2" />
              Exporter CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="bg-background shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <img src={streetbiLogo} alt="StreetBi" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold">StreetBi Admin</span>
              </div>

              <nav className="flex gap-6">
                <Button
                  variant={currentView === "overview" ? "default" : "ghost"}
                  onClick={() => setCurrentView("overview")}
                >
                  Vue d'ensemble
                </Button>
                <Button
                  variant={currentView === "reports" ? "default" : "ghost"}
                  onClick={() => setCurrentView("reports")}
                >
                  Signalements
                </Button>
                <Button
                  variant={currentView === "analytics" ? "default" : "ghost"}
                  onClick={() => setCurrentView("analytics")}
                >
                  Analyses
                </Button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {profile?.full_name || "Autorité"}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        {currentView === "overview" && renderOverview()}
        {currentView === "reports" && renderReports()}
        {currentView === "analytics" && renderAnalytics()}
      </div>

      {/* Report Detail Modal */}
      <Dialog
        open={showReportModal}
        onOpenChange={(open) => {
          setShowReportModal(open);
          if (!open) {
            setUpdateComment("");
            setReportUpdates([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const category = getCategory(selectedReport.category);
                    const CategoryIcon = category.icon;
                    return (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${category.color}`}>
                        <CategoryIcon className="w-3 h-3" />
                      </span>
                    );
                  })()}
                  {selectedReport.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedReport.location_address} • {format(new Date(selectedReport.created_at), "dd MMM yyyy", { locale: fr })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedReport.image_url && (
                  <img src={selectedReport.image_url} alt="Signalement" className="w-full h-48 object-cover rounded-lg" />
                )}

                <div>
                  <Label className="font-medium">Description</Label>
                  <p className="mt-1 text-muted-foreground">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Statut actuel</Label>
                    <Badge className={`mt-1 ${getStatus(selectedReport.status).color}`}>
                      {getStatus(selectedReport.status).label}
                    </Badge>
                  </div>

                  {selectedReport.hedera_hash && (
                    <div>
                      <Label className="font-medium">Hash blockchain</Label>
                      <p className="mt-1 text-sm font-mono text-muted-foreground truncate">{selectedReport.hedera_hash}</p>
                    </div>
                  )}
                </div>

                {/* Status Update */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mettre à jour le statut</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={selectedReport.status === "en_cours" ? "default" : "outline"}
                        onClick={() => {
                          updateReportStatus(selectedReport.id, "en_cours", updateComment || "Signalement pris en compte.");
                        }}
                        disabled={selectedReport.status === "resolu"}
                      >
                        Mettre en cours
                      </Button>

                      <Button
                        size="sm"
                        variant={selectedReport.status === "resolu" ? "default" : "outline"}
                        onClick={() => {
                          updateReportStatus(selectedReport.id, "resolu", updateComment || "Problème résolu avec succès.");
                        }}
                      >
                        Marquer comme résolu
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="comment">Ajouter un commentaire public</Label>
                      <Textarea
                        id="comment"
                        placeholder="Commentaire visible par le citoyen..."
                        className="mt-1"
                        value={updateComment}
                        onChange={(e) => setUpdateComment(e.target.value)}
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          if (updateComment.trim() && selectedReport.id) {
                            // Ajouter le commentaire dans l'état local (données mockées)
                            const newUpdate = {
                              id: `update-${Date.now()}`,
                              report_id: selectedReport.id,
                              user_id: user?.id || "autorite",
                              status: selectedReport.status,
                              comment: updateComment,
                              is_public: true,
                              created_at: new Date().toISOString(),
                            };
                            
                            setReportUpdates((prev) => [newUpdate, ...prev]);
                            
                            toast({
                              title: "Succès",
                              description: "Commentaire publié avec succès",
                            });
                            setUpdateComment("");
                          }
                        }}
                        disabled={!updateComment.trim()}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Publier le commentaire
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments History */}
                {reportUpdates.length > 0 && (
                  <div>
                    <Label className="font-medium">Historique des commentaires</Label>
                    <div className="mt-2 space-y-3">
                      {reportUpdates.map((update) => (
                        <div key={update.id} className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {update.user_id === user?.id ? profile?.full_name || "Autorité" : "Système"}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatus(update.status).color} variant="outline">
                                {getStatus(update.status).label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(update.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                              </span>
                            </div>
                          </div>
                          {update.comment && (
                            <p className="text-sm text-foreground mt-1">{update.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
