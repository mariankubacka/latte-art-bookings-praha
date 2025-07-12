import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarBooking } from "@/components/CalendarBooking";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Coffee, Users, Award, Clock } from "lucide-react";

const Index = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleBookingComplete = () => {
    setShowBooking(false);
    setSelectedDate(null);
  };

  if (showBooking) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => setShowBooking(false)}
              className="mb-6"
            >
              ← Späť na úvod
            </Button>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <CalendarBooking 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
              {selectedDate && (
                <RegistrationForm 
                  selectedDate={selectedDate}
                  onComplete={handleBookingComplete}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Coffee className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Latte Art Kurzy v Prahe
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Naučte sa vytvárať krásne vzory v káve s profesionálnym baristom. 
            Každý týždeň ponúkame intenzívne kurzy latte art pre všetky úrovne.
          </p>
          <Button 
            size="lg" 
            onClick={() => setShowBooking(true)}
            className="text-lg px-8 py-6"
          >
            Prihlásiť sa na kurz
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O kurzoch</h2>
            <p className="text-lg text-muted-foreground">
              Profesionálne kurzy latte art s osobným prístupom a malými skupinkami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Flexibilný čas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Kurzy prebíhajú streda až piatok, vždy od 9:00 do 17:00. 
                  Vyberte si deň, ktorý vám vyhovuje.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Malé skupiny</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Maximálne 5 účastníkov na kurz pre individuálny prístup 
                  a kvalitné učenie.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <CardTitle>Profesionálny barista</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Učíte sa od skúseného baristu s rokmi praxe 
                  v najlepších kaviarňach Prahy.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Course Details */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Čo sa naučíte</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Základné techniky</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Správne napěňování mléka</li>
                <li>• Základy kreslenia v káve</li>
                <li>• Tvorba srdca a rozety</li>
                <li>• Práca s rôznymi typmi mlieka</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Pokročilé vzory</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Tulipán a viacvrstvové vzory</li>
                <li>• Labuť a ďalšie zvieratá</li>
                <li>• Vlastné kreatívne návrhy</li>
                <li>• Tipy pre domáce používanie</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pripravení začať svoju latte art cestu?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Vyberte si termín a staňte sa majstrom latte art!
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => setShowBooking(true)}
            className="text-lg px-8 py-6"
          >
            Rezervovať kurz teraz
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
