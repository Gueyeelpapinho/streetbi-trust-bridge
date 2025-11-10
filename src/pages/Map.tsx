import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, Zap, Car, GraduationCap, Heart, Shield, Leaf, AlertCircle, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

// Coordonnées de Dakar, Sénégal - Centre ajusté pour mieux afficher les signalements (Dakar + banlieues)
const DAKAR_CENTER: [number, number] = [14.7150, -17.4000];

export default function Map() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>(mockReportsMap); // Charger immédiatement les signalements simulés

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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Carte des Signalements
          </h1>
          <p className="text-muted-foreground">
            Visualisez en temps réel tous les signalements géolocalisés à Dakar, Sénégal
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Carte */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] relative">
              <CardContent className="p-0 h-full relative">
                  <div className="w-full h-full" style={{ minHeight: "600px" }}>
                  <LeafletMapContainer
                      center={DAKAR_CENTER}
                      zoom={11}
                      minZoom={9}
                      maxZoom={18}
                      style={{ height: "100%", width: "100%", minHeight: "600px" }}
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
                          const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons] || AlertCircle;
                          const icon = createCustomIcon(statusColor, report.category);
                          
                          return (
                            <Marker
                              key={report.id}
                              position={[report.latitude, report.longitude]}
                              icon={icon}
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
                                      {report.category}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                    {report.description}
                                  </p>
                                  {report.location_address && (
                                    <div className="flex items-start text-xs text-muted-foreground mb-3 p-2 bg-muted/50 rounded-md">
                                      <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                                      <span className="leading-relaxed">{report.location_address}</span>
                                    </div>
                                  )}
                                  {report.created_at && (
                                    <div className="text-xs text-muted-foreground mb-3">
                                      Signalé le {new Date(report.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    className="w-full mt-1 font-semibold"
                                    onClick={() => navigate(`/reports/${report.id}`)}
                                  >
                                    Voir détails
                                  </Button>
                                </div>
                              </Popup>
                            </Marker>
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

          {/* Légende et statistiques */}
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

