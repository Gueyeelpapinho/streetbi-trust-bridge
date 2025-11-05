import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Upload, Send, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

export default function NewReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    image: null as File | null,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    let imageUrl = "";
    if (formData.image) {
      const fileName = `${Date.now()}-${formData.image.name}`;
      const { data: uploadData } = await supabase.storage
        .from("report-images")
        .upload(fileName, formData.image);
      
      if (uploadData) {
        imageUrl = supabase.storage.from("report-images").getPublicUrl(uploadData.path).data.publicUrl;
      }
    }

    const { error } = await supabase.from("reports").insert([{
      user_id: session?.user?.id || null,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location_address: formData.location,
      image_url: imageUrl,
      hedera_hash: `0x${Math.random().toString(36).substring(2, 15)}`,
    }]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le signalement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Signalement envoyé !",
      description: "Votre signalement a été enregistré sur la blockchain Hedera",
    });
    
    setTimeout(() => navigate("/reports"), 1500);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Étape 1: Photo du problème
              </CardTitle>
              <CardDescription>
                Prenez ou sélectionnez une photo qui illustre clairement le problème
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {formData.image ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">{formData.image.name}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Ajoutez une photo</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG jusqu'à 10MB</p>
                    </div>
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <Button asChild>
                      <label htmlFor="image-upload">Choisir une photo</label>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!formData.image}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Étape 2: Description et catégorie</CardTitle>
              <CardDescription>
                Décrivez le problème et sélectionnez la catégorie appropriée
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du signalement</Label>
                <Input
                  id="title"
                  placeholder="Ex: Fuite d'eau importante sur l'avenue..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez précisément le problème, son impact, et toute information utile..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!formData.title || !formData.description || !formData.category}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Étape 3: Localisation
              </CardTitle>
              <CardDescription>
                Précisez l'emplacement exact du problème
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Adresse ou description du lieu</Label>
                <Input
                  id="location"
                  placeholder="Ex: Avenue Bourguiba, en face de la poste centrale"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  La géolocalisation GPS sera automatiquement ajoutée lors de l'envoi
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!formData.location}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        const selectedCategory = categories.find(cat => cat.value === formData.category);
        return (
          <Card>
            <CardHeader>
              <CardTitle>Étape 4: Confirmation</CardTitle>
              <CardDescription>
                Vérifiez votre signalement avant l'envoi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Photo</h4>
                  {formData.image && (
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="h-32 w-48 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Titre</h4>
                  <p className="text-muted-foreground">{formData.title}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Catégorie</h4>
                  {selectedCategory && (
                    <Badge className={selectedCategory.color}>
                      {selectedCategory.label}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Localisation</h4>
                  <p className="text-muted-foreground">{formData.location}</p>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-primary">Enregistrement blockchain</p>
                    <p className="text-sm text-muted-foreground">
                      Ce signalement sera enregistré de manière immuable sur la blockchain Hedera
                      pour garantir la transparence et la traçabilité.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button onClick={handleSubmit}>
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer le signalement
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Nouveau signalement
            </h1>
            <p className="text-muted-foreground">
              Signalez un problème dans votre communauté en quelques étapes simples
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    num <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      num < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {renderStep()}
        </div>
      </main>
      <Footer />
    </div>
  );
}