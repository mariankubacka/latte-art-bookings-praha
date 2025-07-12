-- Opraviť bezpečnostné nastavenie funkcie check_course_date_weekday
CREATE OR REPLACE FUNCTION public.check_course_date_weekday()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skontrolovať či je dátum streda (3), štvrtok (4) alebo piatok (5)
  IF EXTRACT(dow FROM NEW.course_date) NOT IN (3, 4, 5) THEN
    RAISE EXCEPTION 'Kurzy sa konajú len v stredu, štvrtok a piatok. Dátum % nie je platný.', NEW.course_date;
  END IF;
  
  RETURN NEW;
END;
$$;