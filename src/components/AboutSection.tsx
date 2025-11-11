import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Zap, Globe } from "lucide-react";
import { mockReportsSimple, getUserReports, mockReportsMap, normalizeStatus } from "@/lib/mockData";

const features = [
  {
    icon: Shield,
    title: "Transparence & Sécurité",
    description: "Chaque signalement est enregistré de manière immuable sur la blockchain Hedera, garantissant la transparence totale.",
  },
  {
    icon: Users,
    title: "Communauté Active",
    description: "Rejoignez une communauté engagée de citoyens qui travaillent ensemble pour améliorer leur environnement.",
  },
  {
    icon: Zap,
    title: "Réaction Rapide",
    description: "Les institutions partenaires sont notifiées instantanément et peuvent agir rapidement sur les problèmes signalés.",
  },
  {
    icon: Globe,
    title: "Impact Durable",
    description: "Contribuez à construire un Sénégal plus moderne et connecté grâce au pouvoir de la technologie blockchain.",
  },
];

export const AboutSection = () => {
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    resolutionRate: 0,
  });

  useEffect(() => {
    const calculateStats = () => {
      // Récupérer tous les signalements
      const userReports = getUserReports();
      const allReports = [...userReports, ...mockReportsMap, ...mockReportsSimple];
      
      // Normaliser les statuts
      const normalizedReports = allReports.map((report) => ({
        ...report,
        status: normalizeStatus(report.status),
      }));

      const total = normalizedReports.length;
      const resolved = normalizedReports.filter(
        (r) => r.status === "resolu" || r.status === "resolved"
      ).length;
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

      setStats({ total, resolved, resolutionRate });
    };

    calculateStats();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      calculateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userReportsUpdated', handleStorageChange);
    const interval = setInterval(calculateStats, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userReportsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pourquoi StreetBi ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            StreetBi révolutionne la façon dont les citoyens interagissent avec leurs institutions. 
            Grâce à la technologie blockchain Hedera, nous créons un écosystème de confiance numérique 
            qui garantit la transparence, la traçabilité et l'immuabilité de chaque signalement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-hero rounded-2xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ensemble, construisons un Sénégal plus connecté
          </h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-6">
            Chaque signalement compte. Chaque voix est entendue. Chaque action est traçable. 
            Rejoignez le mouvement pour une gouvernance plus transparente et participative.
          </p>
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.total.toLocaleString('fr-FR')}+</div>
              <div className="text-sm opacity-80">Signalements traités</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.resolutionRate}%</div>
              <div className="text-sm opacity-80">Taux de résolution</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">15</div>
              <div className="text-sm opacity-80">Institutions partenaires</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};