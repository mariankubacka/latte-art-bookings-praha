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

      {/* Footer */}
      <footer className="py-12 px-4 bg-muted-foreground text-muted">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Coffee className="w-6 h-6 mr-2" />
                Latte Art Kurzy Praha
              </h3>
              <p className="text-primary-foreground/80 mb-4">
                Profesionálne kurzy latte art v srdci Prahy. Naučte sa vytvárať úžasné vzory v káve pod vedením skúsených baristov.
              </p>
              <p className="text-sm text-primary-foreground/60">
                Streda - Piatok: 9:00 - 17:00
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Rýchle odkazy</h4>
              <ul className="space-y-2 text-primary-foreground/80">
                <li>• Základné techniky</li>
                <li>• Pokročilé vzory</li>
                <li>• Skúsení školitelia</li>
                <li>• Rezervácia kurzu</li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Sledujte nás</h4>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.754-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <p className="text-sm text-primary-foreground/60">
                📧 info@latteartpraha.sk<br />
                📞 +420 123 456 789
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-primary-foreground/60 mb-4 md:mb-0">
              © 2024 Latte Art Kurzy Praha. Všetky práva vyhradené.
            </p>
            <p className="text-sm text-primary-foreground/60 italic text-center md:text-right">
              Vzniklo medzi obedom a večerou, počas vypitia štyroch káv cez AI nástroj Lovable ☕
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;