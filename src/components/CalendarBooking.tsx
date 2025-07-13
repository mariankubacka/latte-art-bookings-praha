import { useState, useEffect, useMemo, useCallback } from "react";
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

// Cache pre registrácie
let registrationCache: { data: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minút

export function CalendarBooking({ selectedDate, onDateSelect }: CalendarBookingProps) {
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Jednoduché dátumové rozsahy - kalendár zobrazuje rok do budúcnosti
  const dateRange = useMemo(() => {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    
    return {
      start: today.toISOString().split('T')[0],
      end: oneYearFromNow.toISOString().split('T')[0]
    };
  }, []);

  const fetchRegistrationCounts = useCallback(async () => {
    // Skontrolujeme cache
    const now = Date.now();
    if (registrationCache && (now - registrationCache.timestamp) < CACHE_DURATION) {
      setRegistrationCounts(registrationCache.data);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('course_date')
        .gte('course_date', dateRange.start)
        .lte('course_date', dateRange.end);
      
      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((registration) => {
        const dateStr = registration.course_date;
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });

      // Uložíme do cache
      registrationCache = {
        data: counts,
        timestamp: now
      };

      setRegistrationCounts(counts);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        title: "Chyba",
        description: "Nepodarilo sa načítať údaje o kapacite kurzov.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    fetchRegistrationCounts();
  }, [fetchRegistrationCounts]);

  // Funkcia na kontrolu či je deň plný
  const isFull = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return (registrationCounts[dateStr] || 0) >= 5;
  };

  // Povolené sú len stredy, štvrtky a piatky medzi 16. júlom a 6. augustom 2025 + kontrola kapacity
  const isDateDisabled = useCallback((date: Date) => {
    const dayOfWeek = date.getDay(); // 0 = nedeľa, 1 = pondelok, ... 6 = sobota
    const isNotAllowedDay = dayOfWeek !== 3 && dayOfWeek !== 4 && dayOfWeek !== 5; // nie streda, štvrtok, piatok
    
    // Povolené len medzi 16. júlom 2025 a 6. augustom 2025 (vrátane)
    const startDate = new Date(2025, 6, 16); // 16. júl 2025 (mesiac je 0-indexed)
    const endDate = new Date(2025, 7, 6); // 6. august 2025
    const isOutsideDateRange = date < startDate || date > endDate;
    
    return isNotAllowedDay || isOutsideDateRange || isFull(date);
  }, [registrationCounts]);

  const getDateBadge = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const count = registrationCounts[dateStr] || 0;
    
    if (count >= 5) {
      return <Badge variant="destructive" className="text-xs">Obsadené</Badge>;
    }
    
    if (count > 0) {
      return <Badge variant="secondary" className="text-xs">{count}/5</Badge>;
    }
    
    return null;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Jednoduchá kontrola - len či nie je plný
    if (isFull(date)) {
      toast({
        title: "Kurz je obsadený",
        description: "Na tento deň je už obsadených 5 miest.",
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
          Kurzy sa konajú v stredu, štvrtok a piatok
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
                    Obsadenosť: {(() => {
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      return registrationCounts[dateStr] || 0;
                    })()}/5
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Maximálna kapacita: 5 ľudí na kurz</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive/20 rounded"></div>
                <span>Dostupné dni: streda, štvrtok, piatok</span>
              </div>
               <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                <span>Vždy od 9:00 do 17:00</span>
               </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}