-- Add accumulated historical data columns to profiles for accurate ROI carryover
ALTER TABLE public.profiles
ADD COLUMN accumulated_roi NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN accumulated_days INTEGER DEFAULT 0 NOT NULL;