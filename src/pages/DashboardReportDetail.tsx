import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  signale: { label: "Signalé", color: "bg-red-500" },
  en_cours: { label: "En cours", color: "bg-yellow-500" },
  resolu: { label: "Résolu", color: "bg-green-500" },
};

export default function DashboardReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    status: "signale" | "en_cours" | "resolu";
    assigned_agent: string;
    resolution_note: string;
    resolved_by: string;
    resolution_cost: string;
    public_comment: string;
  }>({
    status: "signale",
    assigned_agent: "",
    resolution_note: "",
    resolved_by: "",
    resolution_cost: "",
    public_comment: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile || (profile.role !== "autorite" && profile.role !== "admin")) {
      navigate("/");
      return;
    }

    fetchReport();
  };

  const fetchReport = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setReport(data);
      setFormData({
        status: data.status as "signale" | "en_cours" | "resolu",
        assigned_agent: data.assigned_agent || "",
        resolution_note: data.resolution_note || "",
        resolved_by: data.resolved_by || "",
        resolution_cost: data.resolution_cost ? String(data.resolution_cost) : "",
        public_comment: "",
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // Update report
    const { error: updateError } = await supabase
      .from("reports")
      .update({
        status: formData.status,
        assigned_agent: formData.assigned_agent,
        resolution_note: formData.resolution_note,
        resolved_by: formData.resolved_by,
        resolution_cost: formData.resolution_cost ? parseFloat(formData.resolution_cost) : null,
      })
      .eq("id", id);

    if (updateError) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le signalement",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    // Add update to timeline if there's a public comment
    if (formData.public_comment && id) {
      const { data: { session } } = await supabase.auth.getSession();

      await supabase.from("report_updates").insert([{
        report_id: id,
        user_id: session?.user.id || null,
        status: formData.status,
        comment: formData.public_comment,
        is_public: true,
      }]);
    }

    toast({
      title: "Succès",
      description: "Le signalement a été mis à jour",
    });

    setSaving(false);
    navigate("/dashboard/reports");
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

  const status = statusConfig[report.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <Button variant="ghost" onClick={() => navigate("/dashboard/reports")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
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

                <div>
                  <h4 className="font-medium mb-2">Localisation</h4>
                  <p className="text-muted-foreground">{report.location_address}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Date de création</h4>
                  <p className="text-muted-foreground">
                    {format(new Date(report.created_at), "dd MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du signalement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as "signale" | "en_cours" | "resolu" })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="signale">Signalé</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="resolu">Résolu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent">Agent assigné</Label>
                  <Input
                    id="agent"
                    value={formData.assigned_agent}
                    onChange={(e) => setFormData({ ...formData, assigned_agent: e.target.value })}
                    placeholder="Nom de l'agent ou du service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolved-by">Résolu par (société/service)</Label>
                  <Input
                    id="resolved-by"
                    value={formData.resolved_by}
                    onChange={(e) => setFormData({ ...formData, resolved_by: e.target.value })}
                    placeholder="Nom de la société ou du service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Coût de l'opération (FCFA)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.resolution_cost}
                    onChange={(e) => setFormData({ ...formData, resolution_cost: e.target.value })}
                    placeholder="Montant en FCFA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resolution-note">Note de résolution</Label>
                  <Textarea
                    id="resolution-note"
                    value={formData.resolution_note}
                    onChange={(e) => setFormData({ ...formData, resolution_note: e.target.value })}
                    placeholder="Détails sur la résolution du problème"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public-comment">Commentaire public</Label>
                  <Textarea
                    id="public-comment"
                    value={formData.public_comment}
                    onChange={(e) => setFormData({ ...formData, public_comment: e.target.value })}
                    placeholder="Ce commentaire sera visible par le citoyen"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? "Enregistrement..." : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}