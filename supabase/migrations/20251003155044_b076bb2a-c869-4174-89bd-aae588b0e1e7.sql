-- Add body measurements table
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC,
  height NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  chest NUMERIC,
  waist NUMERIC,
  hips NUMERIC,
  biceps NUMERIC,
  thighs NUMERIC,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own measurements"
ON public.body_measurements
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add workout templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates or their own"
ON public.workout_templates
FOR SELECT
USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create their own templates"
ON public.workout_templates
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their own templates"
ON public.workout_templates
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own templates"
ON public.workout_templates
FOR DELETE
USING (auth.uid() = creator_id);

-- Add template exercises table
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  sets INTEGER,
  reps INTEGER[],
  weight NUMERIC[],
  notes TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view exercises from accessible templates"
ON public.template_exercises
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workout_templates
    WHERE id = template_exercises.template_id
    AND (is_public = true OR creator_id = auth.uid())
  )
);

CREATE POLICY "Users can manage exercises in their templates"
ON public.template_exercises
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.workout_templates
    WHERE id = template_exercises.template_id
    AND creator_id = auth.uid()
  )
);

-- Add user follows table for social features
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
ON public.user_follows
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own follows"
ON public.user_follows
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
ON public.user_follows
FOR DELETE
USING (auth.uid() = follower_id);

-- Add workout shares table
CREATE TABLE IF NOT EXISTS public.workout_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all shared workouts"
ON public.workout_shares
FOR SELECT
USING (true);

CREATE POLICY "Users can share their own workouts"
ON public.workout_shares
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workouts
    WHERE id = workout_shares.workout_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own shares"
ON public.workout_shares
FOR ALL
USING (auth.uid() = user_id);

-- Add workout likes table
CREATE TABLE IF NOT EXISTS public.workout_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public.workout_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(share_id, user_id)
);

ALTER TABLE public.workout_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all likes"
ON public.workout_likes
FOR SELECT
USING (true);

CREATE POLICY "Users can manage their own likes"
ON public.workout_likes
FOR ALL
USING (auth.uid() = user_id);

-- Add coach groups table
CREATE TABLE IF NOT EXISTS public.coach_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage their groups"
ON public.coach_groups
FOR ALL
USING (auth.uid() = coach_id);

-- Add group members table (must come before policy that references it)
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.coach_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Now add the policy for coach_groups that references group_members
CREATE POLICY "Users can view groups they're in"
ON public.coach_groups
FOR SELECT
USING (
  auth.uid() = coach_id OR
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = coach_groups.id
    AND user_id = auth.uid()
  )
);

-- Add policies for group_members
CREATE POLICY "Coaches and members can view group members"
ON public.group_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coach_groups
    WHERE id = group_members.group_id
    AND coach_id = auth.uid()
  ) OR
  user_id = auth.uid()
);

CREATE POLICY "Coaches can manage their group members"
ON public.group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.coach_groups
    WHERE id = group_members.group_id
    AND coach_id = auth.uid()
  )
);

-- Add video tutorials to exercises
ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS instructions TEXT;

-- Add triggers for updated_at
CREATE TRIGGER update_workout_templates_updated_at
BEFORE UPDATE ON public.workout_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coach_groups_updated_at
BEFORE UPDATE ON public.coach_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();