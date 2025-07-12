import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminStatistics } from "@/components/AdminStatistics";
import { AdminParticipants } from "@/components/AdminParticipants";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";

interface AdminPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminPopup = ({ isOpen, onOpenChange }: AdminPopupProps) => {
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsAuthenticated(false);
      setPassword("");
    }
    onOpenChange(open);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        {!isAuthenticated ? (
          <>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl text-center">Admin prihlásenie</DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
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
            </div>
          </>
        ) : (
          <SidebarProvider>
            <div className="min-h-[80vh] flex w-full">
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
                <main className="flex-1 p-6 overflow-y-auto">
                  {getCurrentView()}
                </main>
              </div>
            </div>
          </SidebarProvider>
        )}
      </DialogContent>
    </Dialog>
  );
};