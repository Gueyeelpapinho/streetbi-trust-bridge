import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockReportsSimple, getUserReports, mockReportsMap } from "@/lib/mockData";
import dakarStreet1 from "@/assets/dakar-street-1.jpg";
import dakarStreet2 from "@/assets/dakar-street-2.jpg";
import dakarStreet3 from "@/assets/dakar-street-3.jpg";
// Nouvelles images de problèmes urbains à ajouter dans /src/assets/
// 1. dakar-issue-1.jpg - Image de destruction/débris (dégâts importants, matériaux brûlés)
// 2. dakar-issue-2.jpg - Image de rue avec travaux/inondation (rue perturbée, flaques d'eau, engins de chantier)
// 3. dakar-issue-3.jpg - Image à fournir par l'utilisateur
// 4. dakar-issue-4.jpg - Image à fournir par l'utilisateur
// Note: Utilisez des images placeholder temporaires si les fichiers n'existent pas encore
import dakarIssue1 from "@/assets/dakar-issue-1.jpg";
import dakarIssue2 from "@/assets/dakar-issue-2.jpg";
import dakarIssue3 from "@/assets/dakar-issue-3.jpg";
import dakarIssue4 from "@/assets/dakar-issue-4.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  
  // Carrousel avec toutes les images (3 images de rues + 4 images de problèmes urbains)
  // Les images de problèmes urbains seront ajoutées au carrousel une fois les fichiers disponibles
  const images = [
    dakarStreet1, 
    dakarStreet2, 
    dakarStreet3,
    dakarIssue1, // Destruction/débris
    dakarIssue2, // Rue avec travaux/inondation
    dakarIssue3, // À fournir
    dakarIssue4, // À fournir
  ].filter(Boolean); // Filtrer les valeurs undefined si certaines images n'existent pas encore

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const calculateTotal = () => {
      const userReports = getUserReports();
      const total = userReports.length + mockReportsMap.length + mockReportsSimple.length;
      setTotalReports(total);
    };

    calculateTotal();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      calculateTotal();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userReportsUpdated', handleStorageChange);
    const interval = setInterval(calculateTotal, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userReportsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="relative py-20 md:py-32 bg-gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--primary))_100%)]" />
      </div>
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6">
              <Eye className="h-4 w-4 mr-2" />
              <span>La sentinelle de votre communauté</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Street<span className="text-secondary">Bi</span>
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-lg mx-auto lg:mx-0">
              Bâtissons ensemble un pont de confiance numérique entre les populations et les institutions. 
              Signalement transparent, traçable et sécurisé grâce à la blockchain Hedera.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => navigate("/new-report")}
              >
                <Camera className="h-5 w-5 mr-2" />
                Nouveau signalement
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => navigate("/map")}
              >
                <MapPin className="h-5 w-5 mr-2" />
                Voir la carte
              </Button>
            </div>
          </div>

          {/* Right Content - Image Carousel */}
          <div className="relative">
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={image}
                    alt={index < 3 ? `Dakar Street ${index + 1}` : `Problème urbain ${index - 2}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              ))}
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Floating stats */}
            <div className="absolute -bottom-8 -left-8 bg-white rounded-xl p-4 shadow-xl">
              <div className="text-2xl font-bold text-primary">{totalReports.toLocaleString('fr-FR')}</div>
              <div className="text-sm text-muted-foreground">Signalements</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};