import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarBooking } from "@/components/CalendarBooking";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Coffee, Users, Award, Clock, Settings } from "lucide-react";

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleBookingComplete = () => {
    // Nezatvárať automaticky okno - používateľ si ho môže zatvoriť manuálne
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-4 right-4 z-10">
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-6">
            <Coffee className="w-16 h-16 text-primary animate-fade-in" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground animate-fade-in">
            Latte Art Kurzy v Prahe
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed animate-fade-in">
            Naučte sa vytvárať krásne vzory v káve s profesionálnym baristom. 
            Každý týždeň ponúkame intenzívne kurzy latte art pre všetky úrovne.
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 hover-scale animate-fade-in"
              >
                Prihlásiť sa na kurz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-center">
                  Rezervácia kurzu latte art
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid lg:grid-cols-2 gap-6 p-4">
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
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">O kurzoch</h2>
            <p className="text-lg text-muted-foreground animate-fade-in">
              Profesionálne kurzy latte art s osobným prístupom a malými skupinkami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover-scale animate-fade-in">
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

            <Card className="hover-scale animate-fade-in">
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

            <Card className="hover-scale animate-fade-in">
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
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">Čo sa naučíte</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold mb-4">Základné techniky</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Správne napěňování mléka</li>
                <li>• Základy kreslenia v káve</li>
                <li>• Tvorba srdca a rozety</li>
                <li>• Práca s rôznymi typmi mlieka</li>
              </ul>
            </div>
            
            <div className="animate-fade-in">
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
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">
            Pripravení začať svoju latte art cestu?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in">
            Vyberte si termín a staňte sa majstrom latte art!
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 hover-scale animate-fade-in"
              >
                Rezervovať kurz teraz
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>
    </div>
  );
};

export default Index;
