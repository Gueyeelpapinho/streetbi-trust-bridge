import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const categories = [
  { value: "eau", label: "Eau et assainissement", color: "bg-blue-500" },
  { value: "voirie", label: "Voirie et transport", color: "bg-gray-500" },
  { value: "eclairage", label: "Éclairage public", color: "bg-yellow-500" },
  { value: "sante", label: "Santé publique", color: "bg-red-500" },
  { value: "education", label: "Éducation", color: "bg-green-500" },
  { value: "environnement", label: "Environnement", color: "bg-emerald-500" },
  { value: "securite", label: "Sécurité", color: "bg-orange-500" },
  { value: "autre", label: "Autre", color: "bg-purple-500" },
];

const statusConfig = {
  signale: { label: "Signalé", color: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-yellow-500" },
  resolu: { label: "Résolu", color: "bg-green-500" },
};

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [id]);

  const fetchReportData = async () => {
    if (!id) return;

    setLoading(true);

    // Fetch report
    const { data: reportData, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (!reportError && reportData) {
      setReport(reportData);
    }

    // Fetch updates
    const { data: updatesData, error: updatesError } = await supabase
      .from("report_updates")
      .select("*")
      .eq("report_id", id)
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (!updatesError && updatesData) {
      setUpdates(updatesData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p className="text-center text-muted-foreground">Signalement non trouvé</p>
        </main>
        <Footer />
      </div>
    );
  }

  const category = categories.find((c) => c.value === report.category);
  const status = statusConfig[report.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/reports")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux signalements
        </Button>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{report.title}</CardTitle>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt={report.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{report.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(report.created_at), "dd MMMM yyyy", { locale: fr })}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{report.location_address}</span>
                </div>

                {category && (
                  <div>
                    <span className="text-sm font-medium">Catégorie: </span>
                    <Badge className={category.color}>{category.label}</Badge>
                  </div>
                )}

                {report.hedera_hash && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <LinkIcon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-primary">Preuve Blockchain</p>
                        <p className="text-sm text-muted-foreground break-all">
                          Hash: {report.hedera_hash}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {report.status === "resolu" && (report.resolved_by || report.resolution_note) && (
              <Card>
                <CardHeader>
                  <CardTitle>Résolution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report.resolved_by && (
                    <p className="text-sm">
                      <span className="font-medium">Résolu par: </span>
                      {report.resolved_by}
                    </p>
                  )}
                  {report.resolution_cost && (
                    <p className="text-sm">
                      <span className="font-medium">Coût: </span>
                      {report.resolution_cost} FCFA
                    </p>
                  )}
                  {report.resolution_note && (
                    <div>
                      <p className="font-medium text-sm mb-1">Note:</p>
                      <p className="text-sm text-muted-foreground">{report.resolution_note}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline du statut</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current status */}
                  <div className="flex items-start space-x-4">
                    <div className={`w-3 h-3 rounded-full ${status.color} mt-1.5`}></div>
                    <div className="flex-1">
                      <p className="font-medium">{status.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(report.updated_at), "dd MMM yyyy, HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Timeline line */}
                  {updates.length > 0 && (
                    <div className="border-l-2 border-muted ml-1.5 pl-6 space-y-4">
                      {updates.map((update) => {
                        const updateStatus = statusConfig[update.status as keyof typeof statusConfig];
                        return (
                          <div key={update.id}>
                            <div className="flex items-start space-x-4">
                              <div className={`w-3 h-3 rounded-full ${updateStatus.color} -ml-7 mt-1.5`}></div>
                              <div className="flex-1 -ml-3">
                                <p className="font-medium">{updateStatus.label}</p>
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
                  )}
                </div>
              </CardContent>
            </Card>

            {report.latitude && report.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Latitude: {report.latitude}<br />
                      Longitude: {report.longitude}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}