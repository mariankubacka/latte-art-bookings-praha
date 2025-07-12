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

// Cache pre registrácie - uložíme si dáta aby sa nemuseli načítavať znovu
let registrationCache: { data: Record<string, number>; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minút

export function CalendarBooking({ selectedDate, onDateSelect }: CalendarBookingProps) {
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Helper funkcia pre kontrolu sviatkov - definujeme na začiatku
  const isHolidayCheck = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return czechHolidays.includes(dateStr);
  }, []);

  // Memoizujeme dátumové rozsahy pre lepšiu výkonnosť
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Začíname 16.8.2024 a max 10 termínov
    const startDate = new Date('2024-08-16');
    const actualStart = today > startDate ? today : startDate;
    
    // Vypočítame konečný dátum na základe max 10 termínov
    // Hľadáme 10 pracovných dní (streda-piatok) od začiatku
    let availableDates = 0;
    let currentDate = new Date(actualStart);
    let endDate = new Date(actualStart);
    
    while (availableDates < 10) {
      const day = currentDate.getDay();
      if (day >= 3 && day <= 5 && !isHolidayCheck(currentDate)) { // Wed-Fri, not holiday
        availableDates++;
        endDate = new Date(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Safety break po 100 dňoch
      if (currentDate.getTime() - actualStart.getTime() > 100 * 24 * 60 * 60 * 1000) {
        break;
      }
    }
    
    return {
      start: actualStart.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  }, [isHolidayCheck]);


  const fetchRegistrationCounts = useCallback(async () => {
    // Skontrolujeme cache
    const now = Date.now();
    if (registrationCache && (now - registrationCache.timestamp) < CACHE_DURATION) {
      setRegistrationCounts(registrationCache.data);
      setIsLoading(false);
      return;
    }

    try {
      // Safari-friendly fetch s explicitným timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
      
      // Optimalizovaný dotaz - iba relevantné dátumy pre nadchádzajúce 2 mesiace
      const { data, error } = await supabase
        .from('registrations')
        .select('course_date')
        .gte('course_date', dateRange.start)
        .lte('course_date', dateRange.end)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      
      if (error) {
        console.error('Calendar fetch error:', error);
        throw error;
      }

      const counts: Record<string, number> = {};
      data.forEach((registration) => {
        const dateStr = registration.course_date;
        counts[dateStr] = (counts[dateStr] || 0) + 1;
      });

      console.log("📅 Fetched registration data:", data);
      console.log("📅 Calculated counts:", counts);

      // Uložíme do cache
      registrationCache = {
        data: counts,
        timestamp: now
      };

      setRegistrationCounts(counts);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      
      // Safari-specific error handling
      const errorMessage = error?.name === 'AbortError' 
        ? "Načítanie kalendára trvá príliš dlho. Skúste obnoviť stránku."
        : "Nepodarilo sa načítať údaje o kapacite kurzov.";
        
      toast({
        title: "Chyba",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    fetchRegistrationCounts();
  }, [fetchRegistrationCounts]);

  const isWeekday = (date: Date) => {
    const day = date.getDay();
    return day >= 3 && day <= 5; // Wednesday (3) to Friday (5)
  };

  const isHoliday = useCallback((date: Date) => {
    // Safari-friendly date formatting - použitie lokálneho času
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return czechHolidays.includes(dateStr);
  }, []);

  const isFull = (date: Date) => {
    // Safari-friendly date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return (registrationCounts[dateStr] || 0) >= 5;
  };

  const isDateDisabled = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date('2024-08-16');
    const actualStart = today > startDate ? today : startDate;
    
    // Počítame dostupné termíny od začiatku
    let availableDates = 0;
    let currentDate = new Date(actualStart);
    let isWithinLimit = false;
    
    while (currentDate <= date && availableDates < 10) {
      const day = currentDate.getDay();
      if (day >= 3 && day <= 5 && !isHolidayCheck(currentDate)) {
        availableDates++;
        if (currentDate.getTime() === date.getTime()) {
          isWithinLimit = true;
          break;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Safety break po 100 dňoch
      if (currentDate.getTime() - actualStart.getTime() > 100 * 24 * 60 * 60 * 1000) {
        break;
      }
    }
    
    return (
      date < actualStart || 
      !isWithinLimit ||
      !isWeekday(date) || 
      isHoliday(date) || 
      isFull(date)
    );
  }, [registrationCounts, isHolidayCheck, isHoliday]);

  const getDateBadge = (date: Date) => {
    // Safari-friendly date formatting
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
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
                    Obsadenosť: {(() => {
                      const year = selectedDate.getFullYear();
                      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                      const day = String(selectedDate.getDate()).padStart(2, '0');
                      const dateStr = `${year}-${month}-${day}`;
                      const count = registrationCounts[dateStr] || 0;
                      console.log("📅 Displaying count for", dateStr, ":", count, "registrationCounts:", registrationCounts);
                      return count;
                    })()}/5
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
                <span>Max. 10 termínov (od 16.8.)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}