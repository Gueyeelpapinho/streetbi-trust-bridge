import { useState, useEffect, useRef } from "react";
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
import { Camera, MapPin, Upload, Send, ArrowLeft, Check, X, Loader2, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

// Fix pour les icônes par défaut de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

// Coordonnées de Dakar par défaut
const DAKAR_CENTER: [number, number] = [14.7167, -17.4677];

// Composant pour centrer la carte sur la position
function MapCenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);
  return null;
}

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onClick }: { onClick: (e: any) => void }) {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e: any) => {
      onClick(e);
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onClick]);
  return null;
}

export default function NewReport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    image: null as File | null,
    imagePreview: null as string | null,
  });

  // Géolocalisation automatique au chargement
  useEffect(() => {
    if (step === 3 && !formData.latitude && !formData.longitude) {
      getCurrentLocation();
    }
  }, [step]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
          toast({
            title: "Position détectée",
            description: "Votre position a été détectée automatiquement",
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          setGettingLocation(false);
          // Utiliser Dakar par défaut
          setFormData({
            ...formData,
            latitude: DAKAR_CENTER[0],
            longitude: DAKAR_CENTER[1],
          });
        }
      );
    } else {
      setGettingLocation(false);
      setFormData({
        ...formData,
        latitude: DAKAR_CENTER[0],
        longitude: DAKAR_CENTER[1],
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: "La photo ne doit pas dépasser 10MB",
          variant: "destructive",
        });
        return;
      }
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const handleRemoveImage = () => {
    if (formData.imagePreview) {
      URL.revokeObjectURL(formData.imagePreview);
    }
    setFormData({
      ...formData,
      image: null,
      imagePreview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleMapClick = (e: any) => {
    const latlng = e.latlng;
    setFormData({
      ...formData,
      latitude: latlng.lat,
      longitude: latlng.lng,
    });
    toast({
      title: "Position sélectionnée",
      description: `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulation d'un envoi réussi avec délai pour rendre l'expérience réaliste
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simuler l'upload de la photo
    if (formData.image) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Simuler l'enregistrement sur la blockchain
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Afficher le message de succès
    toast({
      title: "✅ Signalement envoyé avec succès !",
      description: "Votre signalement a été enregistré sur la blockchain Hedera. Merci pour votre contribution !",
    });
    
    // Rediriger vers la page des signalements après un court délai
    setTimeout(() => {
      navigate("/reports");
    }, 2000);
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
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                {formData.imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="max-h-80 mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{formData.image?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(formData.image?.size || 0) / 1024 / 1024 < 1
                          ? `${((formData.image?.size || 0) / 1024).toFixed(2)} KB`
                          : `${((formData.image?.size || 0) / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleRemoveImage}>
                      Changer la photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Ajoutez une photo</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG jusqu'à 10MB</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="image-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <Button asChild>
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir une photo
                        </label>
                      </Button>
                      <input
                        ref={cameraInputRef}
                        type="file"
                        id="camera-upload"
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="camera-upload" className="cursor-pointer">
                          <Camera className="h-4 w-4 mr-2" />
                          Prendre une photo
                        </label>
                      </Button>
                    </div>
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
                <Label htmlFor="title">Titre du signalement *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Fuite d'eau importante sur l'avenue..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">{formData.title.length}/100 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description détaillée *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez précisément le problème, son impact, et toute information utile..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">{formData.description.length}/500 caractères</p>
              </div>

              <div className="space-y-2">
                <Label>Catégorie *</Label>
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
                  disabled={!formData.title.trim() || !formData.description.trim() || !formData.category}
                >
                  Suivant
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        const mapPosition: [number, number] = formData.latitude && formData.longitude
          ? [formData.latitude, formData.longitude]
          : DAKAR_CENTER;

        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Étape 3: Localisation
              </CardTitle>
              <CardDescription>
                Précisez l'emplacement exact du problème sur la carte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Adresse ou description du lieu *</Label>
                <Input
                  id="location"
                  placeholder="Ex: Avenue Bourguiba, en face de la poste centrale"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Position sur la carte</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Localisation...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Utiliser ma position
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="h-[400px] rounded-lg overflow-hidden border border-border">
                  <MapContainer
                    center={mapPosition}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenter position={mapPosition} />
                    <MapClickHandler onClick={handleMapClick} />
                    {formData.latitude && formData.longitude && (
                      <Marker
                        position={[formData.latitude, formData.longitude]}
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            setFormData({
                              ...formData,
                              latitude: position.lat,
                              longitude: position.lng,
                            });
                          },
                        }}
                      />
                    )}
                  </MapContainer>
                </div>
                
                {formData.latitude && formData.longitude && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="font-medium mb-1">Coordonnées GPS :</p>
                    <p className="text-muted-foreground">
                      Latitude: {formData.latitude.toFixed(6)}, Longitude: {formData.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Cliquez sur la carte ou déplacez le marqueur pour ajuster la position
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!formData.location.trim() || !formData.latitude || !formData.longitude}
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
                  {formData.imagePreview && (
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="h-40 w-full object-cover rounded-lg border border-border"
                    />
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Titre</h4>
                  <p className="text-muted-foreground">{formData.title}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{formData.description}</p>
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
                  <p className="text-muted-foreground mb-2">{formData.location}</p>
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-muted-foreground">
                      GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </p>
                  )}
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
                <Button variant="outline" onClick={() => setStep(3)} disabled={loading}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le signalement
                    </>
                  )}
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
        <div className="max-w-3xl mx-auto">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    num < step
                      ? "bg-primary text-primary-foreground"
                      : num === step
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {num < step ? <Check className="h-5 w-5" /> : num}
                </div>
                {num < 4 && (
                  <div
                    className={`w-12 h-1 transition-colors ${
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
