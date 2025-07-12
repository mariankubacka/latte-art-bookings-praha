import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { setCookie } from "@/lib/cookies";

interface AdminLoginPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminLoginPopup = ({ isOpen, onOpenChange }: AdminLoginPopupProps) => {
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const ADMIN_PASSWORD = "admin123"; // Simple password for demo
  const ADMIN_COOKIE_NAME = "admin_auth";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 Login attempt with password:", password);
    console.log("🔐 Expected password:", ADMIN_PASSWORD);
    console.log("🔐 Password match:", password === ADMIN_PASSWORD);
    
    if (password === ADMIN_PASSWORD) {
      console.log("✅ Password correct, setting cookie");
      
      try {
        // Set cookie with 24 hour expiration
        setCookie(ADMIN_COOKIE_NAME, "authenticated", 24);
        console.log("✅ Cookie set successfully");
        
        // Verify cookie was set
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(ADMIN_COOKIE_NAME + '='));
        console.log("🍪 Cookie verification:", cookieValue);
        
        toast({
          title: "Úspešne prihlásený",
          description: "Presmerovávame vás do admin panelu",
        });
        
        console.log("🔄 Closing dialog and navigating");
        onOpenChange(false);
        
        // Add small delay before navigation
        setTimeout(() => {
          console.log("🔄 Navigating to /admin");
          navigate("/admin");
        }, 100);
        
      } catch (error) {
        console.error("❌ Error during login process:", error);
        toast({
          title: "Chyba",
          description: "Nastala chyba pri prihlasovaní",
          variant: "destructive",
        });
      }
    } else {
      console.log("❌ Incorrect password");
      toast({
        title: "Chyba",
        description: "Nesprávne heslo",
        variant: "destructive",
      });
    }
    setPassword("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPassword("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl text-center">Admin prihlásenie</DialogTitle>
        </DialogHeader>
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
        <div className="text-center text-sm text-muted-foreground mt-4">
          Heslo: admin123
        </div>
      </DialogContent>
    </Dialog>
  );
};