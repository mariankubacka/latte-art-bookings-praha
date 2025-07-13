-- Vytvorenie tabuľky pre ReCaptcha nastavenia
CREATE TABLE public.recaptcha_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Povoliť len jeden záznam v tabuľke
ALTER TABLE public.recaptcha_settings 
ADD CONSTRAINT recaptcha_settings_single_row 
CHECK (id = 1);

-- Povoliť Row Level Security
ALTER TABLE public.recaptcha_settings ENABLE ROW LEVEL SECURITY;

-- Politiky RLS - len pre všetkých (keďže nemáme auth systém)
CREATE POLICY "Anyone can view recaptcha settings" 
ON public.recaptcha_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update recaptcha settings" 
ON public.recaptcha_settings 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert recaptcha settings" 
ON public.recaptcha_settings 
FOR INSERT 
WITH CHECK (true);

-- Trigger na automatické aktualizovanie updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recaptcha_settings_updated_at
  BEFORE UPDATE ON public.recaptcha_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();