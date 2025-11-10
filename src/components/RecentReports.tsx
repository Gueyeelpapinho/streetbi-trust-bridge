import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Clock, Droplets, Zap, Car, GraduationCap, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockReportsSimple, getUserReports, normalizeStatus } from "@/lib/mockData";

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
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    // Charger les signalements récents (utilisateur + mockés)
    const userReports = getUserReports().map((report) => ({
      ...report,
      status: normalizeStatus(report.status),
      location_address: report.location_address || report.location || '',
      location: report.location || report.location_address || '',
      image_url: report.image_url || report.image || '/placeholder.svg',
    }));

    const normalizedMock = mockReportsSimple.map((report) => ({
      ...report,
      status: normalizeStatus(report.status),
      location_address: report.location_address || report.location || '',
      location: report.location || report.location_address || '',
      image_url: report.image_url || report.image || '/placeholder.svg',
    }));

    // Combiner et prendre les 4 plus récents
    const allReports = [...userReports, ...normalizedMock];
    allReports.sort((a: any, b: any) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    setReports(allReports.slice(0, 4));
  }, []);

  // Écouter les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const userReports = getUserReports().map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        location: report.location || report.location_address || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      const normalizedMock = mockReportsSimple.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
        location_address: report.location_address || report.location || '',
        location: report.location || report.location_address || '',
        image_url: report.image_url || report.image || '/placeholder.svg',
      }));

      const allReports = [...userReports, ...normalizedMock];
      allReports.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setReports(allReports.slice(0, 4));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userReportsUpdated', handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userReportsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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
          {reports.map((report) => {
            const CategoryIcon = categoryIcons[report.category as keyof typeof categoryIcons];
            const status = report.status === "pending" || report.status === "signale" ? "pending" 
              : report.status === "in-progress" || report.status === "en_cours" ? "in-progress"
              : "resolved";
            
            return (
              <Card key={report.id} className="hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <Badge className={statusColors[status as keyof typeof statusColors]}>
                        {statusLabels[status as keyof typeof statusLabels]}
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
                    {report.location || report.location_address}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.date || new Date(report.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {report.hedera_hash && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-2">
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="h-3 w-3 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary">Hashblock</p>
                          <p className="text-xs text-muted-foreground truncate font-mono">
                            {report.hedera_hash.substring(0, 15)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
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