import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Calendar, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

interface Registration {
  id: string;
  course_date: string;
  participant_name: string;
  participant_email: string;
  created_at: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const ADMIN_PASSWORD = "admin123"; // Simple password for demo

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

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
    setRegistrations([]);
    toast({
      title: "Odhlásený",
      description: "Boli ste úspešne odhlásený",
    });
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("course_date", { ascending: true });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať registrácie",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupedRegistrations = registrations.reduce((groups, registration) => {
    const date = registration.course_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(registration);
    return groups;
  }, {} as Record<string, Registration[]>);

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
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin - Správa rezervácií</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Odhlásiť sa
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Načítavam registrácie...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedRegistrations).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Žiadne registrácie</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedRegistrations).map(([date, regs]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {format(new Date(date), "EEEE, d. MMMM yyyy", { locale: sk })}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({regs.length} {regs.length === 1 ? "účastník" : "účastníci"})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {regs.map((registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {registration.participant_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {registration.participant_email}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(registration.created_at), "d.M.yyyy HH:mm")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;