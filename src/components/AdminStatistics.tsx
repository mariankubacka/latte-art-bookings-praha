import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, CurrencyIcon as Currency } from "lucide-react";
import { format } from "date-fns";
import { sk } from "date-fns/locale";

interface Registration {
  id: string;
  course_date: string;
  participant_name: string;
  participant_email: string;
  created_at: string;
}

interface DateStats {
  date: string;
  count: number;
  percentage: number;
}

interface CountryStats {
  country: string;
  count: number;
  percentage: number;
}

const COURSE_PRICE = 5000;
const MAX_PARTICIPANTS_PER_DATE = 5; // Maximálna kapacita na termín

export const AdminStatistics = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStats, setDateStats] = useState<DateStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (registrations.length > 0) {
      calculateStatistics();
    }
  }, [registrations]);

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

  const calculateStatistics = () => {
    // Štatistiky podľa dátumov
    const dateGroups = registrations.reduce((groups, registration) => {
      const date = registration.course_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(registration);
      return groups;
    }, {} as Record<string, Registration[]>);

    const dateStatsData = Object.entries(dateGroups).map(([date, regs]) => ({
      date,
      count: regs.length,
      percentage: Math.round((regs.length / MAX_PARTICIPANTS_PER_DATE) * 100),
    }));

    setDateStats(dateStatsData);

    // Štatistiky podľa krajín
    const countryGroups = registrations.reduce((groups, registration) => {
      const email = registration.participant_email.toLowerCase();
      let country = "Ostatné";
      
      if (email.endsWith(".sk")) {
        country = "Slovensko";
      } else if (email.endsWith(".cz")) {
        country = "Česko";
      }

      if (!groups[country]) {
        groups[country] = 0;
      }
      groups[country]++;
      return groups;
    }, {} as Record<string, number>);

    const countryStatsData = Object.entries(countryGroups).map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / registrations.length) * 100),
    }));

    setCountryStats(countryStatsData);

    // Celkové tržby
    setTotalRevenue(registrations.length * COURSE_PRICE);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Načítavam štatistiky...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Celkové štatistiky */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Celkový počet účastníkov
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Teoretické tržby
            </CardTitle>
            <Currency className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString("sk-SK")} Kč
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Počet termínov
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dateStats.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Obsadenosť termínov */}
      <Card>
        <CardHeader>
          <CardTitle>Obsadenosť termínov</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dateStats.map((stat) => (
              <div key={stat.date} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">
                    {format(new Date(stat.date), "EEEE, d. MMMM yyyy", { locale: sk })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.count} / {MAX_PARTICIPANTS_PER_DATE} účastníkov
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Štatistiky krajín */}
      <Card>
        <CardHeader>
          <CardTitle>Rozdelenie podľa krajín</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryStats.map((stat) => (
              <div key={stat.country} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{stat.country}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.count} účastníkov
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-secondary h-2 rounded-full" 
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};