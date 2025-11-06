import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Zap, Car, GraduationCap, Heart, Shield, Leaf, AlertCircle, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

// Signalements simulés réalistes pour Dakar - Coordonnées ajustées pour éviter l'océan (longitude entre -17.43 et -17.46)
const mockReports = [
  {
    id: "mock-1",
    title: "Fuite d'eau importante",
    description: "Fuite d'eau majeure sur la canalisation principale. L'eau s'écoule dans la rue depuis 3 jours, causant des inondations.",
    category: "eau",
    status: "signale",
    location_address: "Avenue Cheikh Anta Diop, Plateau, Dakar",
    latitude: 14.6800,
    longitude: -17.4550,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-2",
    title: "Éclairage public défaillant",
    description: "Plusieurs lampadaires ne fonctionnent pas dans cette zone, rendant la circulation dangereuse la nuit.",
    category: "eclairage",
    status: "en_cours",
    location_address: "Rue de la République, Médina, Dakar",
    latitude: 14.6950,
    longitude: -17.4500,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-3",
    title: "Nid-de-poule dangereux",
    description: "Grand nid-de-poule sur la route principale, plusieurs véhicules ont été endommagés. Risque d'accident élevé.",
    category: "voirie",
    status: "signale",
    location_address: "Boulevard Général de Gaulle, Fann, Dakar",
    latitude: 14.7100,
    longitude: -17.4450,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-4",
    title: "Toiture de l'école endommagée",
    description: "Toiture de l'école primaire endommagée par les intempéries. Réparation en cours par les autorités.",
    category: "education",
    status: "en_cours",
    location_address: "École primaire de Grand Yoff, Dakar",
    latitude: 14.7250,
    longitude: -17.4420,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-5",
    title: "Déchets accumulés",
    description: "Accumulation importante de déchets non collectés depuis plusieurs semaines. Odeurs nauséabondes et risques sanitaires.",
    category: "environnement",
    status: "signale",
    location_address: "Quartier Parcelles Assainies, Dakar",
    latitude: 14.6650,
    longitude: -17.4500,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-6",
    title: "Panneau de signalisation manquant",
    description: "Panneau de stop manquant à l'intersection, plusieurs accidents évités de justesse. Intervention urgente nécessaire.",
    category: "securite",
    status: "signale",
    location_address: "Carrefour Liberté 6, Dakar",
    latitude: 14.7000,
    longitude: -17.4470,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-7",
    title: "Canalisation réparée",
    description: "Fuite d'eau réparée avec succès. La zone est maintenant sécurisée et l'eau est rétablie normalement.",
    category: "eau",
    status: "resolu",
    location_address: "Avenue Blaise Diagne, Almadies, Dakar",
    latitude: 14.7400,
    longitude: -17.4320,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-8",
    title: "Éclairage rétabli",
    description: "Tous les lampadaires ont été réparés. La zone est maintenant bien éclairée et sécurisée pour les piétons.",
    category: "eclairage",
    status: "resolu",
    location_address: "Rue Mermoz, Point E, Dakar",
    latitude: 14.7150,
    longitude: -17.4380,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-9",
    title: "Route réparée",
    description: "Nid-de-poule comblé et route refaite. La circulation est maintenant fluide et sécurisée.",
    category: "voirie",
    status: "resolu",
    location_address: "Boulevard du Général de Gaulle, Ouakam, Dakar",
    latitude: 14.7300,
    longitude: -17.4350,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-10",
    title: "Centre de santé - Manque de matériel",
    description: "Le centre de santé manque de matériel médical de base. Besoin urgent de fournitures pour soigner les patients.",
    category: "sante",
    status: "en_cours",
    location_address: "Centre de santé de Pikine, Dakar",
    latitude: 14.6750,
    longitude: -17.4520,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-11",
    title: "Éclairage défaillant - Zone commerciale",
    description: "Plusieurs lampadaires éteints dans la zone commerciale, impactant la sécurité des commerces et des clients.",
    category: "eclairage",
    status: "signale",
    location_address: "Marché Sandaga, Centre-ville, Dakar",
    latitude: 14.6900,
    longitude: -17.4430,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-12",
    title: "Arbre menaçant",
    description: "Grand arbre penché menaçant de tomber sur la route. Risque pour les passants et les véhicules.",
    category: "environnement",
    status: "en_cours",
    location_address: "Avenue Faidherbe, Plateau, Dakar",
    latitude: 14.7050,
    longitude: -17.4480,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-13",
    title: "Route dégradée - Diamniadio",
    description: "Route principale en mauvais état avec plusieurs nids-de-poule. Circulation difficile et dangereuse.",
    category: "voirie",
    status: "signale",
    location_address: "Avenue de l'Indépendance, Diamniadio",
    latitude: 14.7500,
    longitude: -17.4000,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-14",
    title: "Éclairage public manquant",
    description: "Absence totale d'éclairage public dans cette zone résidentielle. Sécurité des habitants compromise.",
    category: "eclairage",
    status: "en_cours",
    location_address: "Zone résidentielle, Diamniadio",
    latitude: 14.7600,
    longitude: -17.3950,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-15",
    title: "Problème d'assainissement",
    description: "Système d'assainissement défaillant causant des inondations lors des pluies. Risque sanitaire élevé.",
    category: "eau",
    status: "signale",
    location_address: "Quartier Pikine Est, Pikine",
    latitude: 14.7500,
    longitude: -17.3800,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-16",
    title: "École sans électricité",
    description: "École primaire sans électricité depuis une semaine. Impact sur l'éducation des enfants.",
    category: "education",
    status: "en_cours",
    location_address: "École primaire de Thiaroye, Thiaroye",
    latitude: 14.7200,
    longitude: -17.3600,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-17",
    title: "Décharge sauvage",
    description: "Décharge sauvage non autorisée causant des problèmes environnementaux et sanitaires.",
    category: "environnement",
    status: "signale",
    location_address: "Zone industrielle, Rufisque",
    latitude: 14.7100,
    longitude: -17.2700,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-18",
    title: "Route réparée - Diamniadio",
    description: "Route principale récemment réparée. Circulation fluide et sécurisée.",
    category: "voirie",
    status: "resolu",
    location_address: "Boulevard de Diamniadio, Diamniadio",
    latitude: 14.7550,
    longitude: -17.4050,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const InteractiveMap = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>(mockReports);

  useEffect(() => {
    // Charger les données en arrière-plan
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Charger les données de Supabase en arrière-plan (non-bloquant)
    // Ne pas attendre Supabase pour afficher la carte
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // Combiner les données de Supabase avec les signalements simulés
        const dbReportIds = new Set(data.map((r: any) => r.id));
        const filteredMocks = mockReports.filter(m => !dbReportIds.has(m.id));
        const allReports = [...data, ...filteredMocks];
        setReports(allReports);
      }
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
