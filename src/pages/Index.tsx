import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarBooking } from "@/components/CalendarBooking";
import { RegistrationForm } from "@/components/RegistrationForm";
import { RegistrationSuccessCard } from "@/components/RegistrationSuccessCard";
import { AdminLoginPopup } from "@/components/AdminLoginPopup";
import { Coffee, Users, Award, Clock, Settings } from "lucide-react";
const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    date: Date;
    name: string;
    email: string;
  } | null>(null);
  console.log("🎯 Index component render - Dialog state:", isDialogOpen);
  const handleBookingComplete = (registrationData: {
    date: Date;
    name: string;
    email: string;
  }) => {
    // Nezatvárať automaticky okno - používateľ si ho môže zatvoriť manuálne
    setRegistrationSuccess(registrationData);
    setSelectedDate(null);
    // Aktualizujeme kalendár po úspešnej rezervácii
    setRefreshKey(prev => prev + 1);
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="sm" onClick={() => setIsAdminLoginOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Admin
        </Button>
      </header>

      <AdminLoginPopup isOpen={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen} />

      {/* Hero Section */}
      <section className="py-20 px-4 relative min-h-[80vh] flex items-center" style={{
      backgroundImage: `url('/lovable-uploads/baa00580-19f7-46c9-888d-6fe25505ec0e.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Coffee className="w-16 h-16 text-white animate-fade-in drop-shadow-lg" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white animate-fade-in drop-shadow-lg">
            Latte Art Kurzy v Prahe
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in drop-shadow-lg">
            Naučte sa vytvárať krásne vzory v káve s profesionálnym baristom. 
            Každý týždeň ponúkame intenzívne kurzy latte art pre všetky úrovne.
          </p>
          
           <Dialog open={isDialogOpen} onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset stavov pri zatvorení dialógu
            setSelectedDate(null);
            setRegistrationSuccess(null);
          }
        }}>
            <DialogTrigger asChild>
            <Button size="lg" className="text-lg px-8 py-6 hover-scale animate-fade-in bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" onClick={() => {
              console.log("🎯 Booking button clicked!");
              console.log("🎯 Current dialog state:", isDialogOpen);
              setIsDialogOpen(true);
              console.log("🎯 Dialog should now be open");
            }}>
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
                <CalendarBooking key={refreshKey} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                {selectedDate && <RegistrationForm selectedDate={selectedDate} onComplete={handleBookingComplete} />}
                {registrationSuccess && <RegistrationSuccessCard registrationData={registrationSuccess} />}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-secondary/30">
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
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-fade-in">Na čo sa môžete tešiť</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold mb-4">Skúsení školitelia</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Viac ako 10 rokov praxe</li>
                <li>• Absolventi medzinárodných kurzov</li>
                <li>• Víťazi baristských súťaží</li>
                <li>• Individuálny prístup ku každému</li>
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
          
           <Dialog open={isDialogOpen} onOpenChange={open => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedDate(null);
            setRegistrationSuccess(null);
          }
        }}>
            <DialogTrigger asChild>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 hover-scale animate-fade-in shadow-lg" onClick={() => {
              console.log("🎯 Second booking button clicked!");
              console.log("🎯 Current dialog state:", isDialogOpen);
              setIsDialogOpen(true);
              console.log("🎯 Dialog should now be open (second button)");
            }}>
                Rezervovať kurz teraz
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </section>
    </div>;
};
export default Index;