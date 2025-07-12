import { useState, useEffect } from "react";
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
import { setCookie, getCookie, deleteCookie } from "@/lib/cookies";


const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  const ADMIN_COOKIE_NAME = "admin_auth";

  // Check for existing authentication on component mount
  useEffect(() => {
    console.log("🔍 Admin page: Checking authentication");
    const authCookie = getCookie(ADMIN_COOKIE_NAME);
    console.log("🍪 Auth cookie value:", authCookie);
    
    if (authCookie === "authenticated") {
      console.log("✅ User is authenticated, allowing access");
      setIsAuthenticated(true);
    } else {
      console.log("❌ User not authenticated, redirecting to home");
      // If not authenticated, redirect to home page
      window.location.href = "/";
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Delete the authentication cookie
    deleteCookie(ADMIN_COOKIE_NAME);
    toast({
      title: "Odhlásený", 
      description: "Boli ste úspešne odhlásený",
    });
    // Redirect to home page
    window.location.href = "/";
  };

  const getCurrentView = () => {
    const pathname = location.pathname;
    if (pathname === "/admin/participants") {
      return <AdminParticipants />;
    } else {
      return <AdminStatistics />; // Default view for /admin
    }
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Kontrolujem prihlásenie...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b border-primary/20 bg-card px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-primary/30 hover:bg-primary/5">
              <LogOut className="w-4 h-4 mr-2" />
              Odhlásiť sa
            </Button>
          </header>
          <main className="flex-1 p-6 bg-muted/20">
            {getCurrentView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;