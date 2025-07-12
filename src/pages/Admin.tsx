import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminStatistics } from "@/components/AdminStatistics";
import { AdminParticipants } from "@/components/AdminParticipants";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";


const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const location = useLocation();

  const ADMIN_PASSWORD = "admin123"; // Simple password for demo

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Úspešne prihlásený",
        description: "Vitajte v admin rozhraní",
      });
    } else {
      toast({
        title: "Chyba",
        description: "Nesprávne heslo",
        variant: "destructive",
      });
    }
    setPassword("");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast({
      title: "Odhlásený",
      description: "Boli ste úspešne odhlásený",
    });
  };

  const getCurrentView = () => {
    const pathname = location.pathname;
    if (pathname.includes("/statistics")) {
      return <AdminStatistics />;
    } else if (pathname.includes("/participants")) {
      return <AdminParticipants />;
    } else {
      return <AdminStatistics />; // Default view
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Admin prihlásenie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Heslo</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Zadajte admin heslo"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Prihlásiť sa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Odhlásiť sa
            </Button>
          </header>
          <main className="flex-1 p-6">
            {getCurrentView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;