-- Add learning_style column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN learning_style TEXT CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading_writing'));

-- Add learning_preferences column for detailed preferences
ALTER TABLE public.profiles 
ADD COLUMN learning_preferences JSONB DEFAULT '{}';
