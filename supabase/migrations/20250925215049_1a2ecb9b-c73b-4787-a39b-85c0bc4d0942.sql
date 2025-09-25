-- Enable RLS on reference tables and add appropriate policies
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read exercises and achievements (reference data)
CREATE POLICY "Everyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);