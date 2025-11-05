import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Globe, User, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import streetbiLogo from "@/assets/streetbi-logo.jpg";

export const Header = () => {
  const [language, setLanguage] = useState("fr");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const languages = [
    { value: "fr", label: "Français" },
    { value: "en", label: "English" },
    { value: "wo", label: "Wolof" },
    { value: "pu", label: "Pulaar" },
    { value: "sr", label: "Sérère" },
  ];

  const navigation = [
    { name: "Accueil", href: "/" },
    { name: "Signalements", href: "/reports" },
  ];

  const isAuthority = profile?.role === "autorite" || profile?.role === "admin";

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
            {user ? (
              <>
                {isAuthority && (
                  <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Mon Profil
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  <User className="h-4 w-4 mr-2" />
                  Inscription
                </Button>
              </>
            )}
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
                  {user ? (
                    <>
                      {isAuthority && (
                        <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/dashboard")}>
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      )}
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                        <User className="h-4 w-4 mr-2" />
                        Mon Profil
                      </Button>
                      <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/auth")}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Connexion
                      </Button>
                      <Button className="w-full justify-start" onClick={() => navigate("/auth")}>
                        <User className="h-4 w-4 mr-2" />
                        Inscription
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};