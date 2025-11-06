import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Droplets, Zap, Car, GraduationCap, Heart, Shield, Leaf, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Coordonnées de Dakar
const DAKAR_CENTER: [number, number] = [14.7150, -17.4000];

// Signalements simulés (mêmes que dans Map.tsx)
const mockReports = [
  {
    id: "mock-1",
    title: "Fuite d'eau importante",
    category: "eau",
    status: "signale",
    latitude: 14.6800,
    longitude: -17.4550,
  },
  {
    id: "mock-2",
    title: "Éclairage public défaillant",
    category: "eclairage",
    status: "en_cours",
    latitude: 14.6950,
    longitude: -17.4550,
  },
  {
    id: "mock-3",
    title: "Nid-de-poule dangereux",
    category: "voirie",
    status: "signale",
    latitude: 14.7100,
    longitude: -17.4450,
  },
  {
    id: "mock-4",
    title: "Toiture de l'école endommagée",
    category: "education",
    status: "en_cours",
    latitude: 14.7250,
    longitude: -17.4420,
  },
  {
    id: "mock-5",
    title: "Déchets accumulés",
    category: "environnement",
    status: "signale",
    latitude: 14.6650,
    longitude: -17.4500,
  },
  {
    id: "mock-6",
    title: "Panneau de signalisation manquant",
    category: "securite",
    status: "signale",
    latitude: 14.7000,
    longitude: -17.4470,
  },
  {
    id: "mock-7",
    title: "Canalisation réparée",
    category: "eau",
    status: "resolu",
    latitude: 14.7400,
    longitude: -17.4320,
  },
  {
    id: "mock-8",
    title: "Éclairage rétabli",
    category: "eclairage",
    status: "resolu",
    latitude: 14.7150,
    longitude: -17.4380,
  },
];

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

// Composant pour ajuster les bounds
function MapBounds({ reports }: { reports: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0) {
      const validReports = reports.filter(r => r.latitude && r.longitude);
      if (validReports.length > 0) {
        const bounds = L.latLngBounds(
          validReports.map(r => [r.latitude, r.longitude] as [number, number])
        );
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13,
        });
      }
    }
  }, [map, reports]);
  
  return null;
}

// Créer une icône personnalisée
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

export const InteractiveMap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>(mockReports);

  useEffect(() => {
    // Charger les données de Supabase en arrière-plan
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const dbReportIds = new Set(data.map(r => r.id));
          const filteredMocks = mockReports.filter(m => !dbReportIds.has(m.id));
          setReports([...data, ...filteredMocks]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des signalements:", error);
      }
    };

    fetchReports();
  }, []);

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
            <Card className="h-[500px] relative overflow-hidden">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full">
                  <MapContainer
                    center={DAKAR_CENTER}
                    zoom={12}
                    minZoom={10}
                    maxZoom={18}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapBounds reports={reports} />
                    {reports.map((report) => {
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
                          <Popup maxWidth={250} className="custom-popup">
                            <div className="p-2 min-w-[200px]">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-sm pr-2">{report.title}</h3>
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
                              <div className="flex items-center text-xs text-muted-foreground mb-2">
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                <span className="capitalize">{report.category}</span>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => navigate(`/reports/${report.id}`)}
                              >
                                Voir détails
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
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
    </section>
  );
};
