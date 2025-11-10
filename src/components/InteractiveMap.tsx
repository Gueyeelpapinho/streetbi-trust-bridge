import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Droplets, Zap, Car, GraduationCap, Heart, Shield, Leaf, AlertCircle, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "leaflet/dist/leaflet.css";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { mockReportsMap, getUserReports, normalizeStatus } from "@/lib/mockData";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

const statusConfig = {
  signale: { label: "Signalé", color: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-yellow-500" },
  resolu: { label: "Résolu", color: "bg-green-500" },
};

const categoryLabels = {
  eau: "Eau et assainissement",
  voirie: "Voirie et transport",
  eclairage: "Éclairage public",
  sante: "Santé publique",
  education: "Éducation",
  environnement: "Environnement",
  securite: "Sécurité",
  autre: "Autre",
};

const categoryColors = {
  eau: "bg-blue-500",
  voirie: "bg-gray-500",
  eclairage: "bg-yellow-500",
  sante: "bg-red-500",
  education: "bg-green-500",
  environnement: "bg-emerald-500",
  securite: "bg-orange-500",
  autre: "bg-purple-500",
};

// Coordonnées de Dakar, Sénégal - Centre ajusté pour mieux afficher les signalements (Dakar + banlieues)
const DAKAR_CENTER: [number, number] = [14.7150, -17.4000];

export const InteractiveMap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>(mockReportsMap);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [reportUpdates, setReportUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Charger les données en arrière-plan
    fetchReports();

    // Écouter les changements dans localStorage pour mettre à jour la carte
    const handleStorageChange = () => {
      fetchReports();
    };

    // Vérifier périodiquement les changements (pour les changements dans le même onglet)
    const interval = setInterval(handleStorageChange, 2000);

    // Écouter les événements de stockage (quand localStorage change dans un autre onglet)
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter l'événement personnalisé déclenché lors de la création d'un signalement
    window.addEventListener('userReportsUpdated', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userReportsUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Charger les updates quand un rapport est sélectionné
    if (selectedReport && !selectedReport.id?.startsWith("mock-")) {
      fetchReportUpdates(selectedReport.id);
    } else {
      setReportUpdates([]);
    }
  }, [selectedReport]);

  const fetchReports = async () => {
    // Charger les données mockées + les signalements utilisateur depuis localStorage
    try {
      // Normaliser les signalements mockés
      const normalizedMockReports = mockReportsMap.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      // Récupérer les signalements utilisateur depuis localStorage
      const userReports = getUserReports()
        .map((report) => ({
          ...report,
          status: normalizeStatus(report.status),
          location_address: report.location_address || report.location || '',
          image_url: report.image_url || report.image || '/placeholder.svg',
        }))
        .filter((report) => report.latitude && report.longitude); // Filtrer ceux avec coordonnées GPS

      // Combiner tous les signalements
      const allReports = [...userReports, ...normalizedMockReports];

      // Trier par date (plus récent en premier)
      allReports.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setReports(allReports);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
      // En cas d'erreur, garder les signalements simulés
    }
  };

  const fetchReportUpdates = async (reportId: string) => {
    setLoadingUpdates(true);
    try {
      const { data, error } = await supabase
        .from("report_updates")
        .select("*")
        .eq("report_id", reportId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReportUpdates(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des mises à jour:", error);
      setReportUpdates([]);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handleReportClick = (report: any) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  // Composant pour ajuster automatiquement les bounds de la carte
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
        }
      }
    }, [map, reports]);
    
    return null;
  };

  const createCustomIcon = (color: string, category: string) => {
    // Caractères Unicode pour les catégories
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

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Carte des Signalements
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualisez en temps réel tous les signalements géolocalisés dans votre région.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-3">
            <Card className="h-[500px] relative">
              <CardContent className="p-0 h-full relative">
                <div className="w-full h-full" style={{ minHeight: "500px" }}>
                  <LeafletMapContainer
                    center={DAKAR_CENTER}
                    zoom={11}
                    minZoom={9}
                    maxZoom={18}
                    style={{ height: "100%", width: "100%", minHeight: "500px" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapBounds reports={reports} />
                    {reports.length > 0 ? (
                      reports.map((report) => {
                        if (!report.latitude || !report.longitude) return null;
                        
                        const statusColor = statusColors[report.status as keyof typeof statusColors] || statusColors.signale;
                        const icon = createCustomIcon(statusColor, report.category);
                    
                    return (
                          <Marker
                            key={report.id}
                            position={[report.latitude, report.longitude]}
                            icon={icon}
                            eventHandlers={{
                              click: () => {
                                handleReportClick(report);
                              },
                            }}
                          />
                        );
                      })
                    ) : (
                      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg z-[1000]">
                        <p className="text-sm text-muted-foreground">
                          Aucun signalement géolocalisé pour le moment
                        </p>
                  </div>
                    )}
                  </LeafletMapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend and Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Légende</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(statusLabels).map(([status, label]) => (
                  <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                      ></div>
                      <span className="text-sm">{label}</span>
                  </div>
                    <Badge variant="secondary">
                      {reports.filter((r) => r.status === status).length}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catégories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(categoryIcons).map(([category, Icon]) => {
                  const count = reports.filter((r) => r.category === category).length;
                  if (count === 0) return null;
                  return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm capitalize">{category}</span>
                    </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {reports.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Signalements sur la carte
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" size="lg" onClick={() => navigate("/map")}>
              <MapPin className="h-4 w-4 mr-2" />
              Voir carte complète
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog pour afficher les détails du rapport */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedReport.title}</DialogTitle>
                    <DialogDescription>
                      <Badge
                        style={{
                          backgroundColor: statusColors[selectedReport.status as keyof typeof statusColors] || statusColors.signale,
                          color: "white",
                          border: "none",
                        }}
                        className="text-sm font-semibold px-3 py-1"
                      >
                        {statusLabels[selectedReport.status as keyof typeof statusLabels] || "Signalé"}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2 mt-4">
                {/* Colonne gauche - Informations principales */}
                <div className="space-y-4">
                  {selectedReport.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={selectedReport.image_url}
                        alt={selectedReport.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedReport.description}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Signalé le {format(new Date(selectedReport.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </span>
                    </div>

                    {selectedReport.location_address && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{selectedReport.location_address}</span>
                      </div>
                    )}

                    {selectedReport.latitude && selectedReport.longitude && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Coordonnées: </span>
                        {selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}
                      </div>
                    )}

                    <div>
                      <span className="text-sm font-medium text-foreground">Catégorie: </span>
                      <Badge className={categoryColors[selectedReport.category as keyof typeof categoryColors] || categoryColors.autre}>
                        {categoryLabels[selectedReport.category as keyof typeof categoryLabels] || selectedReport.category}
                      </Badge>
                    </div>

                    {selectedReport.hedera_hash && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <LinkIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-primary text-sm">Preuve Blockchain</p>
                            <p className="text-xs text-muted-foreground break-all mt-1">
                              Hash: {selectedReport.hedera_hash}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedReport.status === "resolu" && (
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Résolution</h4>
                        <div className="space-y-2 text-sm">
                          {selectedReport.resolved_by && (
                            <p>
                              <span className="font-medium text-green-900 dark:text-green-100">Résolu par: </span>
                              <span className="text-green-700 dark:text-green-300">{selectedReport.resolved_by}</span>
                            </p>
                          )}
                          {selectedReport.resolution_cost && (
                            <p>
                              <span className="font-medium text-green-900 dark:text-green-100">Coût: </span>
                              <span className="text-green-700 dark:text-green-300">{selectedReport.resolution_cost} FCFA</span>
                            </p>
                          )}
                          {selectedReport.resolution_note && (
                            <div>
                              <p className="font-medium text-green-900 dark:text-green-100 mb-1">Note:</p>
                              <p className="text-green-700 dark:text-green-300">{selectedReport.resolution_note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedReport.assigned_agent && (
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Agent assigné: </span>
                        <span className="text-muted-foreground">{selectedReport.assigned_agent}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Colonne droite - Timeline et informations supplémentaires */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-4 text-foreground">Timeline du statut</h4>
                    <div className="space-y-4">
                      {/* Statut actuel */}
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: statusColors[selectedReport.status as keyof typeof statusColors] || statusColors.signale,
                          }}
                        ></div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {statusLabels[selectedReport.status as keyof typeof statusLabels] || "Signalé"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedReport.updated_at
                              ? format(new Date(selectedReport.updated_at), "dd MMM yyyy, HH:mm", { locale: fr })
                              : format(new Date(selectedReport.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>

                      {/* Timeline des updates */}
                      {loadingUpdates ? (
                        <div className="text-sm text-muted-foreground">Chargement des mises à jour...</div>
                      ) : reportUpdates.length > 0 ? (
                        <div className="border-l-2 border-muted ml-1.5 pl-6 space-y-4">
                          {reportUpdates.map((update) => {
                            const updateStatusColor = statusColors[update.status as keyof typeof statusColors] || statusColors.signale;
                            return (
                              <div key={update.id}>
                                <div className="flex items-start space-x-4">
                                  <div
                                    className="w-3 h-3 rounded-full -ml-7 mt-1.5 flex-shrink-0"
                                    style={{ backgroundColor: updateStatusColor }}
                                  ></div>
                                  <div className="flex-1 -ml-3">
                                    <p className="font-medium text-foreground">
                                      {statusLabels[update.status as keyof typeof statusLabels] || "Signalé"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(update.created_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                                    </p>
                                    {update.comment && (
                                      <p className="text-sm text-muted-foreground mt-1">{update.comment}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : !selectedReport.id?.startsWith("mock-") ? (
                        <div className="text-sm text-muted-foreground">
                          Aucune mise à jour publique pour le moment
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Bouton pour voir la page complète (si le rapport existe dans la DB) */}
                  {!selectedReport.id?.startsWith("mock-") && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsDialogOpen(false);
                        navigate(`/reports/${selectedReport.id}`);
                      }}
                    >
                      Voir la page complète
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};
