import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecaptchaSettings {
  site_key: string;
  secret_key: string;
}

export function useRecaptchaSettings() {
  const [settings, setSettings] = useState<RecaptchaSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('recaptcha_settings')
          .select('site_key, secret_key')
          .single();

        if (error) {
          // Ak sa tabuľka nenájde alebo nie sú žiadne záznamy, to nie je chyba
          if (error.code === 'PGRST116' || error.code === '42P01') {
            console.log('ReCaptcha settings not configured yet');
            setSettings(null);
            return;
          }
          throw error;
        }

        setSettings(data);
      } catch (err) {
        console.error('Error fetching ReCaptcha settings:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setSettings(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, isLoading, error };
}