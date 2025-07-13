import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRecaptchaSettings } from "@/hooks/use-recaptcha-settings";
import { RecaptchaComponent, RecaptchaComponentRef } from "@/components/RecaptchaComponent";
import { UserCheck, Mail, Calendar, Clock, Shield } from "lucide-react";

interface RegistrationFormProps {
  selectedDate: Date;
  onComplete: (registrationData: { date: Date; name: string; email: string }) => void;
}

export function RegistrationForm({ selectedDate, onComplete }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaComponentRef>(null);
  const { settings: recaptchaSettings, isLoading: isLoadingRecaptcha } = useRecaptchaSettings();
  const { toast } = useToast();

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

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
      // Pre ReCaptcha v3 spustíme execute na začiatku
      if (recaptchaSettings?.site_key && recaptchaRef.current) {
        console.log('🔄 Executing ReCaptcha v3...');
        recaptchaRef.current.execute();
        
        // Počkáme na token (callback môže trvať chvíľu)
        let attempts = 0;
        while (!recaptchaToken && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        
        if (!recaptchaToken) {
          toast({
            title: "ReCaptcha overenie",
            description: "ReCaptcha overenie zlyhalo. Skúste to znovu.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }
      // ReCaptcha validácia - len ak je nastavená
      if (recaptchaSettings?.site_key && recaptchaToken) {
        console.log('🔐 Validating ReCaptcha token...');
        
        const recaptchaResponse = await supabase.functions.invoke('validate-recaptcha', {
          body: {
            token: recaptchaToken,
            userInfo: {
              name: name.trim(),
              email: email.toLowerCase().trim()
            }
          }
        });

        if (recaptchaResponse.error || !recaptchaResponse.data?.success) {
          console.error('❌ ReCaptcha validation failed:', recaptchaResponse);
          toast({
            title: "Bezpečnostné overenie zlyhalo",
            description: "Prosím skúste znova alebo obnovte stránku.",
            variant: "destructive",
          });
          // Reset ReCaptcha
          recaptchaRef.current?.reset();
          setRecaptchaToken(null);
          return;
        }
        
        console.log('✅ ReCaptcha validation successful');
      }

      // Formatujeme dátum bez timezone konverzie
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('🗓️ Registration Debug:');
      console.log('Selected Date object:', selectedDate);
      console.log('Date for DB (formatted):', dateStr);
      console.log('ISO string (problematic):', selectedDate.toISOString().split('T')[0]);
      
      // Check current capacity
      const { data: existingRegistrations, error: countError } = await supabase
        .from('registrations')
        .select('id')
        .eq('course_date', dateStr);

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
        .eq('course_date', dateStr)
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
          course_date: dateStr,
          participant_name: name.trim(),
          participant_email: email.toLowerCase().trim(),
        });
        
      console.log('✅ Registration successful with date:', dateStr);

      if (insertError) throw insertError;

      
      
      // Kratší toast, ktorý rýchlo zmizne
      toast({
        title: "Úspešne prihlásený!",
        description: `Rezervácia potvrdená pre ${selectedDate.toLocaleDateString('sk-SK')}`,
        duration: 2000, // Toast zmizne po 2 sekundách
      });

      // Zavoláme onComplete s údajmi o registrácii
      onComplete({
        date: selectedDate,
        name: name.trim(),
        email: email.toLowerCase().trim()
      });

      // Reset ReCaptcha po úspešnej registrácii
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }

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

  // Už netreba renderovať success page tu, pretože sa zobrazuje v RegistrationSuccessCard

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

            {/* ReCaptcha v3 - neviditeľná, len informácia */}
            {!isLoadingRecaptcha && recaptchaSettings?.site_key && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm text-muted-foreground">
                    Táto stránka je chránená pomocou reCAPTCHA v3
                  </Label>
                </div>
                <RecaptchaComponent
                  ref={recaptchaRef}
                  onVerify={handleRecaptchaChange}
                  siteKey={recaptchaSettings?.site_key}
                />
              </div>
            )}

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