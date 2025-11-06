import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dakarStreet1 from "@/assets/dakar-street-1.jpg";
import dakarStreet2 from "@/assets/dakar-street-2.jpg";
import dakarStreet3 from "@/assets/dakar-street-3.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const images = [dakarStreet1, dakarStreet2, dakarStreet3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

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
                    alt={`Dakar Street ${index + 1}`}
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
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">Signalements</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};