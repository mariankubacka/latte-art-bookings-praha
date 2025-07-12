-- Vymazať neplatné registrácie na utorok 15.7.2025
DELETE FROM registrations WHERE course_date = '2025-07-15';

-- Pridať trigger aby sa zabránilo registráciám mimo streda-piatok
CREATE OR REPLACE FUNCTION check_course_date_weekday()
RETURNS TRIGGER AS $$
BEGIN
  -- Skontrolovať či je dátum streda (3), štvrtok (4) alebo piatok (5)
  IF EXTRACT(dow FROM NEW.course_date) NOT IN (3, 4, 5) THEN
    RAISE EXCEPTION 'Kurzy sa konajú len v stredu, štvrtok a piatok. Dátum % nie je platný.', NEW.course_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplikovať trigger na tabuľku registrations
DROP TRIGGER IF EXISTS validate_course_weekday ON registrations;
CREATE TRIGGER validate_course_weekday
  BEFORE INSERT OR UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_course_date_weekday();