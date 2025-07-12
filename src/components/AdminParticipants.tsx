import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

interface Registration {
  id: string;
  course_date: string;
  participant_name: string;
  participant_email: string;
  created_at: string;
}

export const AdminParticipants = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("course_date", { ascending: true })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      
      if (error) throw error;
      
      setRegistrations(data || []);
    } catch (error: any) {
      const errorMessage = error?.name === 'AbortError' 
        ? "Načítanie trvá príliš dlho. Skúste obnoviť stránku."
        : error?.message || "Nepodarilo sa načítať registrácie";
        
      toast({
        title: "Chyba",
        description: errorMessage,
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Načítavam účastníkov...</p>
      </div>
    );
  }

  return (
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
  );
};