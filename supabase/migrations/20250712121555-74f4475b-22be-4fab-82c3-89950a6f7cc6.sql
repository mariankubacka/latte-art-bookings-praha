-- Create registrations table for latte art courses
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_date DATE NOT NULL,
  participant_name TEXT NOT NULL,
  participant_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view registrations (for capacity checking)
CREATE POLICY "Anyone can view registrations" 
ON public.registrations 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert registrations
CREATE POLICY "Anyone can create registrations" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance when checking capacity
CREATE INDEX idx_registrations_course_date ON public.registrations(course_date);