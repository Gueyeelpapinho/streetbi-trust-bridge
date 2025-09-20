import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock, Droplets, Zap, Car, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockReports = [
  {
    id: 1,
    title: "Fuite d'eau importante",
    description: "Canalisation cassée sur l'avenue Bourguiba",
    location: "Plateau, Dakar",
    status: "pending",
    date: "Il y a 2h",
    category: "eau",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Éclairage public défaillant",
    description: "Plusieurs lampadaires ne fonctionnent plus",
    location: "Médina, Dakar",
    status: "in-progress",
    date: "Il y a 5h",
    category: "eclairage",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "Nid de poule dangereux",
    description: "Route dégradée causant des accidents",
    location: "Pikine, Dakar",
    status: "pending",
    date: "Il y a 1j",
    category: "voirie",
    image: "/placeholder.svg"
  },
  {
    id: 4,
    title: "École sans électricité",
    description: "Panne électrique dans l'établissement depuis 3 jours",
    location: "Guédiawaye, Dakar",
    status: "resolved",
    date: "Il y a 2j",
    category: "education",
    image: "/placeholder.svg"
  }
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

export const RecentReports = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Signalements Récents
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les derniers problèmes signalés par la communauté et suivez leur résolution en temps réel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mockReports.map((report) => {
            const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons];
            
            return (
              <Card key={report.id} className="hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        {statusLabels[report.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {report.location}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.date}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center text-primary hover:text-primary-foreground hover:bg-primary"
                    onClick={() => navigate(`/report/${report.id}`)}
                  >
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/reports")}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Voir tous les signalements
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};