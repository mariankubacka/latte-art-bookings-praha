import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Users, AlertTriangle } from "lucide-react";

interface CalendarBookingProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
}

// Czech holidays for 2024-2025
const czechHolidays = [
  "2024-01-01", // Nový rok
  "2024-03-29", // Veľký piatok
  "2024-04-01", // Veľkonočný pondelok
  "2024-05-01", // Sviatok práce
  "2024-05-08", // Deň víťazstva
  "2024-07-05", // Sv. Cyril a Metod
  "2024-07-06", // Upálenie Jana Husa
  "2024-09-28", // Deň českej štátnosti
  "2024-10-28", // Vznik Československej republiky
  "2024-11-17", // Deň boja za slobodu a demokraciu
  "2024-12-24", // Štedrý deň
  "2024-12-25", // Vianoce
  "2024-12-26", // Druhý sviatok vianočný
  "2025-01-01", // Nový rok
  "2025-04-18", // Veľký piatok
  "2025-04-21", // Veľkonočný pondelok
  "2025-05-01", // Sviatok práce
  "2025-05-08", // Deň víťazstva
  "2025-07-05", // Sv. Cyril a Metod
  "2025-07-06", // Upálenie Jana Husa
  "2025-09-28", // Deň českej štátnosti
  "2025-10-28", // Vznik Československej republiky
  "2025-11-17", // Deň boja za slobodu a demokraciu
  "2025-12-24", // Štedrý deň
  "2025-12-25", // Vianoce
  "2025-12-26", // Druhý sviatok vianočný
];

export function CalendarBooking({ selectedDate, onDateSelect }: CalendarBookingProps) {
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrationCounts();
  }, []);

  const fetchRegistrationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('course_date');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((registration) => {
        const dateStr = registration.course_date;
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });

      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať údaje o kapacite kurzov.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day >= 3 && day <= 5; // Wednesday (3) to Friday (5)
  };

  const isHoliday = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return czechHolidays.includes(dateStr);
  };

  const isFull = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (registrationCounts[dateStr] || 0) >= 5;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
    
    return (
      date < today || 
      date > twoMonthsFromNow || 
      !isWeekday(date) || 
      isHoliday(date) || 
      isFull(date)
    );
  };

  const getDateBadge = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const count = registrationCounts[dateStr] || 0;
    
    if (isHoliday(date)) {
      return <Badge variant="destructive" className="text-xs">Sviatok</Badge>;
    }
    
    if (count >= 5) {
      return <Badge variant="destructive" className="text-xs">Obsadené</Badge>;
    }
    
    if (count > 0) {
      return <Badge variant="secondary" className="text-xs">{count}/5</Badge>;
    }
    
    return null;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onDateSelect(null);
      return;
    }

    if (isHoliday(date)) {
      toast({
        title: "Štátny sviatok",
        description: "Tento deň je štátny sviatok. Kurzy sa vtedy nekonajú.",
        variant: "destructive",
      });
      return;
    }

    if (isFull(date)) {
      toast({
        title: "Kurz je obsadený",
        description: "Na tento deň je už obsadených 5 miest. Vyberte si iný termín.",
        variant: "destructive",
      });
      return;
    }

    onDateSelect(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Vyberte termín kurzu
        </CardTitle>
        <CardDescription>
          Kurzy sa konajú v stredu, štvrtok a piatok od 9:00 do 17:00
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p>Načítava sa kalendár...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="pointer-events-auto"
            />
            
            {selectedDate && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Vybraný termín
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDate.toLocaleDateString('sk-SK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Čas: 9:00 - 17:00
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">
                    Obsadenosť: {registrationCounts[selectedDate.toISOString().split('T')[0]] || 0}/5
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Dostupné dni (St-Pi)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive/20 rounded"></div>
                <span>Sviatky / obsadené</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                <span>Max. 2 mesiace dopredu</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}