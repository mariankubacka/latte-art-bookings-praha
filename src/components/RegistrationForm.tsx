import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, Mail, Calendar, Clock, CheckCircle } from "lucide-react";

interface RegistrationFormProps {
  selectedDate: Date;
  onComplete: () => void;
}

export function RegistrationForm({ selectedDate, onComplete }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Chýbajú údaje",
        description: "Prosím vyplňte meno a e-mail.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Neplatný e-mail",
        description: "Prosím zadajte platný e-mail.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check current capacity
      const { data: existingRegistrations, error: countError } = await supabase
        .from('registrations')
        .select('id')
        .eq('course_date', selectedDate.toISOString().split('T')[0]);

      if (countError) throw countError;

      if (existingRegistrations && existingRegistrations.length >= 5) {
        toast({
          title: "Kurz je obsadený",
          description: "Na tento deň je už obsadených 5 miest. Vyberte si iný termín.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already registered for this date
      const { data: existingUser, error: userError } = await supabase
        .from('registrations')
        .select('id')
        .eq('course_date', selectedDate.toISOString().split('T')[0])
        .eq('participant_email', email.toLowerCase());

      if (userError) throw userError;

      if (existingUser && existingUser.length > 0) {
        toast({
          title: "Už ste prihlásený",
          description: "Na tento deň ste už prihlásený s týmto e-mailom.",
          variant: "destructive",
        });
        return;
      }

      // Register the user
      const { error: insertError } = await supabase
        .from('registrations')
        .insert({
          course_date: selectedDate.toISOString().split('T')[0],
          participant_name: name.trim(),
          participant_email: email.toLowerCase().trim(),
        });

      if (insertError) throw insertError;

      setIsSuccess(true);
      
      // Kratší toast, ktorý rýchlo zmizne
      toast({
        title: "Úspešne prihlásený!",
        description: `Rezervácia potvrdená pre ${selectedDate.toLocaleDateString('sk-SK')}`,
        duration: 2000, // Toast zmizne po 2 sekundách
      });

      // Zavoláme onComplete aby sa aktualizoval kalendár
      onComplete();

      // Nevoláme zatvorenie okna - okno zostane otvorené

    } catch (error) {
      console.error('Registration error details:', error);
      
      // Zobrazíme detailnú chybu pre debugging
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba';
      console.log('Error message:', errorMessage);
      console.log('Selected date:', selectedDate.toISOString().split('T')[0]);
      console.log('Day of week:', selectedDate.getDay()); // 0=nedeľa, 1=pondelok, ..., 3=streda
      
      toast({
        title: "Chyba pri registrácii",
        description: `Detaily chyby: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-700">Úspešne prihlásený!</h3>
            <p className="text-muted-foreground">
              Úspešne ste sa prihlásili na kurz latte art.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                Vidíme sa o 9:00 ({selectedDate.toLocaleDateString('sk-SK', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })})!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Prihlásenie na kurz
        </CardTitle>
        <CardDescription>
          Vyplňte svoje údaje pre prihlásenie na kurz latte art
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Course Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Detaily kurzu</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {selectedDate.toLocaleDateString('sk-SK', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>9:00 - 17:00</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Meno a priezvisko *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Zadajte vaše meno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailová adresa *</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Informácia o kurze</p>
                  <p>
                    Na váš e-mail vám pošleme potvrdenie a ďalšie informácie o kurze.
                    Kurz prebieha v Prahe, presná adresa bude v potvrdení.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Prihlasuje sa..." : "Prihlásiť sa na kurz"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}