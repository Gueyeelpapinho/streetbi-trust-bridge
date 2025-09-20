import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Camera, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import streetbiLogo from "@/assets/streetbi-logo.jpg";

export const Footer = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "Nouveau signalement", href: "/new-report" },
    { name: "Tous les signalements", href: "/reports" },
    { name: "Carte interactive", href: "/map" },
  ];

  const legalLinks = [
    { name: "Conditions d'utilisation", href: "/terms" },
    { name: "Politique de confidentialité", href: "/privacy" },
    { name: "Mentions légales", href: "/legal" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img src={streetbiLogo} alt="StreetBi" className="h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold text-primary">StreetBi</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              La sentinelle de votre communauté. Créons ensemble un pont de confiance numérique 
              entre les citoyens et les institutions.
            </p>
            <Button 
              className="w-full"
              onClick={() => navigate("/new-report")}
            >
              <Camera className="h-4 w-4 mr-2" />
              Faire un signalement
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Légal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Dakar, Sénégal</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">contact@streetbi.sn</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">+221 XX XXX XX XX</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center space-x-2 mt-4">
              <Button variant="ghost" size="sm">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 StreetBi. Tous droits réservés. Alimenté par la blockchain Hedera.
          </div>
          <div className="text-sm text-muted-foreground">
            Version 1.0.0 - Construit avec ❤️ au Sénégal
          </div>
        </div>
      </div>
    </footer>
  );
};