-- Gamification: User stats and achievements
-- This tracks streaks, points, and achievements for motivation

-- User stats table (one row per user)
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Streaks
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  current_weekly_streak INTEGER DEFAULT 0,
  longest_weekly_streak INTEGER DEFAULT 0,
  last_daily_review_date DATE,
  last_weekly_review_date DATE,
  
  -- Points (simple XP system)
  total_points INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Achievements table (tracks which achievements user has earned)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- Activity log (for heatmap visualization)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'daily_review', 'weekly_review', 'goal_update', 'document_update'
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievement definitions (these are just IDs, the UI defines the display)
-- Achievement IDs:
-- first_daily_review - Complete your first daily review
-- first_weekly_review - Complete your first weekly review
-- foundation_complete - Complete North Star document
-- goals_complete - Set all three goal horizons
-- streak_7 - 7-day daily review streak
-- streak_30 - 30-day daily review streak
-- streak_100 - 100-day daily review streak
-- perfect_week - 7 daily reviews + 1 weekly review in a week
-- early_bird - Complete a review before 8am
-- night_owl - Complete a review after 10pm
-- comeback_kid - Return after 7+ days away

-- Points system:
-- Daily review: 10 points
-- Weekly review: 25 points
-- Goal update: 15 points
-- Document update: 20 points
-- Streak bonus: +5 points per day of streak (capped at +50)
-- Achievement earned: 50-200 points depending on difficulty

