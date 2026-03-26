-- Run this entire script in your Supabase SQL Editor to fix the silent chat failures!

-- 1. Remove any duplicate usage logs that might prevent the unique constraint from applying
DELETE FROM public.usage_logs a USING public.usage_logs b 
WHERE a.id < b.id AND a.user_id = b.user_id AND a.date = b.date;

-- 2. Add the missing unique constraint that the trigger relies on
ALTER TABLE public.usage_logs DROP CONSTRAINT IF EXISTS usage_logs_user_id_date_key;
ALTER TABLE public.usage_logs ADD CONSTRAINT usage_logs_user_id_date_key UNIQUE (user_id, date);
