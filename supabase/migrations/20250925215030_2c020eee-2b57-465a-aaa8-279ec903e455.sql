-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  fitness_goals TEXT,
  profile_picture_url TEXT,
  fitness_level INTEGER DEFAULT 1,
  total_points INTEGER DEFAULT 0,
  rank_title TEXT DEFAULT 'Beginner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises reference table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility'
  muscle_groups TEXT[], -- array of muscle groups
  equipment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workouts table
CREATE TABLE public.workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout exercises table (exercises within a workout)
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER[],
  weight DECIMAL(6,2)[],
  duration_seconds INTEGER,
  distance_km DECIMAL(6,3),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personal bests table
CREATE TABLE public.personal_bests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  best_weight DECIMAL(6,2),
  best_reps INTEGER,
  best_distance_km DECIMAL(6,3),
  best_duration_seconds INTEGER,
  achieved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 0,
  icon TEXT,
  requirement_type TEXT NOT NULL, -- 'workouts_count', 'streak_days', 'total_weight', etc.
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles for leaderboard" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for workouts
CREATE POLICY "Users can view their own workouts" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workouts" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view their own workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can create their own workout exercises" ON public.workout_exercises FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can update their own workout exercises" ON public.workout_exercises FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);
CREATE POLICY "Users can delete their own workout exercises" ON public.workout_exercises FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
);

-- RLS Policies for personal_bests
CREATE POLICY "Users can view all personal bests for leaderboards" ON public.personal_bests FOR SELECT USING (true);
CREATE POLICY "Users can manage their own personal bests" ON public.personal_bests FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some basic exercises
INSERT INTO public.exercises (name, category, muscle_groups, equipment) VALUES
('Bench Press', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'barbell'),
('Squat', 'strength', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'barbell'),
('Deadlift', 'strength', ARRAY['back', 'glutes', 'hamstrings'], 'barbell'),
('Pull-up', 'strength', ARRAY['back', 'biceps'], 'pull-up bar'),
('Push-up', 'strength', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight'),
('Running', 'cardio', ARRAY['legs'], 'none'),
('Cycling', 'cardio', ARRAY['legs'], 'bicycle'),
('Rowing', 'cardio', ARRAY['back', 'arms', 'legs'], 'rowing machine'),
('Bicep Curls', 'strength', ARRAY['biceps'], 'dumbbells'),
('Shoulder Press', 'strength', ARRAY['shoulders', 'triceps'], 'dumbbells');

-- Insert some achievements
INSERT INTO public.achievements (name, description, points_reward, requirement_type, requirement_value) VALUES
('First Workout', 'Complete your first workout', 100, 'workouts_count', 1),
('Consistent Trainee', 'Complete 10 workouts', 250, 'workouts_count', 10),
('Gym Veteran', 'Complete 50 workouts', 500, 'workouts_count', 50),
('Century Club', 'Complete 100 workouts', 1000, 'workouts_count', 100),
('Week Warrior', 'Complete 7 consecutive days of workouts', 300, 'streak_days', 7),
('Month Master', 'Complete 30 consecutive days of workouts', 1000, 'streak_days', 30);