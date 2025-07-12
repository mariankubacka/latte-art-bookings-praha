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
    if (password === ADMIN_PASSWORD) {
      // Set cookie with 24 hour expiration
      setCookie(ADMIN_COOKIE_NAME, "authenticated", 24);
      toast({
        title: "Úspešne prihlásený",
        description: "Presmerovávame vás do admin panelu",
      });
      onOpenChange(false);
      // Redirect to admin page
      navigate("/admin");
    } else {
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
      </DialogContent>
    </Dialog>
  );
};