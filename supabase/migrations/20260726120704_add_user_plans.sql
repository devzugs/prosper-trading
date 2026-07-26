-- Phase 1: Add investment plan tracking to the profiles table

-- 1. Add the active_plan column with a CHECK constraint to prevent typos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_plan text 
CHECK (active_plan IN ('starter', 'growth', 'elite', 'supreme'));

-- 2. Add the plan_start_date to track when the ROI calculation should begin
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_start_date timestamptz;

-- 3. (Optional) Add comments to the columns for documentation purposes
COMMENT ON COLUMN public.profiles.active_plan IS 'The current active investment plan tier for the user (starter, growth, elite, supreme).';
COMMENT ON COLUMN public.profiles.plan_start_date IS 'The exact timestamp when the current plan was activated to calculate daily ROI.';