import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, User, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import streetbiLogo from "@/assets/streetbi-logo.jpg";

export const Header = () => {
  const [language, setLanguage] = useState("fr");
  const navigate = useNavigate();

  const languages = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "wo", label: "Wolof" },
    { value: "pu", label: "Pulaar" },
    { value: "sr", label: "Sérère" },
  ];

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Carte", href: "/map" },
    { name: "Signalements", href: "/reports" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={streetbiLogo} alt="StreetBi" className="h-10 w-10 rounded-lg" />
          <span className="text-2xl font-bold text-primary">StreetBi</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className="text-foreground/80 hover:text-foreground transition-colors text-sm font-medium"
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Right side: Language selector and auth buttons */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[120px] h-9">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
            <Button size="sm" onClick={() => navigate("/register")}>
              <User className="h-4 w-4 mr-2" />
              Inscription
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    className="text-left px-2 py-2 text-foreground hover:text-primary transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/login")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Connexion
                  </Button>
                  <Button className="w-full justify-start" onClick={() => navigate("/register")}>
                    <User className="h-4 w-4 mr-2" />
                    Inscription
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};