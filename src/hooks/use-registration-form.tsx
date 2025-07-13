import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRecaptchaSettings } from "@/hooks/use-recaptcha-settings";
import { RecaptchaComponentRef } from "@/components/RecaptchaComponent";

interface UseRegistrationFormProps {
  selectedDate: Date;
  onComplete: (registrationData: { date: Date; name: string; email: string }) => void;
}

export function useRegistrationForm({ selectedDate, onComplete }: UseRegistrationFormProps) {
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

  const validateForm = () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Chýbajú údaje",
        description: "Prosím vyplňte meno a e-mail.",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Neplatný e-mail",
        description: "Prosím zadajte platný e-mail.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleReCaptchaValidation = async () => {
    // Ak nie je nastavená ReCaptcha, pokračuj bez validácie
    if (!recaptchaSettings?.site_key || !recaptchaRef.current) {
      return null;
    }

    console.log('🔄 Starting ReCaptcha v3 validation...');
    
    // Reset token pred novým pokusom
    setRecaptchaToken(null);
    
    // Vytvoríme promise pre získanie tokenu
    const tokenPromise = new Promise<string | null>((resolve, reject) => {
      // Timeout po 10 sekundách
      const timeout = setTimeout(() => {
        console.error('❌ ReCaptcha timeout');
        reject(new Error('ReCaptcha timeout'));
      }, 10000);

      // Dočasne nahradíme callback
      const originalCallback = handleRecaptchaChange;
      const tempCallback = (token: string | null) => {
        clearTimeout(timeout);
        console.log('✅ ReCaptcha token received:', token?.substring(0, 20) + '...');
        originalCallback(token); // Zavoláme pôvodný callback
        resolve(token);
      };

      // Nastavíme dočasný callback a spustíme execute
      if (recaptchaRef.current) {
        // Hack: pristúpime priamo k ReCaptcha instance cez ref
        const recaptchaInstance = (recaptchaRef.current as any).recaptchaRef?.current;
        if (recaptchaInstance) {
          recaptchaInstance.props.onChange = tempCallback;
        }
        recaptchaRef.current.execute();
      } else {
        clearTimeout(timeout);
        reject(new Error('ReCaptcha ref not available'));
      }
    });

    try {
      const captchaToken = await tokenPromise;
      
      if (!captchaToken) {
        toast({
          title: "ReCaptcha overenie",
          description: "ReCaptcha overenie zlyhalo. Skúste to znovu.",
          variant: "destructive",
        });
        return null;
      }

      // Validácia cez edge function
      console.log('🔐 Validating ReCaptcha token...');
      
      const recaptchaResponse = await supabase.functions.invoke('validate-recaptcha', {
        body: {
          token: captchaToken,
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
        return null;
      }
      
      console.log('✅ ReCaptcha validation successful');
      return captchaToken;

    } catch (error) {
      console.error('❌ ReCaptcha error:', error);
      toast({
        title: "ReCaptcha overenie",
        description: "ReCaptcha overenie zlyhalo. Skúste to znovu.",
        variant: "destructive",
      });
      return null;
    }
  };

  const registerUser = async () => {
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
      return false;
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
      return false;
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const captchaToken = await handleReCaptchaValidation();
      if (recaptchaSettings?.site_key && captchaToken === null) {
        setIsSubmitting(false);
        return;
      }

      const success = await registerUser();
      if (!success) {
        setIsSubmitting(false);
        return;
      }
      
      // Kratší toast, ktorý rýchlo zmizne
      toast({
        title: "Úspešne prihlásený!",
        description: `Rezervácia potvrdená pre ${selectedDate.toLocaleDateString('sk-SK')}`,
        duration: 2000,
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

    } catch (error) {
      console.error('Registration error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Neznáma chyba';
      console.log('Error message:', errorMessage);
      console.log('Selected date:', selectedDate.toISOString().split('T')[0]);
      console.log('Day of week:', selectedDate.getDay());
      
      toast({
        title: "Chyba pri registrácii",
        description: `Detaily chyby: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    isSubmitting,
    recaptchaToken,
    recaptchaRef,
    recaptchaSettings,
    isLoadingRecaptcha,
    handleRecaptchaChange,
    handleSubmit
  };
}