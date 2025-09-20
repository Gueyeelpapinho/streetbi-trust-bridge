import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Droplets, Zap, Car, GraduationCap, Filter } from "lucide-react";

// Mock data for map markers
const mockMarkers = [
  { id: 1, lat: 14.6928, lng: -17.4467, category: "eau", status: "pending", title: "Fuite d'eau" },
  { id: 2, lat: 14.6937, lng: -17.4441, category: "eclairage", status: "in-progress", title: "Éclairage défaillant" },
  { id: 3, lat: 14.6917, lng: -17.4486, category: "voirie", status: "pending", title: "Route dégradée" },
  { id: 4, lat: 14.6945, lng: -17.4423, category: "education", status: "resolved", title: "École réparée" },
  { id: 5, lat: 14.6901, lng: -17.4501, category: "eau", status: "resolved", title: "Canalisation réparé" },
];

const categoryIcons = {
  eau: Droplets,
  eclairage: Zap,
  voirie: Car,
  education: GraduationCap
};

const statusColors = {
  pending: "bg-status-pending",
  "in-progress": "bg-status-in-progress",
  resolved: "bg-status-resolved"
};

export const InteractiveMap = () => {
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
                {/* Simulated Map Background */}
                <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 relative">
                  {/* Map grid pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>
                  
                  {/* Simulated Markers */}
                  {mockMarkers.map((marker) => {
                    const CategoryIcon = categoryIcons[marker.category as keyof typeof categoryIcons];
                    const statusColor = statusColors[marker.status as keyof typeof statusColors];
                    
                    return (
                      <div
                        key={marker.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                        style={{
                          left: `${20 + (marker.id * 15)}%`,
                          top: `${30 + (marker.id * 10)}%`
                        }}
                      >
                        <div className={`w-8 h-8 rounded-full ${statusColor} flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-popover text-popover-foreground px-3 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap">
                            {marker.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 space-y-2">
                    <Button size="sm" variant="secondary" className="shadow-lg">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Map Attribution */}
                  <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                    © StreetBi - Dakar, Sénégal
                  </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-status-pending"></div>
                    <span className="text-sm">Nouveau</span>
                  </div>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-status-in-progress"></div>
                    <span className="text-sm">En cours</span>
                  </div>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-status-resolved"></div>
                    <span className="text-sm">Résolu</span>
                  </div>
                  <Badge variant="secondary">156</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catégories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(categoryIcons).map(([category, Icon]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm capitalize">{category}</span>
                    </div>
                    <Badge variant="secondary">
                      {category === "eau" ? "5" : category === "eclairage" ? "3" : category === "voirie" ? "8" : "4"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button className="w-full" size="lg">
              <MapPin className="h-4 w-4 mr-2" />
              Voir carte complète
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};